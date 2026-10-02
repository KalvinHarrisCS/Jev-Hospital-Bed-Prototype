import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp, readdir, rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {collectPublic} from '../collect.mjs';
import {saveSnapshot} from '../save.mjs';
import {sourceFor} from '../sources.mjs';
import {fakeRequest, timestamp} from './collector-fixtures.mjs';

test('Reject a changed description that says the file contains PHI', async () => {
  const {request, calls} = fakeRequest((url, reply) => {
    if (url === sourceFor(2023).metadataUrl) reply.value.description =
      'This de-identified file contains protected health information (PHI) under HIPAA.';
    return reply;
  });
  await assert.rejects(() => collectPublic({request, now: () => timestamp}), {code: 'COLLECTION_ERROR'});
  assert.equal(calls.some(call => call.url.includes('/resource/')), false);
});
for (const change of [snapshot => {delete snapshot.sources;}, snapshot => {delete snapshot.terms;},
  snapshot => {delete snapshot.retrievedAt;}, snapshot => {snapshot.retrievedAt = 'bad date';},
  snapshot => {snapshot.sources[0].codingVersion = 'unknown';},
  snapshot => {snapshot.sources[0].responseHashes.histogram = 'bad hash';},
  snapshot => {snapshot.cohorts[0].source.query = 'wrong query';}]) {
  test('Reject incomplete or inconsistent provenance: ' + change.toString(), async () => {
    const folder = await mkdtemp(join(tmpdir(), 'jev-provenance-'));
    try {
      const snapshot = await collectPublic({...fakeRequest(), now: () => timestamp}); change(snapshot);
      await assert.rejects(() => saveSnapshot(snapshot, join(folder, 'result')), {code: 'INVALID_SNAPSHOT'});
      assert.deepEqual(await readdir(folder), []);
    } finally {await rm(folder, {recursive: true, force: true});}
  });
}
