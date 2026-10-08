// Fixture-only behavior checks. No server, environment secrets, or provider calls.
import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import app from '../worker/index.js';

const html = await (await app.fetch(new Request('https://bedboard.test/'), {})).text();
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const fixture = {
  model: 'clef-flash:9b-q8_0',
  answers: {
    progress: {type: 'choice', choice: 'improving', probabilities: {improving: 0.98, needs_review: 0.01, unclear: 0.01}, confidence: 0.9},
    delay: {type: 'noul', noul: 0}
  },
  usage: {input_tokens: 100, output_tokens: 20}
};
const input = {bedId: 'MAT-02', note: 'Fictional recovery update.'};
const request = data => new Request('https://bedboard.test/api/jev', {
  method: 'POST', headers: {Origin: 'https://bedboard.test', 'Content-Type': 'application/json'}, body: JSON.stringify(data)
});
async function withProvider(provider, run) {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'http://127.0.0.1:11434/v1/systemone');
    return provider(options);
  };
  try { await run(); } finally { globalThis.fetch = original; }
}
async function browser(provider = async () => Response.json(fixture), fictionalBeds = null) {
  const nodes = new Map(), calls = [];
  let time = 0, tick;
  class DemoDate extends Date { static now() { return time; } }
  const document = {getElementById(id) {
    if (!nodes.has(id)) nodes.set(id, {value: id === 'bed' ? 'MAT-02' : '', textContent: '', innerHTML: '', disabled: false});
    return nodes.get(id);
  }};
  for (const match of html.matchAll(/id="([^"]+)"/g)) document.getElementById(match[1]);
  const options = [...html.match(/<select id="scenario">([\s\S]*?)<\/select>/)[1].matchAll(/<option value="([^"]*)"(?: data-note="([^"]*)" data-delay="([^"]*)")?>/g)].map(match => ({value: match[1], dataset: {note: match[2], delay: match[3]}}));
  Object.defineProperty(nodes.get('scenario'), 'selectedOptions', {get() { return options.filter(option => option.value === nodes.get('scenario').value); }});
  const context = vm.createContext({document, Date: DemoDate, Intl, setInterval(fn) { tick = fn; }, fetch: async (url, options) => {
    if (url === '/api/config') return Response.json({provider: 'ollama', model: fixture.model, configured: true});
    assert.equal(url, '/api/jev');
    calls.push(JSON.parse(options.body));
    return provider();
  }});
  const clientScript = fictionalBeds === null ? script :
    script.replace(/const beds = .*;/, 'const beds = ' + JSON.stringify(fictionalBeds) + ';');
  new vm.Script(clientScript).runInContext(context);
  await new Promise(setImmediate);
  return {nodes, calls, advance(ms) { time += ms; tick(); }, submit() { return nodes.get('analyze').onsubmit({preventDefault() {}}); }};
}
function rows(client) {
  return new Map([...client.nodes.get('rows').innerHTML.matchAll(/<tr(?: [^>]*)?>(.*?)<\/tr>/g)].map(match => {
    const cells = [...match[1].matchAll(/<td>(.*?)<\/td>/g)].map(cell => cell[1]);
    return [cells[0], cells];
  }));
}

function headerCounts(client) {
  const initial = [...html.matchAll(/<strong(?: [^>]*)?>(\d+)<\/strong>/g)].map(match => Number(match[1]));
  return ['count-total', 'count-available', 'count-occupied', 'count-turnaround', 'count-held']
    .map((id, index) => Number(client.nodes.get(id)?.textContent || initial[index]));
}

test('Header counts follow a changed fictional board and never infer release from elapsed time', async () => {
  const fictionalBeds = ['AVL', 'OCC', 'AVL', 'CLN', 'DUE', 'HLD', 'HLD'].map((status, index) => ({
    id: 'MAT-' + String(index + 1).padStart(2, '0'),
    procedure: 'Fictional test procedure', status, ready: null, note: 'Fictional test observation.',
  }));
  const client = await browser(undefined, fictionalBeds);
  assert.equal(rows(client).size, 7);
  assert.deepEqual(headerCounts(client), [7, 2, 1, 2, 2]);
  client.advance(4 * 60 * 60 * 1000);
  assert.deepEqual(headerCounts(client), [7, 2, 1, 2, 2]);
  assert.deepEqual([...rows(client).values()].map(cells => cells[2]), fictionalBeds.map(bed => bed.status));
  assert.equal(client.calls.length, 0);
});

test('elapsed estimates require confirmation and never make occupied or cleaning beds available', async () => {
  const client = await browser();
  const before = rows(client);
  assert.equal(before.size, 20);
  assert.equal(before.get('MAT-01')[4], '03:15:00');
  assert.equal(before.get('MAT-05')[4], '00:45:00');
  assert.equal(before.get('MAT-02')[4], 'Unknown');
  assert.equal(before.get('GYN-07')[4], 'Unknown');
  client.advance(4 * 60 * 60 * 1000);
  const after = rows(client);
  assert.equal(after.get('MAT-01')[4], 'Confirm readiness');
  assert.equal(after.get('MAT-05')[4], 'Confirm readiness');
  for (const [bed, cells] of before) assert.equal(after.get(bed)[2], cells[2], 'status changed for ' + bed);
  assert.equal([...after.values()].filter(cells => cells[4] === 'Available now').length, 3);
});

