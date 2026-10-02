import assert from 'node:assert/strict';
import test from 'node:test';
import {summarizeCohort} from '../summarize.mjs';
import {inputFor, bin} from './fixtures.mjs';

const rejects = (input, code = 'INVALID_INPUT') =>
  assert.throws(() => summarizeCohort(input), {code});

for (const value of [null, [], 'not a cohort', undefined]) {
  test('Reject non-object input: ' + String(value), () => rejects(value));
}
for (const field of ['schemaVersion', 'procedureCode', 'year', 'expectedDischarges', 'source', 'histogram']) {
  test('Reject missing ' + field, () => {const input = inputFor(); delete input[field]; rejects(input);});
}
for (const [field, value] of [['schemaVersion', 2], ['procedureCode', 'PGN004'],
  ['year', 2022], ['year', '2023'], ['histogram', null], ['histogram', {}]]) {
  test('Reject unsupported ' + field + ': ' + String(value), () => rejects({...inputFor(), [field]: value}));
}
for (const count of [-1, 0.5, '10', NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
  test('Reject invalid expected count: ' + count, () => rejects({...inputFor(), expectedDischarges: count}));
}
for (const count of [0, -1, 0.5, '1', NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
  test('Reject invalid bin count: ' + count, () => rejects({...inputFor(), histogram: [bin('2', count)]}));
}
for (const day of ['', ' ', '0', '01', '2.0', '120', '121', 'unknown', null, 2]) {
  test('Reject invalid stay bin: ' + String(day), () => rejects({...inputFor(), histogram: [bin(day, 10)]}));
}
for (const row of [null, {}, {lengthOfStay: '2'}, {discharges: 10}]) {
  test('Reject incomplete bin: ' + JSON.stringify(row), () => rejects({...inputFor(), histogram: [row]}));
}
test('Reject duplicate stay groups even when their counts reconcile', () => {
  rejects({...inputFor(), histogram: [bin('2', 5), bin('2', 5)]}, 'DUPLICATE_BIN');
});
test('Reject an unsafe sum even when each individual bin count is safe', () => {
  rejects({...inputFor(), expectedDischarges: Number.MAX_SAFE_INTEGER,
    histogram: [bin('1', Number.MAX_SAFE_INTEGER), bin('2', 1)]});
});
test('Reject a histogram that disagrees with the independent count', () => {
  rejects({...inputFor(), expectedDischarges: 11}, 'COUNT_MISMATCH');
});
test('Missing histogram rows are not an empty cohort', () => {
  rejects({...inputFor(), histogram: []}, 'COUNT_MISMATCH');
});
test('A zero expected count does not erase recorded discharges', () => {
  rejects({...inputFor(), expectedDischarges: 0}, 'COUNT_MISMATCH');
});
for (const field of ['kind', 'datasetId', 'retrievedAt', 'query', 'codingVersion']) {
  test('Reject missing source ' + field, () => {
    const input = inputFor(); delete input.source[field]; rejects(input);
  });
}
for (const [field, value] of [['kind', 'private-patient-records'], ['datasetId', 'fixture-2024'],
  ['retrievedAt', 'not a date'], ['retrievedAt', '2026-02-30T12:00:00.000Z'],
  ['query', ' '], ['codingVersion', 'CCSR 2025.1']]) {
  test('Reject invalid source ' + field + ': ' + value, () => {
    const input = inputFor(); input.source[field] = value; rejects(input);
  });
}
test('Reject a public dataset ID that does not match its year', () => {
  const input = inputFor(); input.source = {...input.source, kind: 'sparcs-public-aggregate',
    datasetId: 'sf4k-39ay', codingVersion: 'CCSR 2025.1'}; rejects(input);
});
test('Reject an unverified public coding version', () => {
  const input = inputFor(); input.source = {...input.source, kind: 'sparcs-public-aggregate',
    datasetId: '46xm-urtu', codingVersion: 'CCSR unknown'}; rejects(input);
});
for (const level of ['input', 'source', 'bin']) {
  test('Reject unrecognized fields at the ' + level + ' level', () => {
    const input = inputFor();
    const target = level === 'input' ? input : level === 'source' ? input.source : input.histogram[0];
    target.patientName = 'FICTIONAL FIELD THAT DOES NOT BELONG HERE'; rejects(input);
  });
}
