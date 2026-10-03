import assert from 'node:assert/strict';
import test from 'node:test';
import {forecastBeds} from '../forecast.mjs';
import {inputFor, freeze} from './helpers.mjs';

const time = clock => `2026-10-02T${clock}:00-04:00`;

function observedRecord(bed, event, update) {
  bed.actualStatus = 'awaiting_cleaning';
  bed.departure = {
    kind: 'observed',
    window: [time(event), time(event)],
    updatedAt: update === null ? null : time(update),
    source: 'fictional observed departure',
  };
}

function contradictoryInput(event = '09:40') {
  const input = inputFor('two-rooms');
  observedRecord(input.beds[0], event, '09:30');
  observedRecord(input.beds[1], '09:45', '09:55');
  return input;
}

function forecastUnchanged(input) {
  const before = structuredClone(input);
  const result = forecastBeds(freeze(input));
  assert.deepEqual(input, before);
  assert.deepEqual(result.beds.map(bed => bed.actualStatus), before.beds.map(bed => bed.actualStatus));
  return result;
}

function unavailable(bed, status, reasons) {
  assert.equal(bed.status, status);
  assert.deepEqual(bed.reasons, reasons);
  for (const field of ['startWindow', 'completionWindow', 'readyWindow', 'release']) {
    assert.equal(bed[field], null);
  }
}

test('An observed event recorded before it occurred cannot reorder another room', () => {
  const early = forecastUnchanged(contradictoryInput('09:40'));
  const late = forecastUnchanged(contradictoryInput('09:50'));
  assert.equal(early.queue, null);
  assert.equal(late.queue, null);
  unavailable(early.beds[0], 'needs_review', ['departure_record_mismatch']);
  unavailable(late.beds[0], 'needs_review', ['departure_record_mismatch']);
  unavailable(early.beds[1], 'unknown', ['upstream_queue_unknown']);
  assert.deepEqual(early.beds[1], late.beds[1]);
});

for (const contradictionFirst of [false, true]) {
  test('An override orders a contradictory observed record without making it usable: first=' + contradictionFirst, () => {
    const input = contradictoryInput('09:50');
    const order = contradictionFirst ? ['MAT-01', 'MAT-02'] : ['MAT-02', 'MAT-01'];
    input.queueOverride = {bedIds: order, reason: 'fictional staff-entered order'};
    const result = forecastUnchanged(input);
    assert.deepEqual(result.queue, order);
    unavailable(result.beds[0], 'needs_review', ['departure_record_mismatch']);
    if (contradictionFirst) unavailable(result.beds[1], 'unknown', ['upstream_queue_unknown']);
    else {
      assert.equal(result.beds[1].status, 'estimated');
      assert.deepEqual(result.beds[1].reasons, []);
      assert.deepEqual(result.beds[1].completionWindow,
        ['2026-10-02T14:50:00.000Z', '2026-10-02T15:00:00.000Z']);
    }
  });
}

test('A held contradictory observed record leaves another room in the queue', () => {
  const input = contradictoryInput();
  input.beds[0].holds = ['equipment'];
  const result = forecastUnchanged(input);
  assert.deepEqual(result.queue, ['MAT-02']);
  unavailable(result.beds[0], 'blocked', ['departure_record_mismatch', 'unresolved_hold']);
  assert.equal(result.beds[1].status, 'estimated');
  assert.deepEqual(result.beds[1].reasons, []);
});

test('A single contradictory observed record keeps a known position without a forecast', () => {
  const input = contradictoryInput();
  input.beds = [input.beds[0]];
  const result = forecastUnchanged(input);
  assert.deepEqual(result.queue, ['MAT-01']);
  unavailable(result.beds[0], 'needs_review', ['departure_record_mismatch']);
});

test('A missing observed-record update preserves event order and its missing-update reason', () => {
  const input = contradictoryInput();
  input.beds[0].departure.updatedAt = null;
  const result = forecastUnchanged(input);
  assert.deepEqual(result.queue, ['MAT-01', 'MAT-02']);
  unavailable(result.beds[0], 'unknown', ['missing_departure_update']);
  unavailable(result.beds[1], 'unknown', ['upstream_queue_unknown']);
});

test('A stale consistent observed record preserves event order and needs review', () => {
  const input = contradictoryInput();
  observedRecord(input.beds[0], '09:20', '09:25');
  const result = forecastUnchanged(input);
  assert.deepEqual(result.queue, ['MAT-01', 'MAT-02']);
  unavailable(result.beds[0], 'needs_review', ['stale_departure']);
  unavailable(result.beds[1], 'unknown', ['upstream_queue_unknown']);
});
