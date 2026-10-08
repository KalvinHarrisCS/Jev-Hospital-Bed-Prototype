// Fixture-only setup checks. No server, environment secrets, or model calls.
import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import app from '../worker/index.js';

const model = 'clef-flash:9b-q8_0';
const configRequest = new Request('https://bedboard.test/api/config');
const input = {bedId: 'MAT-02', note: 'Pain limits walking. Reassessment pending.'};
const fixture = {model, answers: {
  progress: {type: 'choice', choice: 'needs_review', confidence: 0.9, probabilities: {improving: 0.02, needs_review: 0.96, unclear: 0.02}},
  delay: {type: 'noul', noul: 0.95},
}, usage: {input_tokens: 100, output_tokens: 20}};
const html = await (await app.fetch(new Request('https://bedboard.test/'), {})).text();
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

test('config identifies keyless local mode and exposes no endpoint or credential', async () => {
  for (const env of [{}, {TYPESAFE_API_KEY: 'fixture-unused-secret'},
    {OLLAMA_BASE_URL: 'http://host.docker.internal:11434', OLLAMA_MODEL: 'clef:27b-q4_k_m'}]) {
    const response = await app.fetch(configRequest, env);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    const data = await response.json();
    assert.deepEqual(data, {provider: 'ollama', model: env.OLLAMA_MODEL || model, configured: true});
    assert.equal(JSON.stringify(data).includes('fixture-unused-secret'), false);
    assert.equal(JSON.stringify(data).includes('host.docker.internal'), false);
  }
});

test('invalid server settings report unconfigured local mode without unsafe values', async () => {
  for (const env of [{OLLAMA_BASE_URL: 'https://remote.test'},
    {OLLAMA_BASE_URL: 'http://user:fixture-secret@localhost:11434'}, {OLLAMA_MODEL: 'qwen3:4b'}]) {
    const response = await app.fetch(configRequest, env);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.deepEqual(await response.json(), {provider: 'ollama', configured: false, error: 'Invalid local model setup'});
  }
});

test('the local UI exposes setup and keyless submission instead of a password flow', () => {
  assert.match(html, /Check note \(local Clef\)/);
  assert.match(html, /Local model setup/);
  assert.doesNotMatch(html, /id="key"|type="password"|console\.typesafe\.ai/);
});

async function client(configured, failed = false) {
  const nodes = new Map(), calls = [];
  const document = {getElementById(id) {
    if (!nodes.has(id)) nodes.set(id, {value: id === 'bed' ? 'MAT-02' : '', textContent: '', innerHTML: '', disabled: false});
    return nodes.get(id);
  }};
  const context = vm.createContext({document, Date, Intl, setInterval() {}, fetch: async (url, options) => {
    calls.push({url, options});
    if (url === '/api/config') {
      if (failed) throw Error('Config network error');
      return Response.json({provider: 'ollama', model, configured,
        ...(configured ? {} : {error: 'Invalid local model setup'})});
    }
    assert.equal(url, '/api/jev');
    return Response.json(fixture);
  }});
  new vm.Script(script).runInContext(context);
  await new Promise(setImmediate);
  assert.match(nodes.get('env-status').textContent, failed ? /Could not check local model setup/ : configured ? /Local model configured \(not yet verified\)/ : /Invalid local model setup/);
  nodes.get('note').value = input.note;
  await nodes.get('analyze').onsubmit({preventDefault() {}});
  assert.equal(calls.filter(call => call.url === '/api/jev').length, configured && !failed ? 1 : 0);
  if (configured && !failed) {
    const submitted = JSON.parse(calls.find(call => call.url === '/api/jev').options.body);
    assert.deepEqual(submitted, input, 'browser submits only the selected bed and note');
    assert.match(nodes.get('result').textContent, /clef-flash:9b-q8_0/);
  } else {
    assert.equal(nodes.get('result').textContent, 'Check local model setup, then try again.');
    assert.equal(nodes.get('feedback').textContent, nodes.get('result').textContent,
      'setup guidance must be visible while result details are collapsed');
  }
  await nodes.get('check-env').onclick();
  assert.equal(calls.filter(call => call.url === '/api/config').length, 2);
}

test('a configured local model permits keyless submission and manual setup checks', async () => {await client(true);});
test('invalid configuration blocks submission with visible setup guidance', async () => {await client(false);});
test('a failed configuration check blocks submission with visible setup guidance', async () => {await client(false, true);});
