import assert from 'node:assert/strict';
import test from 'node:test';
import {collectPublic} from '../collect.mjs';
import {procedures, sourceFor, queryUrls, terms} from '../sources.mjs';
import {fakeRequest, timestamp} from './collector-fixtures.mjs';

const collect = request => collectPublic({request, now: () => timestamp});
const rejects = request => assert.rejects(() => collect(request), error =>
  ['COLLECTION_ERROR', 'INVALID_INPUT', 'DUPLICATE_BIN', 'COUNT_MISMATCH'].includes(error.code));

test('Changed terms fail before aggregate requests', async () => {
  const {request, calls} = fakeRequest((url, reply) => {
    if (url === terms.url) reply.sha256 = 'changed'; return reply;
  });
  await rejects(request); assert.equal(calls.some(call => call.url.includes('/resource/')), false);
});
test('Reject a required column with the wrong data type', async () => {
  const {request, calls} = fakeRequest((url, reply) => {
    if (url === sourceFor(2023).metadataUrl) {
      reply.value.columns.find(column => column.fieldName === 'length_of_stay').dataTypeName = 'number';
    }
    return reply;
  });
  await rejects(request); assert.equal(calls.some(call => call.url.includes('/resource/')), false);
});
for (const [name, change] of [
  ['missing attachment metadata', value => {delete value.metadata;}],
  ['missing attachments', value => {delete value.metadata.attachments;}],
  ['empty attachments', value => {value.metadata.attachments = [];}],
  ['changed attachment', value => {value.metadata.attachments[0].assetId = 'unreviewed';}]
]) {
  test('Reject ' + name + ' before aggregate requests', async () => {
    const {request, calls} = fakeRequest((url, reply) => {
      if (url === sourceFor(2023).metadataUrl) change(reply.value); return reply;
    });
    await rejects(request); assert.equal(calls.some(call => call.url.includes('/resource/')), false);
  });
}
for (const [name, value] of [
  ['leading zero', [{discharges: '010'}]], ['decimal', [{discharges: '10.0'}]],
  ['exponent', [{discharges: '1e1'}]], ['negative', [{discharges: '-1'}]],
  ['unsafe count', [{discharges: '9007199254740992'}]],
  ['extra field', [{discharges: '10', year: '2023'}]],
  ['private field', [{discharges: '10', patientName: 'FICTIONAL UNEXPECTED FIELD'}]],
  ['multiple rows', [{discharges: '5'}, {discharges: '5'}]], ['nonarray', {discharges: '10'}]
]) {
  test('Reject malformed independent total: ' + name, async () => {
    const {request} = fakeRequest((url, reply) => {
      if (url === queryUrls(2023).totals.PGN003) reply.value = value; return reply;
    });
    await rejects(request);
  });
}
for (const value of [null, {}, 'not grouped rows']) {
  test('Reject nonarray histogram: ' + String(value), async () => {
    const {request} = fakeRequest((url, reply) => {
      if (url === queryUrls(2023).histogram) reply.value = value; return reply;
    });
    await rejects(request);
  });
}
test('All 360 valid bins are complete, not a truncated result', async () => {
  const {request} = fakeRequest((url, reply) => {
    if (url === queryUrls(2023).histogram) reply.value = Object.entries(procedures).flatMap(
      ([procedure_code, procedure_description]) => [...Array.from({length: 119}, (_, index) => String(index + 1)), '120+']
        .map(length_of_stay => ({procedure_code, procedure_description, year: '2023', length_of_stay, discharges: '1'})));
    if (Object.values(queryUrls(2023).totals).includes(url)) reply.value = [{discharges: '120'}]; return reply;
  });
  const result = await collect(request);
  for (const cohort of result.cohorts.filter(input => input.year === 2023)) {
    assert.equal(cohort.expectedDischarges, 120); assert.equal(cohort.histogram.length, 120);
    assert.deepEqual(cohort.histogram.find(row => row.lengthOfStay === '120+'), {lengthOfStay: '120+', discharges: 1});
  }
});
test('Explicit zero totals allow an entirely empty year', async () => {
  const {request} = fakeRequest((url, reply) => {
    if (url === queryUrls(2023).histogram) reply.value = [];
    if (Object.values(queryUrls(2023).totals).includes(url)) reply.value = [{discharges: '0'}]; return reply;
  });
  const result = await collect(request);
  assert.equal(result.cohorts.filter(input => input.year === 2023).length, 3);
  assert.ok(result.cohorts.filter(input => input.year === 2023).every(input => input.expectedDischarges === 0 && input.histogram.length === 0));
});
test('Failure in the second year rejects the entire collection', async () => {
  const {request} = fakeRequest((url, reply) => {
    if (url === queryUrls(2024).histogram) throw new Error('Simulated second-year failure'); return reply;
  });
  await rejects(request);
});
