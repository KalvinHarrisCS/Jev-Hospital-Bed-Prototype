import assert from 'node:assert/strict';
import test from 'node:test';
import {forecastBeds} from '../forecast.mjs';
import {inputFor, freeze} from './helpers.mjs';

function forecastWithoutChanges(input) {
  const original = structuredClone(input);
  const result = forecastBeds(freeze(input));
  assert.deepEqual(input, original);
  assert.deepEqual(result.beds.map(bed => bed.actualStatus), input.beds.map(bed => bed.actualStatus));
  return result;
}

function assertUnavailable(bed, status, reasons) {
  assert.equal(bed.status, status);
  assert.deepEqual(bed.reasons, reasons);
  assert.equal(bed.startWindow, null);
  assert.equal(bed.completionWindow, null);
  assert.equal(bed.readyWindow, null);
  assert.equal(bed.release, null);
}

function modelWindow(start, end) {
  const input = inputFor('two-rooms');
  input.beds[0].departure.source = 'Jev note';
  input.beds[0].departure.window = [
    `2026-10-02T${start}:00-04:00`, `2026-10-02T${end}:00-04:00`,
  ];
  return input;
}

test('A model departure window cannot change another room by moving before or after it', () => {
  const early = forecastWithoutChanges(modelWindow('10:05', '10:10'));
  const late = forecastWithoutChanges(modelWindow('10:45', '10:50'));
  assert.equal(early.queue, null);
  assert.equal(late.queue, null);
  assert.deepEqual(early.beds[1], late.beds[1]);
  assertUnavailable(early.beds[0], 'needs_review', ['untrusted_departure_source']);
  assertUnavailable(late.beds[0], 'needs_review', ['untrusted_departure_source']);
  assertUnavailable(early.beds[1], 'unknown', ['upstream_queue_unknown']);
});

for (const source of [null, 'model output', 'fictional observed departure']) {
  test(`A departure bound without its matching approved source makes queue position unknown: ${source}`, () => {
    const input = inputFor('two-rooms');
    input.beds[0].departure.source = source;
    const result = forecastWithoutChanges(input);
    assert.equal(result.queue, null);
    assertUnavailable(result.beds[0], source === null ? 'unknown' : 'needs_review',
      [source === null ? 'missing_departure_source' : 'untrusted_departure_source']);
    assertUnavailable(result.beds[1], 'unknown', ['upstream_queue_unknown']);
  });
}

test('An observed bound also needs its observed source label for queue ordering', () => {
  const input = inputFor('two-rooms');
  const bed = input.beds[0];
  bed.actualStatus = 'awaiting_cleaning';
  bed.departure.kind = 'observed';
  bed.departure.window = ['2026-10-02T09:55:00-04:00', '2026-10-02T09:55:00-04:00'];
  const result = forecastWithoutChanges(input);
  assert.equal(result.queue, null);
  assertUnavailable(result.beds[0], 'needs_review', ['untrusted_departure_source']);
  assertUnavailable(result.beds[1], 'unknown', ['upstream_queue_unknown']);
});

test('A validated staff override can place the model room after the trusted room', () => {
  const input = modelWindow('10:05', '10:10');
  input.queueOverride = {bedIds: ['MAT-02', 'MAT-01'], reason: 'fictional staff-entered order'};
  const result = forecastWithoutChanges(input);
  assert.deepEqual(result.queue, ['MAT-02', 'MAT-01']);
  assertUnavailable(result.beds[0], 'needs_review', ['untrusted_departure_source']);
  assert.equal(result.beds[1].status, 'estimated');
  assert.deepEqual(result.beds[1].reasons, []);
  assert.deepEqual(result.beds[1].completionWindow,
    ['2026-10-02T14:50:00.000Z', '2026-10-02T15:00:00.000Z']);
});

test('An override that puts the model room first still makes its dependents uncertain', () => {
  const input = modelWindow('10:45', '10:50');
  input.queueOverride = {bedIds: ['MAT-01', 'MAT-02'], reason: 'fictional staff-entered order'};
  const result = forecastWithoutChanges(input);
  assert.deepEqual(result.queue, ['MAT-01', 'MAT-02']);
  assertUnavailable(result.beds[0], 'needs_review', ['untrusted_departure_source']);
  assertUnavailable(result.beds[1], 'unknown', ['upstream_queue_unknown']);
});

test('A held model room leaves the queue and never gives another room an upstream reason', () => {
  const input = modelWindow('10:05', '10:10');
  input.beds[0].holds = ['equipment'];
  const result = forecastWithoutChanges(input);
  assert.deepEqual(result.queue, ['MAT-02']);
  assertUnavailable(result.beds[0], 'blocked', ['unresolved_hold', 'untrusted_departure_source']);
  assert.equal(result.beds[1].status, 'estimated');
  assert.deepEqual(result.beds[1].reasons, []);
  assert.deepEqual(result.beds[1].completionWindow,
    ['2026-10-02T14:50:00.000Z', '2026-10-02T15:00:00.000Z']);
});

test('A single model room has a known position but no forecast', () => {
  const input = inputFor();
  input.beds[0].departure.source = 'Jev note';
  const result = forecastWithoutChanges(input);
  assert.deepEqual(result.queue, ['MAT-01']);
  assertUnavailable(result.beds[0], 'needs_review', ['untrusted_departure_source']);
});

test('With no trusted departure bounds, no bed gets a derived upstream reason', () => {
  const input = inputFor('two-rooms');
  input.beds[0].departure.source = 'Jev note';
  input.beds[1].departure.source = null;
  const result = forecastWithoutChanges(input);
  assert.equal(result.queue, null);
  assertUnavailable(result.beds[0], 'needs_review', ['untrusted_departure_source']);
  assertUnavailable(result.beds[1], 'unknown', ['missing_departure_source']);
});
