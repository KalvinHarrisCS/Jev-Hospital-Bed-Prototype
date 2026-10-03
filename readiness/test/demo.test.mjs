import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {cases, inputFor} from './helpers.mjs';

const command = fileURLToPath(new URL('../demo.mjs', import.meta.url));
const runDemo = (...arguments_) => execFileSync(process.execPath, [command, ...arguments_], {
  encoding: 'utf8',
});

test('The two-room demo displays local times and preserves occupied status', () => {
  const output = runDemo('two-rooms');
  assert.match(output, /America\/New_York/);
  assert.match(output, /MAT-01.*occupied.*estimated/);
  assert.match(output, /10:50:00/);
  assert.match(output, /11:30:00/);
  assert.match(output, /pending staff release/);
});

test('The JSON option preserves the complete forecast output', () => {
  const output = JSON.parse(runDemo('two-rooms', '--json'));
  assert.deepEqual(output, cases.find(item => item.id === 'two-rooms').expected);
});

test('The JSON option works before a case ID or with the default case', () => {
  for (const [arguments_, name] of [[['--json', 'two-rooms'], 'two-rooms'], [['--json'], 'after-break']]) {
    assert.deepEqual(JSON.parse(runDemo(...arguments_)), cases.find(item => item.id === name).expected);
  }
});

test('A separate input file can be adjusted without editing test fixtures', t => {
  const folder = mkdtempSync(join(tmpdir(), 'jev demo '));
  t.after(() => rmSync(folder, {recursive: true, force: true}));
  const file = join(folder, 'fictional-input.json');
  const input = inputFor('two-rooms');
  input.beds[0].bedId = 'DEMO-01';
  writeFileSync(file, JSON.stringify(input));
  for (const arguments_ of [['--input', file, '--json'], ['--json', '--input', file]]) {
    const result = JSON.parse(runDemo(...arguments_));
    assert.equal(result.beds[0].bedId, 'DEMO-01');
    assert.equal(result.beds[0].actualStatus, 'occupied');
  }
});

for (const arguments_ of [
  ['not-a-case'], ['two-rooms', 'extra'], ['', 'two-rooms'], ['--input'], ['--input', '--json'],
  ['--json', '--json'], ['--input', 'file.json', '--input', 'other.json'],
  ['--input', 'file.json', 'two-rooms'], ['two-rooms', '--input', 'file.json'],
  ['--unknown'], ['two-rooms', '--unknown'],
]) {
  test('Invalid demo arguments fail clearly: ' + arguments_.join(' '), () => {
    const result = spawnSync(process.execPath, [command, ...arguments_], {encoding: 'utf8'});
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /Choose one case ID|Usage:/);
  });
}
