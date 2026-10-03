import assert from 'node:assert/strict';
import test from 'node:test';
import {forecastBeds} from '../forecast.mjs';
import {inputFor, freeze} from './helpers.mjs';

function busyInput(latestFinish) {
  const input = inputFor();
  input.cleaner.breaks = [];
  input.cleaner.currentWork = 'busy';
  input.cleaner.taskFinishWindow = ['2026-10-02T09:50:00-04:00', latestFinish];
  const bed = input.beds[0];
  bed.actualStatus = 'awaiting_cleaning';
  bed.departure = {
    kind: 'observed',
    window: ['2026-10-02T09:45:00-04:00', '2026-10-02T09:45:00-04:00'],
    updatedAt: '2026-10-02T09:55:00-04:00',
    source: 'fictional observed departure',
  };
  return input;
}

for (const [latestFinish, latestStart, latestCompletion] of [
  ['2026-10-02T10:10:00-04:00', '2026-10-02T14:10:00.000Z', '2026-10-02T14:40:00.000Z'],
  ['2026-10-02T10:00:00-04:00', '2026-10-02T14:00:00.000Z', '2026-10-02T14:30:00.000Z'],
]) {
  test('A busy task with an early finish before snapshot cannot start cleaning in the past: ' + latestFinish, () => {
    const input = busyInput(latestFinish);
    const before = structuredClone(input);
    const bed = forecastBeds(freeze(input)).beds[0];
    assert.equal(bed.status, 'estimated');
    assert.deepEqual(bed.reasons, []);
    assert.deepEqual(bed.startWindow, ['2026-10-02T14:00:00.000Z', latestStart]);
    assert.deepEqual(bed.completionWindow, ['2026-10-02T14:20:00.000Z', latestCompletion]);
    assert.equal(bed.actualStatus, 'awaiting_cleaning');
    assert.deepEqual(input, before);
  });
}

test('A fully elapsed busy-task window still needs review even with fresh records', () => {
  const input = busyInput('2026-10-02T09:59:00-04:00');
  const before = structuredClone(input);
  const bed = forecastBeds(freeze(input)).beds[0];
  assert.equal(bed.status, 'needs_review');
  assert.deepEqual(bed.reasons, ['task_estimate_passed']);
  for (const field of ['startWindow', 'completionWindow', 'readyWindow', 'release']) {
    assert.equal(bed[field], null);
  }
  assert.deepEqual(input, before);
});
