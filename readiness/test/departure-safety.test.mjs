import assert from 'node:assert/strict';
import test from 'node:test';
import {forecastBeds} from '../forecast.mjs';
import {inputFor, freeze} from './helpers.mjs';

const timestamp = clock => `2026-10-02T${clock}:00-04:00`;

function recordObservedDeparture(bed, eventTime = '09:55', updateTime = eventTime) {
  bed.actualStatus = 'awaiting_cleaning';
  bed.departure = {
    kind: 'observed', window: [timestamp(eventTime), timestamp(eventTime)],
    updatedAt: timestamp(updateTime), source: 'fictional observed departure',
  };
}

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

for (const source of ['Jev note', 'model output', 'anylabel', 'fictional nurse-entered estimate ']) {
  test(`An unapproved departure source needs review: ${source}`, () => {
    const input = inputFor();
    input.beds[0].departure.source = source;
    const bed = forecastWithoutChanges(input).beds[0];
    assertUnavailable(bed, 'needs_review', ['untrusted_departure_source']);
  });
}

for (const kind of ['estimated', 'observed']) {
  test(`The approved source must match the departure kind: ${kind}`, () => {
    const input = inputFor();
    if (kind === 'observed') recordObservedDeparture(input.beds[0]);
    input.beds[0].departure.source = kind === 'estimated' ?
      'fictional observed departure' : 'fictional nurse-entered estimate';
    assertUnavailable(forecastWithoutChanges(input).beds[0], 'needs_review', ['untrusted_departure_source']);
  });

  test(`A consistent ${kind} departure with its approved demo source can forecast`, () => {
    const input = inputFor();
    if (kind === 'observed') recordObservedDeparture(input.beds[0]);
    const bed = forecastWithoutChanges(input).beds[0];
    assert.equal(bed.status, 'estimated');
    assert.deepEqual(bed.reasons, []);
    assert.deepEqual(bed.startWindow, ['2026-10-02T14:30:00.000Z', '2026-10-02T14:30:00.000Z']);
    assert.deepEqual(bed.completionWindow, ['2026-10-02T14:50:00.000Z', '2026-10-02T15:00:00.000Z']);
  });
}

test('A null departure source stays missing information', () => {
  const input = inputFor();
  input.beds[0].departure.source = null;
  assertUnavailable(forecastWithoutChanges(input).beds[0], 'unknown', ['missing_departure_source']);
});

const problems = [
  {name: 'an occupied bed with an observed departure', reason: 'departure_state_mismatch', change(bed) {
    recordObservedDeparture(bed); bed.actualStatus = 'occupied';
  }},
  {name: 'a bed awaiting cleaning with an estimated departure', reason: 'departure_state_mismatch', change(bed) {
    bed.actualStatus = 'awaiting_cleaning';
  }},
  {name: 'an observed record updated before its event', reason: 'departure_record_mismatch', change(bed) {
    recordObservedDeparture(bed, '09:55', '09:50');
  }},
  {name: 'an unapproved departure source', reason: 'untrusted_departure_source', change(bed) {
    bed.departure.source = 'Jev note';
  }},
];

for (const problem of problems) {
  test(`${problem.name} needs review and makes the next room uncertain`, () => {
    const input = inputFor('two-rooms');
    problem.change(input.beds[0]);
    const result = forecastWithoutChanges(input);
    assert.deepEqual(result.queue, ['MAT-01', 'MAT-02']);
    assertUnavailable(result.beds[0], 'needs_review', [problem.reason]);
    assertUnavailable(result.beds[1], 'unknown', ['upstream_queue_unknown']);
  });
}

test('A hold keeps every direct departure reason and remains blocked', () => {
  const input = inputFor();
  const bed = input.beds[0];
  recordObservedDeparture(bed, '09:55', '09:29');
  bed.actualStatus = 'occupied';
  bed.departure.source = 'model output';
  bed.cleaning.minutes = null;
  bed.holds = ['equipment'];
  input.cleaner.updatedAt = timestamp('09:29');
  const result = forecastWithoutChanges(input);
  assert.deepEqual(result.queue, []);
  assertUnavailable(result.beds[0], 'blocked', [
    'departure_record_mismatch', 'departure_state_mismatch', 'missing_duration',
    'stale_departure', 'stale_staff', 'unresolved_hold', 'untrusted_departure_source',
  ]);
});

test('An observed record updated after the event can forecast', () => {
  const input = inputFor();
  recordObservedDeparture(input.beds[0], '09:50', '09:55');
  const bed = forecastWithoutChanges(input).beds[0];
  assert.equal(bed.status, 'estimated');
  assert.deepEqual(bed.reasons, []);
});
