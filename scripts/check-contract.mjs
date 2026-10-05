// Fixture-only local-provider checks. No server, environment secrets, or model calls.
import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import app from '../worker/index.js';

const endpoint = 'http://127.0.0.1:11434/v1/systemone';
const model = 'clef-flash:9b-q8_0';
const input = {bedId: 'MAT-02', note: 'Pain 4/5; mobility assessment pending.'};
const request = (data, origin = 'https://bedboard.test') => new Request('https://bedboard.test/api/jev', {
  method: 'POST', headers: {Origin: origin, 'Content-Type': 'application/json'},
  body: typeof data === 'string' ? data : JSON.stringify(data),
});
const fixture = {
  model,
  answers: {
    progress: {type: 'choice', choice: 'needs_review', probabilities: {improving: 0.02, needs_review: 0.96, unclear: 0.02}, confidence: 0.9},
    delay: {type: 'noul', noul: 0.95},
  },
  usage: {input_tokens: 100, output_tokens: 20},
};

async function withProvider(provider, run) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({url, options});
    return provider(url, options);
  };
  try { await run(calls); } finally { globalThis.fetch = original; }
}

test('the browser script parses', async () => {
  const html = await (await app.fetch(new Request('https://bedboard.test/'), {})).text();
  new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
});

test('invalid notes, beds, request JSON and origins never reach a provider', async () => {
  await withProvider(() => Response.json(fixture), async calls => {
    assert.equal((await app.fetch(request(input, 'https://other.test'), {})).status, 403);
    assert.equal((await app.fetch(request(input, ''), {})).status, 403);
    assert.equal((await app.fetch(request('{'), {})).status, 400);
    for (const data of [null, [], {...input, bedId: 'unknown'}, {...input, note: ''}, {...input, note: '   '}, {...input, note: 123}, {...input, note: 'x'.repeat(2001)}]) {
      assert.equal((await app.fetch(request(data), {})).status, 400);
    }
    assert.equal((await app.fetch(request('x'.repeat(6001)), {})).status, 413);
    assert.equal(calls.length, 0);
  });
});

test('a keyless note uses local System One and preserves the existing decision contract', async () => {
  await withProvider((url, options) => {
    assert.equal(url, endpoint);
    assert.equal(options.method, 'POST');
    const headers = new Headers(options.headers);
    assert.equal(headers.get('Authorization'), null);
    assert.equal(headers.get('Content-Type'), 'application/json');
    assert.equal(options.redirect, 'manual', 'a local response must not redirect the request to the cloud');
    assert.ok(options.signal instanceof AbortSignal, 'inference must have a timeout signal');
    const payload = JSON.parse(options.body);
    assert.deepEqual(Object.keys(payload).sort(), ['model', 'questions', 'state']);
    assert.equal(payload.model, model);
    assert.deepEqual(payload.state, {procedure: 'Cesarean section', pain: 4, progress: '4/8 milestones met', note: input.note});
    assert.equal(payload.questions.progress.type, 'choice');
    assert.deepEqual(Object.keys(payload.questions.progress.criteria), ['improving', 'needs_review', 'unclear']);
    assert.match(payload.questions.progress.instructions, /Do not decide discharge or availability/);
    assert.equal(payload.questions.delay.type, 'noul');
    return Response.json(fixture);
  }, async calls => {
    const response = await app.fetch(request(input), {});
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.deepEqual(await response.json(), fixture);
    assert.equal(calls.length, 1);
  });
});

test('browser overrides and synthetic TypeSafe keys cannot control or credential local inference', async () => {
  const browserKey = 'fixture-browser-key-must-not-leave';
  const serverKey = 'fixture-server-key-must-not-leave';
  const hostile = {...input, apiKey: browserKey, endpoint: 'https://api.typesafe.ai/v1/systemone',
    baseUrl: 'https://remote.test', OLLAMA_BASE_URL: 'https://remote.test',
    model: 'jev-latest', OLLAMA_MODEL: 'jev-latest'};
  await withProvider((url, options) => {
    assert.equal(url, endpoint);
    assert.equal(new Headers(options.headers).get('Authorization'), null);
    const serialized = JSON.stringify({url, headers: [...new Headers(options.headers)], body: options.body});
    for (const key of [browserKey, serverKey]) assert.equal(serialized.includes(key), false);
    const payload = JSON.parse(options.body);
    assert.equal(payload.model, model);
    assert.equal(payload.state.note, input.note);
    assert.equal(options.body.includes('remote.test'), false);
    assert.equal(options.body.includes('jev-latest'), false);
    return Response.json(fixture);
  }, async calls => {
    const response = await app.fetch(request(hostile), {TYPESAFE_API_KEY: serverKey});
    assert.equal(response.status, 200);
    const text = await response.text();
    for (const key of [browserKey, serverKey]) assert.equal(text.includes(key), false);
    assert.equal(calls.length, 1);
  });
});

