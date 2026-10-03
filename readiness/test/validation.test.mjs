import assert from 'node:assert/strict';
import test from 'node:test';
import {forecastBeds} from '../forecast.mjs';
import {inputFor} from './helpers.mjs';
import {invalidCases} from './validation-cases.mjs';

const reasons = new Set(['invalid_timestamp', 'invalid_window', 'invalid_duration', 'future_update',
  'future_observed_departure', 'duplicate_bed', 'invalid_schedule', 'invalid_queue_override',
  'invalid_schema', 'unsupported_assumption']);
const compare = (a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 :
  a.reason < b.reason ? -1 : a.reason > b.reason ? 1 : 0;
function rejects(input, expected = []) {
  const before = structuredClone(input);
  try {
    assert.throws(() => forecastBeds(input), error => {
      assert.equal(error.code, 'INVALID_INPUT');
      assert.ok(Array.isArray(error.issues) && error.issues.length > 0, 'Report structured issues');
      for (const issue of error.issues) {
        assert.deepEqual(Object.keys(issue).sort(), ['path', 'reason']);
        assert.equal(typeof issue.path, 'string');
        assert.ok(reasons.has(issue.reason), 'Use a defined issue code');
      }
      assert.deepEqual(error.issues, [...error.issues].sort(compare), 'Sort all issues by path and reason');
      assert.equal(new Set(error.issues.map(issue => issue.path + ':' + issue.reason)).size, error.issues.length);
      for (const [path, reason] of expected) {
        assert.ok(error.issues.some(issue => issue.path === path && issue.reason === reason), path + ': ' + reason);
      }
      return true;
    });
  } finally {assert.deepEqual(input, before, 'Validation must leave the request unchanged');}
}

for (const [name, path, reason, mutate] of invalidCases) {
  test('Reject ' + name, () => {
    const input = inputFor(); mutate(input); rejects(input, [[path, reason]]);
  });
}
for (const value of [null, undefined, [], 'not a request', 1]) {
  test('Reject a non-object request: ' + String(value), () => rejects(value));
}
for (const field of ['schemaVersion', 'snapshot', 'timezone', 'ward', 'maxUpdateAgeMinutes',
  'cleaner', 'beds', 'queueOverride', 'assumptions']) {
  test('Reject a missing request field: ' + field, () => {
    const input = inputFor(); delete input[field]; rejects(input, [[field, 'invalid_schema']]);
  });
}
for (const [path, select, fields] of [
  ['cleaner', input => input.cleaner, ['cleanerId', 'role', 'assignedWard', 'shift', 'breaks', 'currentWork', 'taskFinishWindow', 'updatedAt']],
  ['beds[0]', input => input.beds[0], ['bedId', 'ward', 'actualStatus', 'departure', 'cleaning', 'holds', 'noteStatus']],
  ['beds[0].departure', input => input.beds[0].departure, ['kind', 'window', 'updatedAt', 'source']],
  ['beds[0].cleaning', input => input.beds[0].cleaning, ['minutes', 'source']],
  ['assumptions', input => input.assumptions, ['travelMinutes', 'releaseDelayMinutes', 'source']],
]) {
  for (const field of fields) {
    test('Reject a missing nested field: ' + path + '.' + field, () => {
      const input = inputFor(); delete select(input)[field]; rejects(input, [[path + '.' + field, 'invalid_schema']]);
    });
  }
  test('Reject unrecognized information in ' + path, () => {
    const input = inputFor(); select(input).patientName = 'FICTIONAL EXTRA FIELD';
    rejects(input, [[path + '.patientName', 'invalid_schema']]);
  });
}
test('Reject unrecognized information at the request level', () => {
  const input = inputFor(); input.patientName = 'FICTIONAL EXTRA FIELD'; rejects(input, [['patientName', 'invalid_schema']]);
});
test('Reject unrecognized information in a queue override', () => {
  const input = inputFor(); input.queueOverride = {bedIds: input.beds.map(bed => bed.bedId),
    reason: 'Demo queue', patientName: 'FICTIONAL EXTRA FIELD'};
  rejects(input, [['queueOverride.patientName', 'invalid_schema']]);
});
test('Report all independent structural issues before calculating a forecast', () => {
  const input = inputFor(); input.schemaVersion = 2; input.assumptions.travelMinutes = 1;
  input.beds[0].cleaning.minutes = [0, 30]; input.cleaner.updatedAt = 'not a timestamp';
  rejects(input, [['schemaVersion', 'invalid_schema'], ['assumptions.travelMinutes', 'unsupported_assumption'],
    ['beds[0].cleaning.minutes', 'invalid_duration'], ['cleaner.updatedAt', 'invalid_timestamp']]);
});
