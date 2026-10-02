import {mkdir, mkdtemp, writeFile, rename, rm, stat, open, unlink} from 'node:fs/promises';
import {dirname, basename, join, resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {validateSnapshot} from './snapshot.mjs';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
async function absent(path) {
  try {await stat(path);} catch (error) {if (error.code === 'ENOENT') return; throw error;}
  throw Object.assign(new Error('Output folder already exists. Choose a new folder.'), {code: 'EEXIST'});
}

export async function saveSnapshot(snapshot, output) {
  const summaries = validateSnapshot(snapshot);
  const columns = ['procedureCode', 'procedureDescription', 'year', 'unit', 'discharges',
    'p25PatientDays', 'medianPatientDays', 'p75PatientDays', 'censoredDischarges', 'smallSample', 'status'];
  const csv = [columns.join(','), ...summaries.map(row => columns.map(column =>
    '"' + String(row[column] ?? '').replaceAll('"', '""') + '"').join(','))].join('\n') + '\n';
  const files = {'cohorts.json': json(snapshot.cohorts), 'summaries.json': json(summaries), 'summaries.csv': csv};
  const manifest = {schemaVersion: 1, retrievedAt: snapshot.retrievedAt, terms: snapshot.terms,
    sources: snapshot.sources, files: Object.fromEntries(Object.entries(files).map(([name, bytes]) => [name, sha256(bytes)]))};
  const target = resolve(output); await mkdir(dirname(target), {recursive: true});
  const lock = await open(target + '.lock', 'wx'); let staging;
  try {
    await absent(target);
    staging = await mkdtemp(join(dirname(target), basename(target) + '.tmp-'));
    for (const [name, bytes] of Object.entries({...files, 'manifest.json': json(manifest)})) {
      await writeFile(join(staging, name), bytes);
    }
    await absent(target); await rename(staging, target); staging = undefined;
    return summaries;
  } finally {
    if (staging) await rm(staging, {recursive: true, force: true});
    await lock.close(); await unlink(target + '.lock');
  }
}
