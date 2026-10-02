import {readFileSync} from 'node:fs';

export const fixtures = JSON.parse(readFileSync(new URL('../fixtures/cohorts.json', import.meta.url)));
export function inputFor(cohort = fixtures.cohorts[0]) {
  return structuredClone({schemaVersion: 1, procedureCode: cohort.procedureCode,
    year: cohort.year, expectedDischarges: cohort.expected.discharges,
    source: {...fixtures.sources[cohort.year], query: 'Fictional aggregate: ' + cohort.name},
    histogram: cohort.histogram});
}
export const bin = (lengthOfStay, discharges) => ({lengthOfStay, discharges});