test('only server settings select supported local hosts and Clef GGUF models', async () => {
  const cases = [
    ['http://localhost:11435', 'clef-flash:9b-q8_0'],
    ['http://127.0.0.1:11434/', 'clef:27b-q4_k_m'],
    ['http://[::1]:11434', 'clef-flash:9b-q8_0'],
    ['http://host.docker.internal:11434', 'clef:27b-q4_k_m'],
  ];
  for (const [baseUrl, selectedModel] of cases) {
    await withProvider((url, options) => {
      assert.equal(url, baseUrl.replace(/\/$/, '') + '/v1/systemone');
      assert.equal(JSON.parse(options.body).model, selectedModel);
      assert.equal(new Headers(options.headers).get('Authorization'), null);
      return Response.json({...fixture, model: selectedModel});
    }, async calls => {
      const response = await app.fetch(request(input), {OLLAMA_BASE_URL: baseUrl, OLLAMA_MODEL: selectedModel});
      assert.equal(response.status, 200);
      assert.equal((await response.json()).model, selectedModel);
      assert.equal(calls.length, 1);
    });
  }
});

test('unsafe local URLs and unsupported models fail before any network request', async () => {
  const unsafeUrls = [
    'https://127.0.0.1:11434', 'https://remote.test', 'http://192.168.1.10:11434',
    'http://localhost.remote.test:11434', 'http://127.0.0.1.remote.test:11434',
    'http://host.docker.internal.remote.test:11434', 'http://remote.test@127.0.0.1:11434',
    'http://user:fixture-secret@localhost:11434', 'http://localhost:11434/?url=https://remote.test',
    'http://localhost:11434/#private-fragment', 'http://localhost:11434/v1/systemone',
    'file:///tmp/ollama', 'not a URL',
  ];
  const settings = unsafeUrls.map(OLLAMA_BASE_URL => ({OLLAMA_BASE_URL}));
  for (const OLLAMA_MODEL of ['qwen3:4b', 'clef-flash:latest', 'clef-flash:9b-mlx', 'clef:27b-q4_k_m-cloud']) {
    settings.push({OLLAMA_MODEL});
  }
  await withProvider(() => Response.json(fixture), async calls => {
    for (const env of settings) {
      const response = await app.fetch(request(input), env);
      assert.equal(response.status, 503, 'unsafe settings must not infer: ' + JSON.stringify(env));
      const error = (await response.json()).error;
      assert.equal(error, 'Invalid local model setup');
      assert.equal(error.includes('fixture-secret'), false);
      assert.equal(error.includes('remote.test'), false);
    }
    assert.equal(calls.length, 0, 'invalid settings must neither reach a remote endpoint nor fall back to cloud');
  });
});

test('provider errors and redirects expose safe guidance and never fall back to cloud', async () => {
  for (const status of [302, 401, 404, 422, 429, 500, 503]) {
    await withProvider(url => {
      assert.equal(url, endpoint);
      return new Response('Private upstream secret must not appear', {status, headers: {Location: 'https://remote.test'}});
    }, async calls => {
      const response = await app.fetch(request(input), {});
      assert.equal(response.status, 502);
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      const {error} = await response.json();
      assert.match(error, status === 404 ? /Ollama model or System One endpoint was not found/i : new RegExp('Ollama request failed \\(HTTP ' + status + '\\)'));
      assert.equal(error.includes('secret'), false);
      assert.equal(error.includes('remote.test'), false);
      assert.equal(calls.length, 1);
    });
  }
});

test('malformed JSON and invalid decision fields cannot become a successful classification', async () => {
  const badChoice = {...fixture, answers: {...fixture.answers, progress: {...fixture.answers.progress, choice: 'wrong'}}};
  const badDelay = {...fixture, answers: {...fixture.answers, delay: {type: 'noul', noul: 2}}};
  for (const data of [null, {}, badChoice, badDelay]) {
    await withProvider(url => {assert.equal(url, endpoint); return Response.json(data);}, async calls => {
      assert.equal((await app.fetch(request(input), {})).status, 502);
      assert.equal(calls.length, 1);
    });
  }
  await withProvider(url => {assert.equal(url, endpoint); return new Response('Private invalid JSON');}, async calls => {
    const response = await app.fetch(request(input), {});
    assert.equal(response.status, 502);
    assert.equal((await response.text()).includes('Private'), false);
    assert.equal(calls.length, 1);
  });
});

test('unavailable Ollama and inference timeout fail safely with one local attempt', async () => {
  for (const failure of [Error('Private connection failure'), new DOMException('Private timeout detail', 'TimeoutError')]) {
    await withProvider((url, options) => {
      assert.equal(url, endpoint);
      assert.ok(options.signal instanceof AbortSignal);
      throw failure;
    }, async calls => {
      const response = await app.fetch(request(input), {});
      assert.equal(response.status, 502);
      assert.match((await response.json()).error, /Ollama connection failed or timed out/i);
      assert.equal(calls.length, 1);
    });
  }
});
