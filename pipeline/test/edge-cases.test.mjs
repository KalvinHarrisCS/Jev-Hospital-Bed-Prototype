import assert from 'node:assert/strict';
import test from 'node:test';
import {summarizeCohort} from '../summarize.mjs';
import {inputFor, bin} from './fixtures.mjs';

const rejects = input => assert.throws(() => summarizeCohort(input), {code: 'INVALID_INPUT'});

for (const source of [null, [], 'fixture', new Date()]) {
  test('Reject non-record source: ' + String(source), () => rejects({...inputFor(), source}));
}
for (const query of [null, 12]) {
  test('Reject non-string query: ' + String(query), () => {
    const input = inputFor(); input.source.query = query; rejects(input);
  });
}
for (const day of ['2\n', '2 ', '\t2', '120+\n']) {
  test('Reject whitespace in stay label: ' + JSON.stringify(day), () =>
    rejects({...inputFor(), histogram: [bin(day, 10)]}));
}
for (const procedureCode of ['constructor', 'toString', {toString: () => 'PGN003'}]) {
  test('Reject unsupported procedure type or name: ' + String(procedureCode), () =>
    rejects({...inputFor(), procedureCode}));
}
test('Reject a missing histogram row', () => {
  const input = inputFor(); delete input.histogram[0]; rejects(input);
});
test('Reject inherited required fields', () => {
  const {schemaVersion, ...ownFields} = inputFor();
  rejects(Object.assign(Object.create({schemaVersion}), ownFields));
});
test('Reject an extra symbol field', () => {
  const input = inputFor(); input[Symbol('extra')] = 'unexpected'; rejects(input);
});
test('Output records can be edited without changing the input', () => {
  const input = inputFor(); const original = structuredClone(input);
  const result = summarizeCohort(input);
  result.source.query = 'changed'; result.histogram[0].discharges = 99;
  assert.deepEqual(input, original);
});
