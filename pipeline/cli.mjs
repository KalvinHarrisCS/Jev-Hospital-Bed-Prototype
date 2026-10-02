import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {collectPublic} from './collect.mjs';
import {saveSnapshot, sha256} from './save.mjs';

try {
  const args = process.argv.slice(2); const options = {};
  while (args.length) {
    const flag = args.shift(); const value = args.shift();
    if (!['--out', '--from'].includes(flag) || !value || value.startsWith('--') || options[flag]) {
      throw new Error('Use: npm run pipeline:collect -- [--out new-folder] [--from saved-folder]');
    }
    options[flag] = value;
  }
  let snapshot;
  if (options['--from']) {
    const folder = options['--from'];
    const manifest = JSON.parse(await readFile(join(folder, 'manifest.json'), 'utf8'));
    for (const name of ['cohorts.json', 'summaries.json', 'summaries.csv']) {
      if (sha256(await readFile(join(folder, name))) !== manifest.files?.[name]) {
        throw new Error('Saved file hash does not match: ' + name);
      }
    }
    snapshot = {schemaVersion: manifest.schemaVersion, retrievedAt: manifest.retrievedAt,
      sources: manifest.sources, terms: manifest.terms,
      cohorts: JSON.parse(await readFile(join(folder, 'cohorts.json'), 'utf8'))};
  } else {
    console.log('Checking public source documents, then requesting aggregate counts...');
    snapshot = await collectPublic();
  }
  const output = options['--out'] ?? 'pipeline/output/run-' + new Date().toISOString().replaceAll(':', '-');
  const summaries = await saveSnapshot(snapshot, output);
  console.log('Saved six stay summaries to ' + output);
  for (const row of summaries) console.log(row.year + ' ' + row.procedureDescription + ': ' +
    row.discharges + ' discharges; median ' + row.medianPatientDays + ' patient days.');
} catch (error) {
  console.error(error.message); process.exitCode = 1;
}
