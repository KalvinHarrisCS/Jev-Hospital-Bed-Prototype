const time = (input, clock) => input.snapshot.slice(0, 10) + 'T' + clock + input.snapshot.slice(-6);
const future = input => time(input, '23:59:00');
const set = (path, value) => input => {
  const keys = path.replaceAll('[', '.').replaceAll(']', '').split('.');
  const field = keys.pop(); let target = input;
  for (const key of keys) target = target[key];
  target[field] = typeof value === 'function' ? value(input) : structuredClone(value);
};
const row = (name, path, reason, value) => [name, path, reason, set(path, value)];
const extraBed = input => input.beds.push({...structuredClone(input.beds[0]), bedId: 'MAT-02'});

export const invalidCases = [
  row('zero-length shift', 'cleaner.shift', 'invalid_schedule', input => [time(input, '10:00:00'), time(input, '10:00:00')]),
  row('impossible calendar date', 'snapshot', 'invalid_timestamp', '2026-02-30T09:00:00-05:00'),
  row('timestamp without an offset', 'snapshot', 'invalid_timestamp', '2026-10-02T09:00:00'),
  row('timestamp with UTC Z instead of numeric offset', 'snapshot', 'invalid_timestamp', '2026-10-02T13:00:00Z'),
  row('wrong New York offset for the date', 'snapshot', 'invalid_timestamp', '2026-10-02T09:00:00-05:00'),
  row('future staff update', 'cleaner.updatedAt', 'future_update', future),
  row('future departure update', 'beds[0].departure.updatedAt', 'future_update', future),
  row('staff update without an offset', 'cleaner.updatedAt', 'invalid_timestamp', '2026-10-02T09:00:00'),
  row('staff update on a different date', 'cleaner.updatedAt', 'invalid_timestamp', '2026-10-01T09:00:00-04:00'),
  row('departure uses another offset', 'beds[0].departure.window', 'invalid_timestamp', input =>
    [time(input, '09:00:00').replace('-04:00', '-05:00'), time(input, '09:00:00').replace('-04:00', '-05:00')]),
  row('reversed shift', 'cleaner.shift', 'invalid_window', input =>
    [time(input, '15:00:00'), time(input, '07:00:00')]),
  row('reversed departure window', 'beds[0].departure.window', 'invalid_window', input =>
    [time(input, '10:00:00'), time(input, '09:00:00')]),
  ['nonexact observed departure', 'beds[0].departure.window', 'invalid_window', input => {
    input.beds[0].departure.kind = 'observed';
    input.beds[0].departure.window = [time(input, '08:00:00'), time(input, '08:01:00')];
  }],
  ['future observed departure', 'beds[0].departure.window', 'future_observed_departure', input => {
    input.beds[0].departure.kind = 'observed'; input.beds[0].departure.window = [future(input), future(input)];
  }],
  ['reversed current task window', 'cleaner.taskFinishWindow', 'invalid_window', input => {
    input.cleaner.currentWork = 'busy'; input.cleaner.taskFinishWindow = [time(input, '11:00:00'), time(input, '10:00:00')];
  }],
  ['unknown work state still validates the supplied task window', 'cleaner.taskFinishWindow', 'invalid_window', input => {
    input.cleaner.currentWork = 'unknown'; input.cleaner.taskFinishWindow = [time(input, '11:00:00'), time(input, '10:00:00')];
  }],
  ['idle cleaner with a task window', 'cleaner.taskFinishWindow', 'invalid_schedule', input => {
    input.cleaner.currentWork = 'idle'; input.cleaner.taskFinishWindow = [time(input, '10:00:00'), time(input, '10:00:00')];
  }],
  ['overlapping breaks', 'cleaner.breaks', 'invalid_schedule', input => {
    input.cleaner.breaks = [[time(input, '10:00:00'), time(input, '10:30:00')],
      [time(input, '10:20:00'), time(input, '10:40:00')]];
  }],
  ['break outside shift', 'cleaner.breaks', 'invalid_schedule', input => {
    input.cleaner.breaks = [[input.cleaner.shift[0], time(input, '23:59:00')]];
  }],
  ['zero-length break', 'cleaner.breaks', 'invalid_schedule', input => {
    input.cleaner.breaks = [[time(input, '10:00:00'), time(input, '10:00:00')]];
  }],
  ['duplicate bed ID', 'beds[1].bedId', 'duplicate_bed', input => input.beds.push(structuredClone(input.beds[0]))],
  ['override omits an active bed', 'queueOverride.bedIds', 'invalid_queue_override', input => {
    extraBed(input); input.queueOverride = {bedIds: [input.beds[0].bedId], reason: 'Demo queue'};
  }],
  ['override repeats a bed', 'queueOverride.bedIds', 'invalid_queue_override', input => {
    input.queueOverride = {bedIds: [input.beds[0].bedId, input.beds[0].bedId], reason: 'Demo queue'};
  }],
  ['override includes a held bed', 'queueOverride.bedIds', 'invalid_queue_override', input => {
    input.beds[0].holds = ['demo_hold']; input.queueOverride = {bedIds: [input.beds[0].bedId], reason: 'Demo queue'};
  }],
  ['override names a nonexistent bed', 'queueOverride.bedIds', 'invalid_queue_override', input => {
    input.queueOverride = {bedIds: ['DOES-NOT-EXIST'], reason: 'Demo queue'};
  }],
  ['override has a blank reason', 'queueOverride.reason', 'invalid_queue_override', input => {
    input.queueOverride = {bedIds: input.beds.map(bed => bed.bedId), reason: ' '};
  }],
  ['override has no reason field', 'queueOverride.reason', 'invalid_schema', input => {
    input.queueOverride = {bedIds: input.beds.map(bed => bed.bedId)};
  }],
  ...[0, -1, NaN, Infinity, '20'].map(value => row('invalid minimum cleaning duration: ' + value,
    'beds[0].cleaning.minutes', 'invalid_duration', [value, 30])),
  ...[0, -1, NaN, Infinity, '30', 10].map(value => row('invalid maximum cleaning duration: ' + value,
    'beds[0].cleaning.minutes', 'invalid_duration', [20, value])),
  row('nonzero travel assumption', 'assumptions.travelMinutes', 'unsupported_assumption', 1),
  row('nonzero release assumption', 'assumptions.releaseDelayMinutes', 'unsupported_assumption', 1),
  row('numeric strings are not coerced', 'maxUpdateAgeMinutes', 'invalid_schema', '30'),
  row('negative freshness age', 'maxUpdateAgeMinutes', 'invalid_schema', -1),
  row('nonfinite freshness age', 'maxUpdateAgeMinutes', 'invalid_schema', Infinity),
  row('unsupported schema version', 'schemaVersion', 'invalid_schema', 2),
  row('unsupported timezone', 'timezone', 'invalid_schema', 'UTC'),
  row('bed is outside the ward', 'beds[0].ward', 'invalid_schema', 'another-demo-ward'),
  row('unsupported actual status', 'beds[0].actualStatus', 'invalid_schema', 'ready'),
  row('unsupported note label', 'beds[0].noteStatus', 'invalid_schema', 'release_now'),
  row('unsupported work state', 'cleaner.currentWork', 'invalid_schema', 'finished'),
  row('repeated hold reason', 'beds[0].holds', 'invalid_schema', ['demo_hold', 'demo_hold']),
  row('blank hold reason', 'beds[0].holds', 'invalid_schema', [' ']),
  ...[['ward', ' '], ['cleaner.cleanerId', ''], ['beds[0].bedId', ' '], ['assumptions.source', ''],
    ['beds', {}], ['cleaner', 1], ['beds[0].cleaning', null], ['beds[0].holds', null]].map(([path, value]) =>
    row('invalid field type or empty identifier: ' + path, path, 'invalid_schema', value)),
];
