// Demo labels restrict fictional inputs; they do not authenticate a record's source.
const approvedSources = {
  estimated: 'fictional nurse-entered estimate',
  observed: 'fictional observed departure',
};
const expectedStates = {
  estimated: 'occupied',
  observed: 'awaiting_cleaning',
};

export function hasTrustedDepartureSource(departure) {
  const expectedSource = approvedSources[departure?.kind];
  return typeof expectedSource === 'string' && departure.source === expectedSource;
}

export function hasMatchingDepartureState(bed) {
  const expectedState = expectedStates[bed.departure?.kind];
  return typeof expectedState === 'string' && bed.actualStatus === expectedState;
}

export function hasObservedRecordMismatch(departure) {
  if (departure?.kind !== 'observed' || !departure.window || departure.updatedAt === null) {
    return false;
  }
  return Date.parse(departure.updatedAt) < Date.parse(departure.window[0]);
}

export function hasTrustedDepartureBound(bed) {
  return Boolean(bed.departure?.window) &&
    hasTrustedDepartureSource(bed.departure) && hasMatchingDepartureState(bed) &&
    !hasObservedRecordMismatch(bed.departure);
}