test('caller-supplied clinical context cannot replace the selected fictional bed record', async () => {
  const states = [];
  await withProvider(options => { states.push(JSON.parse(options.body).state); return Response.json(fixture); }, async () => {
    for (const bedId of ['MAT-02', 'GYN-02', 'GYN-07']) {
      const response = await app.fetch(request({...input, bedId, pain: 0, progress: 'all complete', procedure: 'forged', state: {status: 'AVL'}}), {});
      assert.equal(response.status, 200);
    }
  });
  assert.deepEqual(states[0], {procedure: 'Cesarean section', pain: 4, progress: '4/8 milestones met', note: input.note});
  assert.equal(states[1].pain, null, 'missing assessment must stay unknown');
  assert.equal(states[2].pain, null);
  assert.equal(states[2].progress, null);
});

test('incomplete or invalid Choice probabilities/confidence cannot become a successful classification', async () => {
  // Choice/Noul field shapes come from https://docs.ollama.com/api/systemone.
  // Deliberately avoid exact-sum/argmax requirements: provider probabilities may be rounded.
  const progress = fixture.answers.progress;
  const {probabilities, ...withoutProbabilities} = progress;
  const {confidence, ...withoutConfidence} = progress;
  for (const malformed of [withoutProbabilities, withoutConfidence, {...progress, confidence: 2}, {...progress, probabilities: {...probabilities, improving: '0.98'}}, {...progress, probabilities: {improving: 1}}]) {
    await withProvider(() => Response.json({...fixture, answers: {...fixture.answers, progress: malformed}}), async () => {
      const response = await app.fetch(request(input), {});
      assert.equal(response.status, 502, 'malformed Choice accepted: ' + JSON.stringify(malformed));
      assert.deepEqual(await response.json(), {error: 'Unexpected local model response'});
    });
  }
});

test('keyless delayed results name the submitted bed and do not overwrite a newly selected note', async () => {
  let finish;
  const client = await browser(() => new Promise(resolve => { finish = resolve; }));
  client.nodes.get('note').value = input.note;
  const first = client.submit();
  assert.equal(client.nodes.get('submit').disabled, true);
  assert.equal(client.nodes.get('sample').disabled, true);
  assert.equal(client.nodes.get('scenario').disabled, true);
  assert.equal(client.nodes.get('feedback').textContent, 'Checking the submitted note…');
  client.nodes.get('bed').value = 'MAT-03';
  client.nodes.get('bed').onchange();
  const newNote = client.nodes.get('note').value;
  finish(Response.json(fixture));
  await first;
  assert.deepEqual(client.calls[0], input);
  assert.match(client.nodes.get('result').textContent, /^Result for MAT-02 \(submitted note\):\n/);
  assert.match(client.nodes.get('result').textContent, /\nModel probabilities are not clinical certainty\. Bed state unchanged\.$/);
  assert.equal(client.nodes.get('note').value, newNote, 'completion overwrote the newly selected note');
  assert.equal(client.nodes.get('submit').disabled, false);
  assert.equal(client.nodes.get('sample').disabled, false);
  assert.equal(client.nodes.get('scenario').disabled, false);
  const table = client.nodes.get('rows').innerHTML;
  const second = client.submit();
  finish(Response.json(fixture));
  await second;
  assert.deepEqual(client.calls[1], {...input, bedId: 'MAT-03', note: newNote});
  assert.equal(client.nodes.get('rows').innerHTML, table, 'classification changed bed state');
});

test('practice notes show labeled expected answers without a key, provider call or bed change', async () => {
  const client = await browser();
  const table = client.nodes.get('rows').innerHTML;
  client.nodes.get('sample').onclick();
  assert.match(client.nodes.get('result').textContent, /Choose a practice note first/);
  for (const category of ['improving', 'needs_review', 'unclear']) {
    client.nodes.get('scenario').value = category;
    client.nodes.get('scenario').onchange();
    assert.ok(client.nodes.get('note').value.length > 20);
    client.nodes.get('sample').onclick();
    assert.match(client.nodes.get('result').textContent, /SAMPLE ONLY.*no model call/);
    assert.ok(client.nodes.get('result').textContent.includes('Progress: '+category));
    assert.equal(client.nodes.get('rows').innerHTML, table);
    client.nodes.get('note').value += ' Edited observation.';
    client.nodes.get('note').oninput();
    assert.equal(client.nodes.get('scenario').value, '');
    assert.equal(client.nodes.get('feedback').textContent, '');
    assert.match(client.nodes.get('result').textContent, /Note edited/);
    client.nodes.get('sample').onclick();
    assert.match(client.nodes.get('result').textContent, /unchanged practice note/);
  }
  assert.equal(client.calls.length, 0);
});

