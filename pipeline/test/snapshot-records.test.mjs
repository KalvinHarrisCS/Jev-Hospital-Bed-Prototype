import assert from 'node:assert/strict';
import test from 'node:test';
import {collectPublic} from '../collect.mjs';
import {validateSnapshot} from '../snapshot.mjs';
import {fakeRequest, timestamp} from './collector-fixtures.mjs';

const valid = await collectPublic({...fakeRequest(), now: () => timestamp});
const malformed = [null, [], {}, 'not a record', 1, false];

function rejectsUnchanged(snapshot, code = 'INVALID_SNAPSHOT') {
  const before = structuredClone(snapshot);
  assert.throws(() => validateSnapshot(snapshot), error => {
    assert.equal(error.code, code);
    assert.equal(error instanceof TypeError, false);
    assert.equal(typeof error.message, 'string');
    assert.ok(error.message.length > 0);
    return true;
  });
  assert.deepEqual(snapshot, before);
}

for (const value of malformed) {
  for (const [path, replace] of [
    ['snapshot', () => value],
    ['source record', snapshot => {snapshot.sources[0] = value; return snapshot;}],
    ['response hashes', snapshot => {snapshot.sources[0].responseHashes = value; return snapshot;}],
    ['response totals', snapshot => {snapshot.sources[0].responseHashes.totals = value; return snapshot;}],
    ['cohort record', snapshot => {snapshot.cohorts[0] = value; return snapshot;}],
    ['cohort source', snapshot => {snapshot.cohorts[0].source = value; return snapshot;}],
    ['terms evidence', snapshot => {snapshot.terms = value; return snapshot;}],
  ]) {
    test('Reject malformed ' + path + ': ' + JSON.stringify(value), () => {
      const code = path.startsWith('cohort') ? 'INVALID_INPUT' : 'INVALID_SNAPSHOT';
      rejectsUnchanged(replace(structuredClone(valid)), code);
    });
  }
}

for (const [name, change] of [
  ['missing source record', snapshot => {delete snapshot.sources[0];}],
  ['missing cohort record', snapshot => {delete snapshot.cohorts[0];}],
  ['missing response totals', snapshot => {delete snapshot.sources[0].responseHashes.totals;}],
  ['missing cohort source', snapshot => {delete snapshot.cohorts[0].source;}],
  ['missing provenance query', snapshot => {delete snapshot.cohorts[0].source.query;}],
]) {
  test('Reject ' + name + ' with a controlled validation error', () => {
    const snapshot = structuredClone(valid); change(snapshot);
    const cohortError = ['missing cohort record', 'missing cohort source', 'missing provenance query'].includes(name);
    rejectsUnchanged(snapshot, cohortError ? 'INVALID_INPUT' : 'INVALID_SNAPSHOT');
  });
}

test('Reject a snapshot array carrying all expected fields', () => {
  const snapshot = Object.assign([], structuredClone(valid));
  rejectsUnchanged(snapshot);
});

test('Reject a source record array carrying all expected fields', () => {
  const snapshot = structuredClone(valid);
  snapshot.sources[0] = Object.assign([], snapshot.sources[0]);
  rejectsUnchanged(snapshot);
});

test('Reject a response hashes array carrying all expected fields', () => {
  const snapshot = structuredClone(valid);
  snapshot.sources[0].responseHashes = Object.assign([], snapshot.sources[0].responseHashes);
  rejectsUnchanged(snapshot);
});

test('Reject a response totals array carrying all expected fields', () => {
  const snapshot = structuredClone(valid);
  const hashes = snapshot.sources[0].responseHashes;
  hashes.totals = Object.assign([], hashes.totals);
  rejectsUnchanged(snapshot);
});
