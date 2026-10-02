import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp, readFile, readdir, rm, stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {collectPublic} from '../collect.mjs';
import {saveSnapshot} from '../save.mjs';
import {fakeRequest, timestamp} from './collector-fixtures.mjs';

test('Save repeatable aggregate summaries with matching file hashes and no replacement', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'jev-snapshot-'));
  try {
    const snapshot = await collectPublic({...fakeRequest(), now: () => timestamp});
    const output = join(folder, 'result'); await saveSnapshot(snapshot, output);
    assert.deepEqual((await readdir(output)).sort(), ['cohorts.json', 'manifest.json', 'summaries.csv', 'summaries.json']);
    const manifest = JSON.parse(await readFile(join(output, 'manifest.json'), 'utf8'));
    assert.equal(manifest.sources.length, 2); assert.equal(manifest.retrievedAt, timestamp);
    for (const [filename, hash] of Object.entries(manifest.files)) {
      assert.equal(createHash('sha256').update(await readFile(join(output, filename))).digest('hex'), hash);
    }
    const summaries = JSON.parse(await readFile(join(output, 'summaries.json'), 'utf8'));
    assert.equal(summaries.length, 6); assert.ok(summaries.every(item => item.medianPatientDays === 2));
    const csv = await readFile(join(output, 'summaries.csv'), 'utf8');
    assert.equal(csv.trim().split('\n').length, 7); assert.ok(csv.includes('patient_days'));
    await assert.rejects(() => saveSnapshot(snapshot, output), {code: 'EEXIST'});
    assert.equal(await readFile(join(output, 'summaries.csv'), 'utf8'), csv);
  } finally {await rm(folder, {recursive: true, force: true});}
});
test('An invalid later cohort never leaves a partial snapshot', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'jev-snapshot-'));
  try {
    const snapshot = await collectPublic({...fakeRequest(), now: () => timestamp});
    snapshot.cohorts[5].expectedDischarges++;
    await assert.rejects(() => saveSnapshot(snapshot, join(folder, 'result')), {code: 'COUNT_MISMATCH'});
    assert.deepEqual(await readdir(folder), []);
  } finally {await rm(folder, {recursive: true, force: true});}
});
