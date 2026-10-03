import {validateRequest} from './validate.mjs';
import {directReasons, statusFor} from './reasons.mjs';
import {queueOrder} from './queue.mjs';
import {workPeriods, scheduleBed} from './schedule.mjs';

export function forecastBeds(input) {
  validateRequest(input);
  const queue = queueOrder(input);
  const beds = input.beds.map(bed => {
    const reasons = directReasons(input, bed);
    return {bedId: bed.bedId, snapshot: input.snapshot, actualStatus: bed.actualStatus,
      status: statusFor(reasons), cleanerId: input.cleaner?.cleanerId ?? null,
      startWindow: null, completionWindow: null, readyWindow: null, release: null,
      reasons, assumptions: structuredClone(input.assumptions), noteStatus: bed.noteStatus};
  });
  const rows = new Map(beds.map(bed => [bed.bedId, bed]));
  const inputs = new Map(input.beds.map(bed => [bed.bedId, bed]));
  const addReason = (row, reason) => {
    row.reasons = [...new Set([...row.reasons, reason])].sort(); row.status = statusFor(row.reasons);
  };
  if (queue === null) {
    for (const bed of input.beds) {
      if (!bed.holds.length && bed.departure?.window) addReason(rows.get(bed.bedId), 'upstream_queue_unknown');
    }
  } else {
    const periods = workPeriods(input.cleaner);
    let previous = [0, 1].map(bound => Math.max(Date.parse(input.snapshot),
      input.cleaner?.currentWork === 'busy' && input.cleaner.taskFinishWindow ?
        Date.parse(input.cleaner.taskFinishWindow[bound]) : Date.parse(input.snapshot)));
    let upstreamUnknown = false;
    for (const id of queue) {
      const row = rows.get(id);
      if (upstreamUnknown) addReason(row, 'upstream_queue_unknown');
      if (row.status !== 'estimated') {upstreamUnknown = true; continue;}
      const timing = scheduleBed(input, inputs.get(id), previous, periods);
      if (!timing) {addReason(row, 'no_continuous_work_slot'); upstreamUnknown = true; continue;}
      previous = timing.completions;
      row.startWindow = timing.starts.map(time => new Date(time).toISOString());
      row.completionWindow = timing.completions.map(time => new Date(time).toISOString());
      row.readyWindow = [...row.completionWindow]; row.release = 'pending_staff_release';
    }
  }
  return {schemaVersion: 1, snapshot: input.snapshot, timezone: input.timezone, ward: input.ward, queue, beds};
}
