import {procedures, fields, sourceFor, queryUrls, terms} from './sources.mjs';
import {readPublic, collectionError} from './request.mjs';
import {summarizeCohort} from './summarize.mjs';

function checkMetadata(value, source) {
  if (value?.id !== source.datasetId || value.name !== source.name ||
      !Number.isSafeInteger(value.rowsUpdatedAt) || value.rowsUpdatedAt <= 0 ||
      typeof value.description !== 'string' || !/de-identified/i.test(value.description) ||
      !/does not contain(?: data that is)? protected health information/i.test(value.description) || !value.description.includes('HIPAA') ||
      value.license?.name !== 'See Terms of Use' || !Array.isArray(value.columns) ||
      !fields.every(field => value.columns.filter(column => column.fieldName === field && column.dataTypeName === 'text').length === 1) ||
      !source.documents.every(document => value.metadata?.attachments?.some(item => item.assetId === document.assetId))) {
    throw collectionError('The public source metadata changed or is incomplete. Review it before continuing.');
  }
}

function checkRow(row, keys) {
  if (!row || typeof row !== 'object' || Array.isArray(row) ||
      Object.keys(row).length !== keys.length || !keys.every(key => Object.hasOwn(row, key))) {
    throw collectionError('Unexpected fields in an aggregate response.');
  }
}
function count(value) {
  if (typeof value !== 'string' || !Number.isSafeInteger(Number(value)) || Number(value) < 0 ||
      String(Number(value)) !== value) throw collectionError('Invalid aggregate discharge count.');
  return Number(value);
}

export async function collectPublic({request = readPublic, now = () => new Date().toISOString()} = {}) {
  const retrievedAt = now();
  const read = async (url, format) => {
    try {return await request(url, format);} catch {
      throw collectionError('Public request failed. The collection stopped without saving a snapshot.');
    }
  };
  const proof = await read(terms.url, 'pdf');
  if (proof.sha256 !== terms.sha256) throw collectionError('Open NY terms changed. Review them before updating the recorded hash.');
  const snapshot = {schemaVersion: 1, retrievedAt, terms: {...terms}, sources: [], cohorts: []};
  for (const year of [2023, 2024]) {
    const source = sourceFor(year); const queries = queryUrls(year);
    const metadata = await read(source.metadataUrl, 'json'); checkMetadata(metadata.value, source);
    for (const document of source.documents) {
      const evidence = await read(document.url, 'pdf');
      if (evidence.sha256 !== document.sha256) throw collectionError('The reviewed source document changed. Check its coding version and rules.');
    }
    const reply = await read(queries.histogram, 'json');
    if (!Array.isArray(reply.value) || reply.value.length > 360) throw collectionError('Incomplete or oversized histogram response.');
    const bins = Object.fromEntries(Object.keys(procedures).map(code => [code, []]));
    for (const row of reply.value) {
      checkRow(row, ['procedure_code', 'procedure_description', 'year', 'length_of_stay', 'discharges']);
      if (!Object.hasOwn(procedures, row.procedure_code) || row.year !== String(year) ||
          row.procedure_description !== procedures[row.procedure_code]) throw collectionError('Aggregate group outside the requested scope.');
      const lengthOfStay = source.stayLabelMapping[row.length_of_stay] ?? row.length_of_stay;
      bins[row.procedure_code].push({lengthOfStay, discharges: count(row.discharges)});
    }
    const totalHashes = {};
    for (const procedureCode of Object.keys(procedures)) {
      const total = await read(queries.totals[procedureCode], 'json');
      if (!Array.isArray(total.value) || total.value.length !== 1) throw collectionError('Missing independent discharge total.');
      checkRow(total.value[0], ['discharges']);
      const cohort = {schemaVersion: 1, procedureCode, year, expectedDischarges: count(total.value[0].discharges),
        source: {kind: 'sparcs-public-aggregate', datasetId: source.datasetId, retrievedAt,
          codingVersion: source.codingVersion, query: 'Histogram: ' + queries.histogram + '\nIndependent count: ' + queries.totals[procedureCode]},
        histogram: bins[procedureCode]};
      summarizeCohort(cohort); snapshot.cohorts.push(cohort); totalHashes[procedureCode] = total.sha256;
    }
    const after = await read(source.metadataUrl, 'json'); checkMetadata(after.value, source);
    if (after.value.rowsUpdatedAt !== metadata.value.rowsUpdatedAt) throw collectionError('The dataset changed during collection. Retry with a fresh snapshot.');
    snapshot.sources.push({...source, rowsUpdatedAt: metadata.value.rowsUpdatedAt, queries,
      responseHashes: {metadataBefore: metadata.sha256, metadataAfter: after.sha256,
        histogram: reply.sha256, totals: totalHashes}});
  }
  return snapshot;
}
