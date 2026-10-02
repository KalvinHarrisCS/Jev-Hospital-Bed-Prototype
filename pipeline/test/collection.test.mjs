import assert from 'node:assert/strict';
import test from 'node:test';
import {collectPublic} from '../collect.mjs';
import {procedures, sourceFor, queryUrls} from '../sources.mjs';
import {fakeRequest, timestamp} from './collector-fixtures.mjs';

const collect = request => collectPublic({request, now: () => timestamp});
const rejectsCollection = request => assert.rejects(() => collect(request), error =>
  ['COLLECTION_ERROR', 'INVALID_INPUT', 'DUPLICATE_BIN', 'COUNT_MISMATCH'].includes(error.code));
test('Collect six reconciled cohorts with only approved aggregate queries', async () => {
  const {request, calls} = fakeRequest(); const result = await collect(request);
  assert.equal(result.cohorts.length, 6); assert.equal(result.sources.length, 2);
  for (const input of result.cohorts) {
    assert.equal(input.expectedDischarges, 10);
    assert.deepEqual(input.histogram, [{lengthOfStay: '2', discharges: 10}]);
    assert.equal(input.source.kind, 'sparcs-public-aggregate');
    assert.equal(input.source.retrievedAt, timestamp);
    assert.ok(input.source.query.includes(queryUrls(input.year).histogram));
    assert.ok(input.source.query.includes(queryUrls(input.year).totals[input.procedureCode]));
  }
  assert.equal(calls.length, 17);
  assert.ok(calls.every(call => ['https://health.data.ny.gov', 'https://data.ny.gov'].includes(new URL(call.url).origin)));
  for (const year of [2023, 2024]) {
    const query = new URL(queryUrls(year).histogram);
    assert.equal(query.searchParams.get('$limit'), '361');
    assert.ok(query.searchParams.get('$group').includes('length_of_stay'));
    assert.ok(query.searchParams.get('$select').includes('count(*)'));
    assert.equal(query.searchParams.get('$select').includes('select *'), false);
  }
});

for (const field of ['id', 'name', 'rowsUpdatedAt', 'description', 'columns', 'license']) {
  test('Reject invalid metadata before requesting aggregates: ' + field, async () => {
    const {request, calls} = fakeRequest((url, reply) => {
      if (url === sourceFor(2023).metadataUrl) delete reply.value[field]; return reply;
    });
    await rejectsCollection(request);
    assert.equal(calls.some(call => call.url.includes('/resource/')), false);
  });
}
test('Reject changed coding evidence before requesting aggregates', async () => {
  const {request, calls} = fakeRequest((url, reply) => {
    if (url === sourceFor(2023).documents[0].url) reply.sha256 = 'changed'; return reply;
  });
  await rejectsCollection(request);
  assert.equal(calls.some(call => call.url.includes('/resource/')), false);
});
for (const change of [row => {row.procedure_code = 'UNKNOWN';}, row => {row.year = '2022';},
  row => {row.procedure_description = 'wrong';}, row => {row.patientName = 'unexpected';},
  row => {delete row.length_of_stay;}, row => {row.discharges = '010';},
  row => {row.discharges = 10;}, row => {row.length_of_stay = '2\n';}]) {
  test('Reject malformed or out-of-scope aggregate rows: ' + change.toString(), async () => {
    const {request} = fakeRequest((url, reply) => {
      if (url === queryUrls(2023).histogram) change(reply.value[0]); return reply;
    });
    await rejectsCollection(request);
  });
}
for (const kind of ['duplicate', 'overflow', 'mismatch', 'missing-total']) {
  test('Reject ' + kind + ' aggregate results', async () => {
    const {request} = fakeRequest((url, reply) => {
      if (url === queryUrls(2023).histogram && kind === 'duplicate') reply.value.push(reply.value[0]);
      if (url === queryUrls(2023).histogram && kind === 'overflow') reply.value = Array(361).fill(reply.value[0]);
      if (url === queryUrls(2023).totals.PGN003 && kind === 'mismatch') reply.value[0].discharges = '11';
      if (url === queryUrls(2023).totals.PGN003 && kind === 'missing-total') reply.value = [];
      return reply;
    });
    await rejectsCollection(request);
  });
}
test('Only an explicit independent zero count creates an empty cohort', async () => {
  const {request} = fakeRequest((url, reply) => {
    if (url === queryUrls(2023).histogram) reply.value = reply.value.filter(row => row.procedure_code !== 'PGN003');
    if (url === queryUrls(2023).totals.PGN003) reply.value = [{discharges: '0'}]; return reply;
  });
  const result = await collect(request);
  assert.equal(result.cohorts[0].expectedDischarges, 0); assert.deepEqual(result.cohorts[0].histogram, []);
});
test('Reject a source revision that changed between the count queries', async () => {
  const {request} = fakeRequest((url, reply, calls) => {
    if (url === sourceFor(2023).metadataUrl && calls.filter(call => call.url === url).length > 1) reply.value.rowsUpdatedAt++;
    return reply;
  });
  await rejectsCollection(request);
});
test('Map the public API censored label without turning it into exact days', async () => {
  const {request} = fakeRequest((url, reply) => {
    if (url === queryUrls(2023).histogram) reply.value[0].length_of_stay = '120 +'; return reply;
  });
  const result = await collect(request);
  assert.deepEqual(result.cohorts[0].histogram, [{lengthOfStay: '120+', discharges: 10}]);
});
