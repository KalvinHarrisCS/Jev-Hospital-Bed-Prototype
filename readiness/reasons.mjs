const reviewReasons = new Set([
  'stale_departure', 'stale_staff', 'departure_estimate_passed', 'task_estimate_passed',
  'untrusted_departure_source', 'departure_state_mismatch', 'departure_record_mismatch',
]);

// Demo labels restrict fictional inputs; they do not authenticate a record's source.
const approvedDepartureSources = {
  estimated: 'fictional nurse-entered estimate',
  observed: 'fictional observed departure',
};

function departureSafetyReasons(bed) {
  const departure = bed.departure;
  const reasons = [];
  if (departure.source !== null && departure.source !== approvedDepartureSources[departure.kind]) {
    reasons.push('untrusted_departure_source');
  }
  const expectedState = departure.kind === 'observed' ? 'awaiting_cleaning' : 'occupied';
  if (bed.actualStatus !== expectedState) reasons.push('departure_state_mismatch');
  if (departure.kind === 'observed' && departure.window && departure.updatedAt !== null &&
      Date.parse(departure.updatedAt) < Date.parse(departure.window[0])) {
    reasons.push('departure_record_mismatch');
  }
  return reasons;
}

export function statusFor(reasons) {
  if (reasons.includes('unresolved_hold')) return 'blocked';
  if (reasons.some(reason => reviewReasons.has(reason))) return 'needs_review';
  return reasons.length ? 'unknown' : 'estimated';
}

export function directReasons(input, bed) {
  const reasons = []; const now = Date.parse(input.snapshot);
  const ageLimit = input.maxUpdateAgeMinutes * 60000;
  const freshness = (time, missing, stale) => {
    if (time === null) reasons.push(missing);
    else if (now - Date.parse(time) > ageLimit) reasons.push(stale);
  };
  if (bed.holds.length) reasons.push('unresolved_hold');
  const departure = bed.departure;
  if (!departure?.window) reasons.push('missing_departure');
  if (departure) {
    reasons.push(...departureSafetyReasons(bed));
    freshness(departure.updatedAt, 'missing_departure_update', 'stale_departure');
    if (departure.source === null) reasons.push('missing_departure_source');
    if (departure.kind === 'estimated' && bed.actualStatus === 'occupied' && departure.window &&
        Date.parse(departure.window[1]) < now) reasons.push('departure_estimate_passed');
  }
  if (bed.cleaning.minutes === null) reasons.push('missing_duration');
  if (bed.cleaning.source === null) reasons.push('missing_cleaning_source');
  const cleaner = input.cleaner;
  if (cleaner === null) reasons.push('missing_staff');
  else {
    if (cleaner.role !== 'cleaner' || cleaner.assignedWard !== input.ward) reasons.push('ineligible_cleaner');
    if (cleaner.shift === null) reasons.push('missing_shift');
    if (cleaner.breaks === null) reasons.push('missing_breaks');
    freshness(cleaner.updatedAt, 'missing_staff_update', 'stale_staff');
    if (cleaner.currentWork === 'unknown') reasons.push('missing_staff_work');
    if (cleaner.currentWork === 'busy') {
      if (cleaner.taskFinishWindow === null) reasons.push('missing_task_finish');
      else if (Date.parse(cleaner.taskFinishWindow[1]) < now) reasons.push('task_estimate_passed');
    }
  }
  return [...new Set(reasons)].sort();
}
