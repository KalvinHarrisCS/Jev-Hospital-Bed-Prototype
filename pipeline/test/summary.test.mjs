import assert from 'node:assert/strict';
import test, {before, after} from 'node:test';
import {summarizeCohort} from '../summarize.mjs';
import {fixtures, inputFor, bin} from './fixtures.mjs';

const originalFetch = globalThis.fetch;
before(() => {globalThis.fetch = () => {assert.fail('Summarizing must not make network requests');};});
after(() => {globalThis.fetch = originalFetch;});

for (const cohort of fixtures.cohorts) {
  test(cohort.name + ': matches the complete expected output', () => {
    const input = inputFor(cohort);
    const original = structuredClone(input);
    assert.deepEqual(summarizeCohort(input), {schemaVersion: 1,
      procedureCode: cohort.procedureCode, procedureDescription: cohort.procedureDescription,
      year: cohort.year, source: input.source, unit: 'patient_days',
      quantileMethod: 'weighted_nearest_rank', ...cohort.expected,
      censoredDischarges: 0, smallSample: true, status: 'ok', histogram: cohort.histogram});
    assert.deepEqual(input, original);
  });
}

const quantiles = input => {
  const result = summarizeCohort(input);
  return [result.p25PatientDays, result.medianPatientDays, result.p75PatientDays];
};
for (const [year, datasetId] of [[2023, '46xm-urtu'], [2024, 'sf4k-39ay']]) {
  test('Accept public provenance for ' + year + ' using fictional counts', () => {
    const input = inputFor(fixtures.cohorts.find(c => c.year === year));
    input.source = {...input.source, kind: 'sparcs-public-aggregate', datasetId,
      codingVersion: 'CCSR 2025.1'};
    const result = summarizeCohort(input);
    assert.deepEqual(result.source, input.source);
    assert.equal(result.year, year); assert.equal(result.discharges, 10);
  });
}
test('Quantiles use discharge frequencies and return a sorted distribution', () => {
  const input = {...inputFor(), expectedDischarges: 8,
    histogram: [bin('10', 1), bin('1', 1), bin('2', 6)]};
  assert.deepEqual(quantiles(input), [2, 2, 2]);
  assert.deepEqual(summarizeCohort(input).histogram, [bin('1', 1), bin('2', 6), bin('10', 1)]);
});
test('Even-count nearest-rank median is not averaged', () => {
  assert.deepEqual(quantiles({...inputFor(), expectedDischarges: 4,
    histogram: [bin('1', 2), bin('9', 2)]}), [1, 1, 9]);
});
test('Fractional ranks round up', () => {
  assert.deepEqual(quantiles({...inputFor(), expectedDischarges: 5,
    histogram: ['1', '2', '3', '4', '5'].map(day => bin(day, 1))}), [2, 3, 4]);
});
test('Ranks stay exact at the safe-integer count boundary', () => {
  assert.deepEqual(quantiles({...inputFor(), expectedDischarges: Number.MAX_SAFE_INTEGER,
    histogram: [bin('1', 6755399441055743), bin('2', 2251799813685248)]}), [1, 1, 2]);
});
test('120+ remains censored and contributes to the censored count', () => {
  const input = {...inputFor(), expectedDischarges: 4, histogram: [bin('120+', 3), bin('119', 1)]};
  assert.deepEqual(quantiles(input), [119, '120+', '120+']);
  const result = summarizeCohort(input);
  assert.equal(result.censoredDischarges, 3);
  assert.deepEqual(result.histogram, [bin('119', 1), bin('120+', 3)]);
  assert.equal(Object.hasOwn(result, 'meanPatientDays'), false);
});
test('Explicit empty cohort has null quantiles and an empty status', () => {
  const input = {...inputFor(), expectedDischarges: 0, histogram: []};
  const result = summarizeCohort(input);
  assert.deepEqual(quantiles(input), [null, null, null]);
  assert.equal(result.discharges, 0); assert.equal(result.status, 'empty');
  assert.equal(result.smallSample, false); assert.equal(result.censoredDischarges, 0);
});
for (const count of [29, 30]) {
  test('Small-sample boundary at ' + count + ' discharges', () => {
    const result = summarizeCohort({...inputFor(), expectedDischarges: count,
      histogram: [bin('2', count)]});
    assert.equal(result.smallSample, count < 30);
  });
}
test('Changing input order does not change the summary or mutate its input', () => {
  const input = inputFor(); input.histogram.reverse();
  const original = structuredClone(input);
  assert.deepEqual(summarizeCohort(input), summarizeCohort(inputFor()));
  assert.deepEqual(input, original);
});
test('The same procedure retains separate years and source metadata', () => {
  const first = summarizeCohort(inputFor(fixtures.cohorts[0]));
  const second = summarizeCohort(inputFor(fixtures.cohorts[1]));
  assert.equal(first.year, 2023); assert.equal(second.year, 2024);
  assert.equal(first.source.datasetId, 'fixture-2023');
  assert.equal(second.source.datasetId, 'fixture-2024');
  assert.equal(first.p75PatientDays, 3); assert.equal(second.p75PatientDays, 4);
});
