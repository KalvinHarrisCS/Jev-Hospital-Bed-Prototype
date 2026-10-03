import assert from 'node:assert/strict';
import test from 'node:test';
import {forecastBeds} from '../forecast.mjs';
import {inputFor, freeze} from './helpers.mjs';

const time = clock => `2026-10-02T${clock}:00-04:00`;

function observedDeparture(bed, event) {
  bed.actualStatus = 'awaiting_cleaning';
  bed.departure = {
    kind: 'observed',
    window: [time(event), time(event)],
    updatedAt: time('09:55'),
    source: 'fictional observed departure',
  };
}

function mismatchedInput(kind, later = false) {
  const input = inputFor('two-rooms');
  const bed = input.beds[0];
  if (kind === 'estimated') {
    bed.actualStatus = 'awaiting_cleaning';
    bed.departure.window = later ? [time('10:45'), time('10:50')] : [time('10:05'), time('10:10')];
  } else {
    observedDeparture(bed, later ? '09:50' : '09:40');
    bed.actualStatus = 'occupied';
    observedDeparture(input.beds[1], '09:45');
  }
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

for (const kind of ['estimated', 'observed']) {
  test(`An approved ${kind} departure contradicting bed state cannot reorder another room`, () => {
    const early = forecastUnchanged(mismatchedInput(kind));
    const late = forecastUnchanged(mismatchedInput(kind, true));
    assert.equal(early.queue, null);
    assert.equal(late.queue, null);
    unavailable(early.beds[0], 'needs_review', ['departure_state_mismatch']);
    unavailable(late.beds[0], 'needs_review', ['departure_state_mismatch']);
    unavailable(early.beds[1], 'unknown', ['upstream_queue_unknown']);
    assert.deepEqual(early.beds[1], late.beds[1]);
  });

  for (const mismatchFirst of [false, true]) {
    test(`An override orders a ${kind} state mismatch without making it usable: first=${mismatchFirst}`, () => {
      const input = mismatchedInput(kind, true);
      const order = mismatchFirst ? ['MAT-01', 'MAT-02'] : ['MAT-02', 'MAT-01'];
      input.queueOverride = {bedIds: order, reason: 'fictional staff-entered order'};
      const result = forecastUnchanged(input);
      assert.deepEqual(result.queue, order);
      unavailable(result.beds[0], 'needs_review', ['departure_state_mismatch']);
      if (mismatchFirst) unavailable(result.beds[1], 'unknown', ['upstream_queue_unknown']);
      else {
        assert.equal(result.beds[1].status, 'estimated');
        assert.deepEqual(result.beds[1].reasons, []);
        assert.deepEqual(result.beds[1].completionWindow,
          ['2026-10-02T14:50:00.000Z', '2026-10-02T15:00:00.000Z']);
      }
    });
  }

  test(`A held ${kind} state mismatch leaves another room's queue unchanged`, () => {
    const input = mismatchedInput(kind);
    input.beds[0].holds = ['equipment'];
    const result = forecastUnchanged(input);
    assert.deepEqual(result.queue, ['MAT-02']);
    unavailable(result.beds[0], 'blocked', ['departure_state_mismatch', 'unresolved_hold']);
    assert.equal(result.beds[1].status, 'estimated');
    assert.deepEqual(result.beds[1].reasons, []);
  });

  test(`A single ${kind} state mismatch keeps a known position without a forecast`, () => {
    const input = mismatchedInput(kind);
    input.beds = [input.beds[0]];
    const result = forecastUnchanged(input);
    assert.deepEqual(result.queue, ['MAT-01']);
    unavailable(result.beds[0], 'needs_review', ['departure_state_mismatch']);
  });
}
