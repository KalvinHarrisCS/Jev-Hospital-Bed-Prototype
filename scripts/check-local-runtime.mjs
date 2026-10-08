// Actual local Wrangler runtime with a fictional HTTP provider. No Ollama model or cloud calls.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import {createServer} from 'node:http';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const model = 'clef-flash:9b-q8_0';
const note = 'Fictional local runtime check. Pain limits walking; reassessment pending.';
const fixture = {model, answers: {
  progress: {type: 'choice', choice: 'needs_review', confidence: 0.9,
    probabilities: {improving: 0.02, needs_review: 0.96, unclear: 0.02}},
  delay: {type: 'noul', noul: 0.95},
}, usage: {input_tokens: 100, output_tokens: 20}};
const browserKey = 'runtime-fixture-browser-key';
const serverKey = 'runtime-fixture-server-key';
let mode = 'success', redirectVisits = 0;
const providerCalls = [], providerErrors = [];
const localProvider = createServer(async (request, response) => {
  if (request.url === '/must-not-follow') {
    redirectVisits++;
    response.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify(fixture));
    return;
  }
  try {
    assert.equal(request.url, '/v1/systemone');
    assert.equal(request.method, 'POST');
    assert.equal(request.headers.authorization, undefined);
    let text = '';
    for await (const chunk of request) text += chunk;
    assert.equal(text.includes(browserKey), false);
    assert.equal(text.includes(serverKey), false);
    const payload = JSON.parse(text);
    assert.deepEqual(Object.keys(payload).sort(), ['model', 'questions', 'state']);
    assert.equal(payload.model, model);
    assert.deepEqual(payload.state, {procedure: 'Cesarean section', pain: 4, progress: '4/8 milestones met', note});
    assert.equal(payload.questions.progress.type, 'choice');
    assert.equal(payload.questions.delay.type, 'noul');
    providerCalls.push(payload);
    if (mode === 'redirect') {
      response.writeHead(302, {Location: '/must-not-follow'}).end('Private redirect detail');
    } else if (mode === 'missing' || mode === 'unavailable') {
      response.writeHead(mode === 'missing' ? 404 : 503, {'Content-Type': 'application/json'})
        .end(JSON.stringify({error: 'Private provider detail'}));
    } else if (mode === 'malformed') {
      response.writeHead(200, {'Content-Type': 'application/json'}).end('Private malformed JSON');
    } else {
      const result = mode === 'invalid' ? {...fixture, answers: {...fixture.answers,
        progress: {...fixture.answers.progress, confidence: 2}}} : fixture;
      response.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify(result));
    }
  } catch (error) {
    providerErrors.push(error);
    response.writeHead(500).end('Fixture validation failed');
  }
});

async function listen(server) {
  await new Promise((resolve, reject) => {server.once('error', reject); server.listen(0, '127.0.0.1', resolve);});
  return server.address().port;
}
async function close(server) {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}

const temporary = await mkdtemp(join(tmpdir(), 'clef-local-runtime-'));
let child, stopped, runtimeOutput = '';
try {
  const providerPort = await listen(localProvider);
  // Reserve a free app port without colliding with an existing demo.
  const reservation = createServer();
  const appPort = await listen(reservation);
  await close(reservation);
  const origin = 'http://127.0.0.1:' + appPort;
  const configPath = join(temporary, 'wrangler.json');
  await writeFile(configPath, JSON.stringify({
    name: 'clef-local-runtime-fixture',
    main: fileURLToPath(new URL('../worker/index.js', import.meta.url)),
    compatibility_date: '2025-04-01',
    vars: {OLLAMA_BASE_URL: 'http://127.0.0.1:' + providerPort, OLLAMA_MODEL: model,
      TYPESAFE_API_KEY: serverKey},
  }));
  const cli = fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url));
  // Use a temporary project and selected environment fields; never load the checkout's .dev.vars.
  const childEnv = {
    WRANGLER_SEND_METRICS: 'false', CI: 'true', NO_COLOR: '1',
    WRANGLER_LOG_PATH: join(temporary, 'wrangler.log'),
    XDG_CONFIG_HOME: join(temporary, 'config'), XDG_CACHE_HOME: join(temporary, 'cache'),
  };
  for (const name of ['PATH', 'SystemRoot', 'TMPDIR', 'TEMP', 'TMP']) {
    if (process.env[name]) childEnv[name] = process.env[name];
  }
  child = spawn(process.execPath, [cli, 'dev', '--local', '--ip', '127.0.0.1',
    '--port', String(appPort), '--config', configPath, '--log-level', 'error'], {
    cwd: temporary, env: childEnv, stdio: ['ignore', 'pipe', 'pipe'],
  });
  stopped = new Promise(resolve => child.once('close', resolve).once('error', resolve));
  for (const stream of [child.stdout, child.stderr]) {
    stream.setEncoding('utf8');
    stream.on('data', chunk => {runtimeOutput = (runtimeOutput + chunk).slice(-65536);});
  }
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (child.exitCode !== null || child.signalCode !== null) break;
    try {
      const response = await fetch(origin + '/api/config', {signal: AbortSignal.timeout(500)});
      assert.deepEqual(await response.json(), {provider: 'ollama', model, configured: true});
      ready = true;
      break;
    } catch {await new Promise(resolve => setTimeout(resolve, 250));}
  }
  assert.ok(ready, 'The local Worker did not start with the fixture config.\n' + runtimeOutput.slice(-4000));
  const html = await (await fetch(origin, {signal: AbortSignal.timeout(5000)})).text();
  assert.ok(html.includes('Check note (local Clef)'), 'runtime page should expose keyless local inference');
  const submit = () => fetch(origin + '/api/jev', {
    method: 'POST', headers: {'Content-Type': 'application/json', Origin: origin},
    body: JSON.stringify({bedId: 'MAT-02', note, apiKey: browserKey,
      endpoint: 'https://remote.test', model: 'jev-latest'}),
    signal: AbortSignal.timeout(5000),
  });
  const success = await submit();
  assert.equal(success.status, 200);
  assert.equal(success.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await success.json(), fixture);
  for (const failure of ['missing', 'unavailable', 'malformed', 'invalid', 'redirect']) {
    mode = failure;
    const response = await submit();
    assert.equal(response.status, 502, 'runtime accepted ' + failure + ' provider reply');
    const text = await response.text();
    assert.equal(text.includes('Private'), false);
    assert.equal(text.includes(browserKey), false);
    assert.equal(text.includes(serverKey), false);
    const {error} = JSON.parse(text);
    assert.equal(typeof error, 'string');
    if (failure === 'missing') {
      assert.match(error, /Ollama model or System One endpoint was not found/);
      assert.match(error, /0\.35\.1 or newer/);
    }
  }
  assert.equal(providerCalls.length, 6, 'each request must make exactly one local provider call');
  assert.equal(redirectVisits, 0, 'the local runtime followed a provider redirect');
  assert.deepEqual(providerErrors, []);
  assert.doesNotMatch(runtimeOutput, /EACCES|permission denied/i);
} finally {
  if (child) {
    child.kill('SIGTERM');
    const timer = setTimeout(() => child.kill('SIGKILL'), 2000);
    timer.unref();
    await stopped;
    clearTimeout(timer);
  }
  await close(localProvider);
  await rm(temporary, {recursive: true, force: true});
}
console.log('Passed: actual local Worker uses the mocked local decision endpoint without keys; safe model/HTTP/JSON errors; redirects blocked; no startup permission errors. No real model or clinical accuracy check.');
