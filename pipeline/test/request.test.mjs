import assert from 'node:assert/strict';
import test from 'node:test';
import {createHash} from 'node:crypto';
import {readPublic} from '../request.mjs';
import {sourceFor, terms} from '../sources.mjs';

test('Public requests stay bounded and reject redirects or invalid responses', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(options.redirect, 'manual'); assert.ok(options.signal instanceof AbortSignal);
      assert.equal(options.headers.Authorization, undefined);
      return new Response('[{"discharges":"10"}]', {headers: {'content-type': 'application/json'}});
    };
    const result = await readPublic(sourceFor(2023).metadataUrl);
    assert.deepEqual(result.value, [{discharges: '10'}]);
    assert.equal(result.sha256, createHash('sha256').update('[{"discharges":"10"}]').digest('hex'));
    for (const response of [new Response('denied', {status: 403}),
      new Response('slow down', {status: 429}), new Response('<html>wrong</html>'),
      new Response('bad json', {headers: {'content-type': 'application/json'}}),
      new Response(null, {status: 302, headers: {location: 'https://example.com/'}}),
      new Response('x'.repeat(2 * 1024 * 1024 + 1), {headers: {'content-type': 'application/json'}})]) {
      globalThis.fetch = async () => response;
      await assert.rejects(() => readPublic(sourceFor(2023).metadataUrl), {code: 'COLLECTION_ERROR'});
    }
    globalThis.fetch = async () => {throw new Error('network failed');};
    await assert.rejects(() => readPublic(sourceFor(2023).metadataUrl), {code: 'COLLECTION_ERROR'});
    await assert.rejects(() => readPublic('https://example.com/data.json'), {code: 'COLLECTION_ERROR'});
  } finally {globalThis.fetch = original;}
});
test('Follow only the reviewed Open NY terms redirect and check PDF content', async () => {
  const original = globalThis.fetch; const calls = [];
  try {
    globalThis.fetch = async url => {
      calls.push(url);
      return url === terms.url ? new Response(null, {status: 302, headers: {location: terms.fileUrl}}) :
        new Response('%PDF-fictional document', {headers: {'content-type': 'application/pdf'}});
    };
    await readPublic(terms.url, 'pdf'); assert.deepEqual(calls, [terms.url, terms.fileUrl]);
    globalThis.fetch = async () => new Response('not a PDF');
    await assert.rejects(() => readPublic(terms.url, 'pdf'), {code: 'COLLECTION_ERROR'});
  } finally {globalThis.fetch = original;}
});
