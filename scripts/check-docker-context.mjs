import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const context = mkdtempSync(join(tmpdir(), 'jev-docker-context-'));
const image = 'jev-docker-context-check:' + randomUUID();
const maxBuffer = 20 * 1024 * 1024;
const environmentFolders = [
  '', 'worker', 'pipeline', 'pipeline/test/nested',
  'pipeline/examples/public-2023-2024', 'readiness', 'readiness/test/nested',
];
const environmentNames = [
  '.env', '.env.local', '.env.synthetic', '.dev.vars', '.dev.vars.local', '.dev.vars.synthetic',
];
const excluded = [
  ...environmentFolders.flatMap(folder => environmentNames.map(name => folder ? folder + '/' + name : name)),
  'node_modules/synthetic.mjs', 'worker/node_modules/synthetic.mjs', 'pipeline/test/node_modules/synthetic.mjs',
  'readiness/test/nested/node_modules/synthetic.mjs',
  'pipeline/output/synthetic-run/cohorts.json',
  'pipeline/output/synthetic-run/manifest.json',
  'pipeline/output/synthetic-run/nested/synthetic.mjs',
];
const included = [
  'worker/index.js', 'worker/cleaning.js', 'readiness/duration.mjs',
  'readiness/demo-format.mjs', 'readiness/examples/two-rooms.json',
  'pipeline/test/context-positive.synthetic.mjs',
];
let container;
let built = false;

try {
  // Archive tracked files only; never read or copy ignored local secrets or generated output.
  const tracked = execFileSync('git', ['archive', '--format=tar', 'HEAD'], {cwd: root, maxBuffer});
  execFileSync('tar', ['-xf', '-', '-C', context], {input: tracked});
  const ignore = 'container/Dockerfile.dockerignore';
  writeFileSync(join(context, ignore), readFileSync(join(root, ignore)));
  writeFileSync(join(context, 'container/Dockerfile'), 'FROM scratch\nCOPY . /context\n');
  for (const path of [...excluded, included.at(-1)]) {
    mkdirSync(dirname(join(context, path)), {recursive: true});
    writeFileSync(join(context, path), 'SYNTHETIC CONTEXT CHECK ONLY\n');
  }

  // The Dockerfile path selects the real Dockerfile-specific ignore rules.
  execFileSync('docker', ['build', '--network=none', '--quiet', '--tag', image,
    '--file', 'container/Dockerfile', '.'], {cwd: context, maxBuffer});
  built = true;
  container = execFileSync('docker', ['create', '--network=none', image,
    '/synthetic-context-check-not-executed'], {encoding: 'utf8'}).trim();
  const archive = execFileSync('docker', ['export', container], {maxBuffer});
  const names = execFileSync('tar', ['-tf', '-'], {input: archive, encoding: 'utf8'});
  const files = new Set(names.split('\n').map(name => name.replace(/^\.\//, '').replace(/^context\//, '')));

  for (const path of included) assert.ok(files.has(path), 'Required file missing from Docker context: ' + path);
  const leaked = excluded.filter(path => files.has(path));
  assert.deepEqual(leaked, [], 'Synthetic files leaked into Docker context: ' + leaked.join(', '));
  console.log('Passed: actual Docker context excludes all ' + excluded.length +
    ' synthetic environment/dependency/output paths and retains ' + included.length + ' required files.');
} finally {
  try {
    if (container) execFileSync('docker', ['rm', container], {stdio: 'ignore'});
  } finally {
    try {
      if (built) execFileSync('docker', ['image', 'rm', image], {stdio: 'ignore'});
    } finally {
      rmSync(context, {recursive: true, force: true});
    }
  }
}
