import {isDeepStrictEqual} from 'node:util';
import {sourceFor, queryUrls, terms, procedures} from './sources.mjs';
import {summarizeCohort} from './summarize.mjs';

function invalid(message) {
  throw Object.assign(new Error(message), {code: 'INVALID_SNAPSHOT'});
}

export function validateSnapshot(snapshot) {
  const keys = ['schemaVersion', 'retrievedAt', 'terms', 'sources', 'cohorts'];
  if (!snapshot || Object.keys(snapshot).length !== keys.length ||
      !keys.every(key => Object.hasOwn(snapshot, key)) || snapshot.schemaVersion !== 1 ||
      !Array.isArray(snapshot.cohorts) || snapshot.cohorts.length !== 6) invalid('A complete two-year snapshot is required.');
  const summaries = snapshot.cohorts.map(summarizeCohort);
  const time = typeof snapshot.retrievedAt === 'string' ? Date.parse(snapshot.retrievedAt) : NaN;
  if (!Number.isFinite(time) || new Date(time).toISOString() !== snapshot.retrievedAt ||
      !isDeepStrictEqual(snapshot.terms, terms) || !Array.isArray(snapshot.sources) ||
      snapshot.sources.length !== 2) invalid('Snapshot source evidence or retrieval time is missing.');
  for (const [index, year] of [2023, 2024].entries()) {
    const item = snapshot.sources[index];
    if (!item || typeof item !== 'object') invalid('Missing source record.');
    const {rowsUpdatedAt, queries, responseHashes, ...registry} = item;
    if (!isDeepStrictEqual(registry, sourceFor(year)) || !isDeepStrictEqual(queries, queryUrls(year)) ||
        !Number.isSafeInteger(rowsUpdatedAt) || rowsUpdatedAt <= 0 ||
        !responseHashes || !isDeepStrictEqual(Object.keys(responseHashes).sort(), ['histogram', 'metadataAfter', 'metadataBefore', 'totals']) ||
        !isDeepStrictEqual(Object.keys(responseHashes.totals ?? {}).sort(), Object.keys(procedures).sort()) ||
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
