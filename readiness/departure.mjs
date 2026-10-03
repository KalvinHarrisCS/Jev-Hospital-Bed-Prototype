// Demo labels restrict fictional inputs; they do not authenticate a record's source.
const approvedSources = {
  estimated: 'fictional nurse-entered estimate',
  observed: 'fictional observed departure',
};

export function hasTrustedDepartureSource(departure) {
  const expectedSource = approvedSources[departure?.kind];
  return typeof expectedSource === 'string' && departure.source === expectedSource;
}

export function hasTrustedDepartureBound(bed) {
  return Boolean(bed.departure?.window) && hasTrustedDepartureSource(bed.departure);
}
