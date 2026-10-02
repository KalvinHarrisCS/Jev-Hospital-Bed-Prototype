import {procedures, fields, sourceFor, queryUrls, terms} from '../sources.mjs';

export const timestamp = '2026-10-02T12:00:00.000Z';
export function metadata(year) {
  const source = sourceFor(year);
  return {id: source.datasetId, name: source.name, rowsUpdatedAt: 123,
    description: 'Fictional metadata: de-identified file does not contain protected health information (PHI) under HIPAA.',
    license: {name: 'See Terms of Use'},
    metadata: {attachments: source.documents.map(document => ({assetId: document.assetId}))},
    columns: fields.map(fieldName => ({fieldName, dataTypeName: 'text'}))};
}
export function rows(year) {
  return Object.entries(procedures).map(([procedure_code, procedure_description]) => ({
    procedure_code, procedure_description, year: String(year), length_of_stay: '2', discharges: '10'}));
}
export function fakeRequest(change = (url, reply) => reply) {
  const calls = [];
  const request = async (url, format) => {
    calls.push({url, format});
    if (url === terms.url) return change(url, {sha256: terms.sha256}, calls);
    for (const year of [2023, 2024]) {
      const source = sourceFor(year); const queries = queryUrls(year);
      let reply;
      if (url === source.metadataUrl) reply = {value: metadata(year), sha256: 'a'.repeat(64)};
      else if (url === queries.histogram) reply = {value: rows(year), sha256: 'b'.repeat(64)};
      else if (Object.values(queries.totals).includes(url)) reply = {value: [{discharges: '10'}], sha256: 'c'.repeat(64)};
      else {
        const document = source.documents.find(item => item.url === url);
        if (document) reply = {sha256: document.sha256};
      }
      if (reply) return change(url, structuredClone(reply), calls);
    }
    throw new Error('Unexpected request: ' + url);
  };
  return {request, calls};
}
