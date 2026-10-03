import assert from 'node:assert/strict';
import test from 'node:test';
import {forecastBeds} from '../forecast.mjs';
import {inputFor} from './helpers.mjs';

function availableNow(minutes) {
  const input = inputFor();
  input.cleaner.breaks = [];
  input.beds[0].departure.window = [input.snapshot, input.snapshot];
  input.beds[0].cleaning.minutes = minutes;
  return input;
}

test('Decimal minutes produce exact integer-millisecond completion bounds', () => {
  const input = availableNow([16.1, 32.7]);
  const before = structuredClone(input);
  const bed = forecastBeds(input).beds[0];
  assert.equal(bed.status, 'estimated');
  assert.deepEqual(bed.completionWindow, ['2026-10-02T14:16:06.000Z', '2026-10-02T14:32:42.000Z']);
  assert.deepEqual(input, before);
});

test('A decimal maximum duration can finish exactly at shift end', () => {
  const input = availableNow([16.1, 16.1]);
  input.cleaner.shift = [input.snapshot, '2026-10-02T10:16:06-04:00'];
  const bed = forecastBeds(input).beds[0];
  assert.equal(bed.status, 'estimated');
  assert.deepEqual(bed.completionWindow, ['2026-10-02T14:16:06.000Z', '2026-10-02T14:16:06.000Z']);
});

test('A decimal maximum duration can finish exactly at break start', () => {
  const input = availableNow([32.7, 32.7]);
  input.cleaner.breaks = [['2026-10-02T10:32:42-04:00', '2026-10-02T10:40:00-04:00']];
  const bed = forecastBeds(input).beds[0];
  assert.equal(bed.status, 'estimated');
  assert.deepEqual(bed.completionWindow, ['2026-10-02T14:32:42.000Z', '2026-10-02T14:32:42.000Z']);
});

for (const minutes of [16.100000001, 1.000001 / 60000, (2 ** 51 + 0.5) / 60000]) {
  test('Reject genuinely fractional milliseconds without widening tolerance: ' + minutes, () => {
    const input = availableNow([minutes, minutes]);
    assert.throws(() => forecastBeds(input), error => error.code === 'INVALID_INPUT' &&
      error.issues.some(issue => issue.path === 'beds[0].cleaning.minutes' && issue.reason === 'invalid_duration'));
  });
}
