import assert from 'node:assert/strict';
import test from 'node:test';
import {forecastBeds} from '../forecast.mjs';
import {inputFor} from './helpers.mjs';

test('Equal departure bounds sort bed IDs by Unicode code point', () => {
  const input = inputFor(); input.beds[0].bedId = 'MAT-\u{10000}';
  input.beds.push({...structuredClone(input.beds[0]), bedId: 'MAT-\uE000'});
  const result = forecastBeds(input);
  assert.deepEqual(result.queue, ['MAT-\uE000', 'MAT-\u{10000}']);
  assert.deepEqual(result.beds.map(bed => bed.bedId), input.beds.map(bed => bed.bedId));
});

for (const minutes of [[1e-8, 2e-8], [0.000025, 0.00005]]) {
  test('Reject duration bounds that cannot be represented as whole milliseconds: ' + minutes, () => {
    const input = inputFor(); input.beds[0].cleaning.minutes = minutes;
    assert.throws(() => forecastBeds(input), error => error.code === 'INVALID_INPUT' &&
      error.issues.some(issue => issue.path === 'beds[0].cleaning.minutes' && issue.reason === 'invalid_duration'));
  });
}

test('An exact one-millisecond duration produces distinct ordered timestamps', () => {
  const input = inputFor(); input.cleaner.breaks = [];
  input.beds[0].departure.window = [input.snapshot, input.snapshot];
  input.beds[0].cleaning.minutes = [1 / 60000, 2 / 60000];
  const result = forecastBeds(input).beds[0];
  assert.equal(result.status, 'estimated');
  assert.deepEqual(result.completionWindow, ['2026-10-02T14:00:00.001Z', '2026-10-02T14:00:00.002Z']);
});