test('unclear output asks for note detail and names the submitted bed without judging the nurse', async () => {
  const unclear = {...fixture, answers: {...fixture.answers, progress: {...fixture.answers.progress, choice: 'unclear', probabilities: {improving: 0.01, needs_review: 0.01, unclear: 0.98}}}};
  const client = await browser(async () => Response.json(unclear));
  client.nodes.get('note').value = 'Fictional administrative update.';
  await client.submit();
  assert.match(client.nodes.get('feedback').textContent, /Submitted note for MAT-02: The note may need more detail/);
  assert.match(client.nodes.get('feedback').textContent, /pain, walking or meals/);
  assert.match(client.nodes.get('result').textContent, /Fictional administrative update/);
  assert.match(client.nodes.get('result').textContent, /Request time: \d+\.\ds/);
  client.nodes.get('bed').value = 'MAT-01';
  client.nodes.get('bed').onchange();
  assert.equal(client.nodes.get('feedback').textContent, '');
});

test('Jev choices must be exact allowed strings, not lists that stringify to them', async () => {
  for (const choice of [['improving'], ['needs_review'], ['unclear']]) {
    const malformed = structuredClone(fixture);
    malformed.answers.progress.choice = choice;
    await withProvider(() => Response.json(malformed), async () => {
      const response = await app.fetch(request(input), {});
      assert.equal(response.status, 502);
      assert.deepEqual(await response.json(), {error: 'Unexpected local model response'});
    });
  }
});

test('A null provider reply is reported as an unexpected answer', async () => {
  await withProvider(() => Response.json(null), async () => {
    const response = await app.fetch(request(input), {});
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), {error: 'Unexpected local model response'});
  });
});

for (const [status, message] of [
  [401, /Ollama request failed \(HTTP 401\)/],
  [429, /Ollama request failed \(HTTP 429\)/],
  [404, /Ollama model or System One endpoint was not found/],
]) {
  test('A provider HTTP ' + status + ' response gives the expected guidance', async () => {
    await withProvider(() => new Response('Private provider detail', {status}), async () => {
      const response = await app.fetch(request(input), {});
      assert.equal(response.status, 502);
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      assert.match((await response.json()).error, message);
    });
  });
}

const invalidAnswerCases = [
  {name: 'a model name must be a string', change(data) {data.model = 123;}},
  {name: 'a model name must contain text', change(data) {data.model = ' ';}},
  {name: 'progress must have Choice type', change(data) {data.answers.progress.type = 'noul';}},
  {name: 'delay must have NouL type', change(data) {data.answers.delay.type = 'choice';}},
];

for (const example of invalidAnswerCases) {
  test(example.name, async () => {
    const malformed = structuredClone(fixture);
    example.change(malformed);
    await withProvider(() => Response.json(malformed), async () => {
      const response = await app.fetch(request(input), {});
      assert.equal(response.status, 502);
      assert.deepEqual(await response.json(), {error: 'Unexpected local model response'});
    });
  });
}

test('browser request failure leaves the note editable and allows a later retry', async () => {
  let fail = true;
  const client = await browser(() => {
    if (fail) throw Error('Fixture connection failure');
    return Response.json(fixture);
  });
  client.nodes.get('note').value = input.note;
  const table = client.nodes.get('rows').innerHTML;
  await client.submit();
  assert.equal(client.nodes.get('submit').disabled, false);
  assert.equal(client.nodes.get('note').value, input.note);
  assert.equal(client.nodes.get('result').textContent, 'Fixture connection failure');
  assert.equal(client.nodes.get('feedback').textContent, 'Fixture connection failure', 'failure must be visible while result details are collapsed');
  assert.equal(client.nodes.get('rows').innerHTML, table, 'failed inference changed bed state');
  fail = false;
  await client.submit();
  assert.equal(client.calls.length, 2);
  assert.equal(client.nodes.get('submit').disabled, false);
  assert.match(client.nodes.get('result').textContent, /clef-flash:9b-q8_0/);
  assert.equal(client.nodes.get('rows').innerHTML, table, 'retry classification changed bed state');
});

test('each classification and local-model failure leaves bed status, note and counts alone', async () => {
  const responses = ['improving', 'needs_review', 'unclear'].map(choice => () => Response.json({
    ...fixture, answers: {...fixture.answers, progress: {...fixture.answers.progress, choice}},
  }));
  for (const error of ['Ollama model or System One endpoint was not found.', 'Ollama request failed (HTTP 503).', 'Ollama connection failed or timed out.']) {
    responses.push(() => Response.json({error}, {status: 502}));
  }
  for (const response of responses) {
    const client = await browser(response);
    client.nodes.get('note').value = input.note;
    const table = client.nodes.get('rows').innerHTML, counts = headerCounts(client);
    await client.submit();
    assert.equal(client.calls.length, 1);
    assert.deepEqual(client.calls[0], input);
    assert.equal(client.nodes.get('rows').innerHTML, table);
    assert.deepEqual(headerCounts(client), counts);
    assert.equal(client.nodes.get('note').value, input.note);
    assert.equal(client.nodes.get('submit').disabled, false);
    assert.equal(client.nodes.get('sample').disabled, false);
    assert.equal(client.nodes.get('scenario').disabled, false);
  }
});
