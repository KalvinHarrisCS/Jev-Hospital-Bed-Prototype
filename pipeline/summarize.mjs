const procedures = {
  PGN003: 'CESAREAN SECTION',
  PGN002: 'SPONTANEOUS VAGINAL DELIVERY',
  FRS001: 'HYSTERECTOMY'
};

function fail(message, code = 'INVALID_INPUT') {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function checkFields(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value)) ||
      Reflect.ownKeys(value).length !== fields.length ||
      !fields.every(field => Object.hasOwn(value, field))) {
    fail('Use exactly these fields: ' + fields.join(', '));
  }
}

/** Summarize one validated frequency table in whole-admission patient days. */
export function summarizeCohort(input) {
  checkFields(input, ['schemaVersion', 'procedureCode', 'year',
    'expectedDischarges', 'source', 'histogram']);
  const {schemaVersion, procedureCode, year, expectedDischarges, source} = input;
  if (schemaVersion !== 1 || typeof procedureCode !== 'string' || !Object.hasOwn(procedures, procedureCode) ||
      ![2023, 2024].includes(year) || !Number.isSafeInteger(expectedDischarges) ||
      expectedDischarges < 0 || !Array.isArray(input.histogram)) {
    fail('Invalid cohort version, procedure, year, total or histogram.');
  }
  checkFields(source, ['kind', 'datasetId', 'retrievedAt', 'query', 'codingVersion']);
  const publicData = source.kind === 'sparcs-public-aggregate';
  const datasetId = publicData ? {2023: '46xm-urtu', 2024: 'sf4k-39ay'}[year] : 'fixture-' + year;
  const timestamp = typeof source.retrievedAt === 'string' ? Date.parse(source.retrievedAt) : NaN;
  if (!['synthetic', 'sparcs-public-aggregate'].includes(source.kind) ||
      source.datasetId !== datasetId ||
      source.codingVersion !== (publicData ? 'CCSR 2025.1' : 'fixture-v1') ||
      !Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== source.retrievedAt ||
      typeof source.query !== 'string' || !source.query.trim()) {
    fail('Invalid source metadata.');
  }

  const seen = new Set();
  let total = 0n;
  const histogram = Array.from(input.histogram, row => {
    checkFields(row, ['lengthOfStay', 'discharges']);
    const {lengthOfStay, discharges} = row;
    const day = typeof lengthOfStay === 'string' ? Number(lengthOfStay) : NaN;
    const validStay = lengthOfStay === '120+' ||
      (Number.isInteger(day) && day >= 1 && day <= 119 && String(day) === lengthOfStay);
    if (!validStay || !Number.isSafeInteger(discharges) || discharges <= 0) {
      fail('Stay bins need a canonical day label and a positive safe count.');
    }
    if (seen.has(lengthOfStay)) fail('Repeated stay bin: ' + lengthOfStay, 'DUPLICATE_BIN');
    seen.add(lengthOfStay);
    total += BigInt(discharges);
    if (total > BigInt(Number.MAX_SAFE_INTEGER)) fail('The discharge total is unsafe.');
    return {lengthOfStay, discharges};
  }).sort((a, b) => parseInt(a.lengthOfStay, 10) - parseInt(b.lengthOfStay, 10));
  if (total !== BigInt(expectedDischarges)) fail('Discharge totals do not match.', 'COUNT_MISMATCH');

  // Integer arithmetic keeps nearest ranks exact even at the safe-count limit.
  function quantile(quarters) {
    if (total === 0n) return null;
    const rank = (total * BigInt(quarters) + 3n) / 4n;
    let cumulative = 0n;
    for (const row of histogram) {
      cumulative += BigInt(row.discharges);
      if (cumulative >= rank) return row.lengthOfStay === '120+' ? '120+' : Number(row.lengthOfStay);
    }
  }
  return {schemaVersion, procedureCode, procedureDescription: procedures[procedureCode], year,
    source: {...source}, unit: 'patient_days', quantileMethod: 'weighted_nearest_rank',
    discharges: expectedDischarges, p25PatientDays: quantile(1), medianPatientDays: quantile(2),
    p75PatientDays: quantile(3), censoredDischarges: histogram.find(row => row.lengthOfStay === '120+')?.discharges ?? 0,
    smallSample: expectedDischarges > 0 && expectedDischarges < 30,
    status: total === 0n ? 'empty' : 'ok', histogram};
}
