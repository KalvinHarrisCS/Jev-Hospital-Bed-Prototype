import assert from 'node:assert/strict';
import test from 'node:test';
import {fixtures, inputFor} from './fixtures.mjs';

test('Fixtures are labeled fictional and cover all three procedures in both years', () => {
  assert.match(fixtures.notice, /Fictional/);
  const expected = ['2023:FRS001', '2023:PGN002', '2023:PGN003',
    '2024:FRS001', '2024:PGN002', '2024:PGN003'];
  assert.deepEqual(fixtures.cohorts.map(c => c.year + ':' + c.procedureCode).sort(), expected);
});

for (const cohort of fixtures.cohorts) {
  test(cohort.name + ': fixture counts match the hand-written expected total', () => {
    const input = inputFor(cohort);
    assert.equal(input.source.kind, 'synthetic');
    assert.equal(input.source.datasetId, 'fixture-' + cohort.year);
    assert.equal(cohort.histogram.reduce((sum, row) => sum + row.discharges, 0),
      cohort.expected.discharges);
    assert.ok(cohort.expected.p25PatientDays <= cohort.expected.medianPatientDays);
    assert.ok(cohort.expected.medianPatientDays <= cohort.expected.p75PatientDays);
  });
}
