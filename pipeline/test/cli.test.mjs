import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp, readFile, writeFile, rm, readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {collectPublic} from '../collect.mjs';
import {saveSnapshot} from '../save.mjs';
import {fakeRequest, timestamp} from './collector-fixtures.mjs';

test('Replay runs through the command line offline and rejects changed saved data', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'jev-cli-'));
  try {
    const input = join(folder, 'input'); const output = join(folder, 'output');
    await saveSnapshot(await collectPublic({...fakeRequest(), now: () => timestamp}), input);
    const cli = fileURLToPath(new URL('../cli.mjs', import.meta.url));
    const noNetwork = 'data:text/javascript,' + encodeURIComponent('globalThis.fetch=()=>{throw new Error("Tests must not make live requests")};');
    const run = target => spawnSync(process.execPath, ['--import', noNetwork, cli,
      '--from', input, '--out', target], {env: {}, encoding: 'utf8', timeout: 10000});
    const good = run(output); assert.equal(good.status, 0, good.stderr);
    assert.equal(await readFile(join(input, 'summaries.csv'), 'utf8'), await readFile(join(output, 'summaries.csv'), 'utf8'));
    assert.equal(run(output).status, 1);
    await writeFile(join(input, 'cohorts.json'), '[]');
    const bad = run(join(folder, 'bad-output')); assert.equal(bad.status, 1);
    assert.match(bad.stderr, /hash does not match/);
    assert.deepEqual((await readdir(folder)).sort(), ['input', 'output']);
  } finally {await rm(folder, {recursive: true, force: true});}
});
