import assert from 'node:assert/strict';
import test from 'node:test';
import {forecastBeds} from '../forecast.mjs';
import {inputFor} from './helpers.mjs';

test('A fresh observed departure never starts cleaning before the snapshot', () => {
  const input = inputFor();
  input.cleaner.breaks = [];
  input.beds[0].actualStatus = 'awaiting_cleaning';
  input.beds[0].departure.kind = 'observed';
  input.beds[0].departure.source = 'fictional observed departure';
  input.beds[0].departure.window = [
    '2026-10-02T09:55:00-04:00',
    '2026-10-02T09:55:00-04:00',
  ];

  const bed = forecastBeds(input).beds[0];

  assert.equal(bed.status, 'estimated');
  assert.deepEqual(bed.reasons, []);
  assert.deepEqual(bed.startWindow, [
    '2026-10-02T14:00:00.000Z',
    '2026-10-02T14:00:00.000Z',
  ]);
  assert.deepEqual(bed.completionWindow, [
    '2026-10-02T14:20:00.000Z',
    '2026-10-02T14:30:00.000Z',
  ]);
});

for (const record of [
  {age: '30 minutes and 1 second', updatedAt: '2026-10-02T09:29:59-04:00'},
  {age: '30 minutes and 59 seconds', updatedAt: '2026-10-02T09:29:01-04:00'},
]) {
  test('A departure update ' + record.age + ' old is stale', () => {
    const input = inputFor();
    input.beds[0].departure.updatedAt = record.updatedAt;

    const bed = forecastBeds(input).beds[0];

    assert.equal(bed.status, 'needs_review');
    assert.deepEqual(bed.reasons, ['stale_departure']);
    assert.equal(bed.startWindow, null);
    assert.equal(bed.completionWindow, null);
    assert.equal(bed.readyWindow, null);
    assert.equal(bed.release, null);
  });
}

test('A held bed with no departure keeps both reasons and does not block another room', () => {
  const input = inputFor();
  const expectedRoom = forecastBeds(input).beds[0];
  const heldBed = structuredClone(input.beds[0]);
  heldBed.bedId = 'MAT-00';
  heldBed.holds = ['equipment_hold'];
  heldBed.departure = null;
  input.beds.unshift(heldBed);

  const result = forecastBeds(input);
  const held = result.beds.find(bed => bed.bedId === 'MAT-00');
  const otherRoom = result.beds.find(bed => bed.bedId === 'MAT-01');

  assert.deepEqual(result.queue, ['MAT-01']);
  assert.equal(held.status, 'blocked');
  assert.deepEqual(held.reasons, ['missing_departure', 'unresolved_hold']);
  assert.equal(held.startWindow, null);
  assert.equal(held.completionWindow, null);
  assert.equal(held.readyWindow, null);
  assert.equal(held.release, null);
  assert.deepEqual(otherRoom, expectedRoom);
});

test('A break starting before the shift is rejected as an invalid schedule', () => {
  const input = inputFor();
  input.cleaner.breaks = [[
    '2026-10-02T06:45:00-04:00',
    '2026-10-02T07:15:00-04:00',
  ]];

  assert.throws(() => forecastBeds(input), error => {
    assert.equal(error.code, 'INVALID_INPUT');
    assert.deepEqual(error.issues, [{path: 'cleaner.breaks', reason: 'invalid_schedule'}]);
    return true;
  });
});
