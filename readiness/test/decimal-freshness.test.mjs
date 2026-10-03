import assert from 'node:assert/strict';
import test from 'node:test';
import {forecastBeds} from '../forecast.mjs';
import {inputFor, freeze} from './helpers.mjs';

const exactLimit = '2026-10-02T09:55:54-04:00';
const oneMillisecondOlder = '2026-10-02T09:55:53.999-04:00';

function decimalAgeInput() {
  const input = inputFor();
  input.maxUpdateAgeMinutes = 4.1;
  input.beds[0].departure.updatedAt = exactLimit;
  input.cleaner.updatedAt = exactLimit;
  return input;
}

function forecastWithoutChanges(input) {
  const original = structuredClone(input);
  const result = forecastBeds(freeze(input));
  assert.deepEqual(input, original);
  return result;
}

test('A 4.1-minute age limit includes records exactly 246000 milliseconds old', () => {
  const input = decimalAgeInput();
  assert.equal(Date.parse(input.snapshot) - Date.parse(exactLimit), 246000);
  const bed = forecastWithoutChanges(input).beds[0];
  assert.equal(bed.status, 'estimated');
  assert.deepEqual(bed.reasons, []);
  assert.deepEqual(bed.completionWindow,
    ['2026-10-02T14:50:00.000Z', '2026-10-02T15:00:00.000Z']);
});

for (const record of ['departure', 'cleaner', 'both']) {
  test(`One millisecond beyond a decimal freshness limit is stale: ${record}`, () => {
    const input = decimalAgeInput();
    if (record !== 'cleaner') input.beds[0].departure.updatedAt = oneMillisecondOlder;
    if (record !== 'departure') input.cleaner.updatedAt = oneMillisecondOlder;
    const bed = forecastWithoutChanges(input).beds[0];
    const reasons = record === 'both' ? ['stale_departure', 'stale_staff'] :
      [record === 'departure' ? 'stale_departure' : 'stale_staff'];
    assert.equal(bed.status, 'needs_review');
    assert.deepEqual(bed.reasons, reasons);
    assert.equal(bed.startWindow, null);
    assert.equal(bed.completionWindow, null);
    assert.equal(bed.readyWindow, null);
    assert.equal(bed.release, null);
  });
}

test('Observed records still use the same decimal freshness rule and keep their event kind', () => {
  const input = decimalAgeInput();
  const bed = input.beds[0];
  bed.actualStatus = 'awaiting_cleaning';
  bed.departure.kind = 'observed';
  bed.departure.source = 'fictional observed departure';
  bed.departure.window = ['2026-10-02T09:55:00-04:00', '2026-10-02T09:55:00-04:00'];
  assert.equal(forecastWithoutChanges(input).beds[0].status, 'estimated');

  const older = structuredClone(input);
  older.beds[0].departure.updatedAt = oneMillisecondOlder;
  const result = forecastWithoutChanges(older).beds[0];
  assert.equal(result.status, 'needs_review');
  assert.deepEqual(result.reasons, ['stale_departure']);
  assert.equal(result.actualStatus, 'awaiting_cleaning');
  assert.equal(older.beds[0].departure.kind, 'observed');
});
