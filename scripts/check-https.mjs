// Optional runtime check: contacts TypeSafe with an invalid fixture key; no valid-key inference.
import assert from 'node:assert/strict';
import {readdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = await readdir(root);
assert.ok(!files.some(name => name.startsWith('.env') || name.startsWith('.dev.vars')),
  'Run this check in the clean container; local secret files must not override the fixture key.');
const cli = fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url));
const child = spawn(process.execPath, [cli, 'dev', '--ip', '127.0.0.1', '--port', '8799'], {
  cwd: root,
  env: {...process.env, TYPESAFE_API_KEY: 'https-check-invalid-fixture-key', WRANGLER_SEND_METRICS: 'false'},
  stdio: ['ignore', 'pipe', 'pipe']
});
let runtimeErrors = '';
for (const stream of [child.stdout, child.stderr]) {
  stream.setEncoding('utf8');
  stream.on('data', chunk => { runtimeErrors = (runtimeErrors + chunk).slice(-65536); });
}
const stopped = new Promise(resolve => child.once('close', resolve).once('error', resolve));
const origin = 'http://127.0.0.1:8799';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    if (child.exitCode !== null || child.signalCode !== null) throw Error('Local runtime exited before readiness.');
    try {
      const response = await fetch(origin + '/api/config', {signal: AbortSignal.timeout(500)});
      assert.deepEqual(await response.json(), {configured: true});
      ready = true;
      break;
    } catch { await sleep(250); }
  }
  assert.ok(ready, 'Local Worker did not become ready.');
  const response = await fetch(origin + '/api/jev', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Origin: origin},
    body: JSON.stringify({bedId: 'MAT-02', note: 'Fictional HTTPS connectivity check.'}),
    signal: AbortSignal.timeout(25000)
  });
  const result = await response.json();
  assert.equal(response.status, 502);
  assert.ok(result.error === 'TypeSafe rejected the API key.' ||
    result.error === 'TypeSafe request failed (HTTP 403).',
    'Provider authentication rejection was not reached; check runtime HTTPS/network access.');
  assert.doesNotMatch(runtimeErrors, /EACCES|permission denied/i,
    'The local runtime reported a filesystem permission error.');
} finally {
  child.kill('SIGTERM');
  const timer = setTimeout(() => child.kill('SIGKILL'), 2000);
  timer.unref();
  await stopped;
  clearTimeout(timer);
}
assert.doesNotMatch(runtimeErrors, /EACCES|permission denied/i,
  'The local runtime reported a filesystem permission error.');
console.log('Passed: no runtime permission errors; actual Worker HTTPS reaches TypeSafe, which rejects the invalid fixture key. No valid-key inference or accuracy claim.');
