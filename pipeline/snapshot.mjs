import {isDeepStrictEqual} from 'node:util';
import {sourceFor, queryUrls, terms, procedures} from './sources.mjs';
import {summarizeCohort} from './summarize.mjs';

function invalid(message) {
  throw Object.assign(new Error(message), {code: 'INVALID_SNAPSHOT'});
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    [Object.prototype, null].includes(Object.getPrototypeOf(value));
}

export function validateSnapshot(snapshot) {
  const keys = ['schemaVersion', 'retrievedAt', 'terms', 'sources', 'cohorts'];
  if (!isRecord(snapshot) || Object.keys(snapshot).length !== keys.length ||
      !keys.every(key => Object.hasOwn(snapshot, key)) || snapshot.schemaVersion !== 1 ||
      !Array.isArray(snapshot.cohorts) || snapshot.cohorts.length !== 6) invalid('A complete two-year snapshot is required.');
  const summaries = Array.from(snapshot.cohorts, summarizeCohort);
  const time = typeof snapshot.retrievedAt === 'string' ? Date.parse(snapshot.retrievedAt) : NaN;
  if (!Number.isFinite(time) || new Date(time).toISOString() !== snapshot.retrievedAt ||
      !isDeepStrictEqual(snapshot.terms, terms) || !Array.isArray(snapshot.sources) ||
      snapshot.sources.length !== 2) invalid('Snapshot source evidence or retrieval time is missing.');
  for (const [index, year] of [2023, 2024].entries()) {
    const sourceRecord = snapshot.sources[index];
    if (!isRecord(sourceRecord)) invalid('Missing source record.');
    const {rowsUpdatedAt, queries, responseHashes, ...registry} = sourceRecord;
    if (!isRecord(responseHashes) || !isRecord(responseHashes.totals)) {
      invalid('Snapshot sources or response hashes do not match the reviewed releases.');
    }
    if (!isDeepStrictEqual(registry, sourceFor(year)) || !isDeepStrictEqual(queries, queryUrls(year)) ||
        !Number.isSafeInteger(rowsUpdatedAt) || rowsUpdatedAt <= 0 ||
        !isDeepStrictEqual(Object.keys(responseHashes).sort(), ['histogram', 'metadataAfter', 'metadataBefore', 'totals']) ||
        !isDeepStrictEqual(Object.keys(responseHashes.totals).sort(), Object.keys(procedures).sort()) ||
        ![responseHashes.metadataBefore, responseHashes.metadataAfter, responseHashes.histogram,
          ...Object.values(responseHashes.totals)].every(hash => typeof hash === 'string' && /^[a-f0-9]{64}$/.test(hash))) {
      invalid('Snapshot sources or response hashes do not match the reviewed releases.');
    }
  }
  if (new Set(summaries.map(row => row.procedureCode + ':' + row.year)).size !== 6) invalid('Snapshot cohorts must be unique.');
  for (const row of summaries) {
    const query = queryUrls(row.year);
    if (row.source.kind !== 'sparcs-public-aggregate' || row.source.retrievedAt !== snapshot.retrievedAt ||
        row.source.query !== 'Histogram: ' + query.histogram + '\nIndependent count: ' + query.totals[row.procedureCode]) {
      invalid('Cohort provenance does not match the saved query record.');
    }
  }
  return summaries;
}
