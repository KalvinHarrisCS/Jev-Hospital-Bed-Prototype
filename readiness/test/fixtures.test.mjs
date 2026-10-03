import assert from 'node:assert/strict';
import test from 'node:test';
import {cases} from './helpers.mjs';

test('Fictional fixtures have unique IDs and self-contained inputs', () => {
  assert.equal(new Set(cases.map(item => item.id)).size, cases.length);
  for (const {input, expected} of cases) {
    assert.deepEqual(Object.keys(input).sort(), ['assumptions', 'beds', 'cleaner', 'maxUpdateAgeMinutes',
      'queueOverride', 'schemaVersion', 'snapshot', 'timezone', 'ward']);
    assert.equal(input.schemaVersion, 1); assert.equal(input.timezone, 'America/New_York');
    assert.equal(input.assumptions.travelMinutes, 0); assert.equal(input.assumptions.releaseDelayMinutes, 0);
    assert.deepEqual(expected.beds.map(bed => bed.bedId), input.beds.map(bed => bed.bedId));
    assert.deepEqual(expected.beds.map(bed => bed.actualStatus), input.beds.map(bed => bed.actualStatus));
    assert.equal(expected.snapshot, input.snapshot);
  }
});

test('Expected forecasts have ordered windows or explicit nulls, with sorted unique reasons', () => {
  for (const {expected} of cases) for (const bed of expected.beds) {
    assert.deepEqual(bed.reasons, [...new Set(bed.reasons)].sort());
    if (bed.status !== 'estimated') {
      for (const key of ['startWindow', 'completionWindow', 'readyWindow', 'release']) assert.equal(bed[key], null);
      assert.ok(bed.reasons.length); continue;
    }
    assert.equal(bed.release, 'pending_staff_release'); assert.deepEqual(bed.readyWindow, bed.completionWindow);
    for (const key of ['startWindow', 'completionWindow']) {
      assert.ok(Date.parse(bed[key][0]) <= Date.parse(bed[key][1]));
      for (const time of bed[key]) assert.equal(new Date(time).toISOString(), time);
    }
    for (const bound of [0, 1]) assert.ok(Date.parse(bed.completionWindow[bound]) > Date.parse(bed.startWindow[bound]));
  }
});
