import assert from 'node:assert/strict';
import test from 'node:test';
import {collectPublic} from '../collect.mjs';
import {sourceFor} from '../sources.mjs';
import {fakeRequest, timestamp} from './collector-fixtures.mjs';

const malformed = [null, [], {}, 'not a record', 1, false];

for (const value of malformed) {
  for (const [name, change] of [
    ['metadata record', reply => {reply.value = value;}],
    ['column record', reply => {reply.value.columns[0] = value;}],
    ['attachment record', reply => {reply.value.metadata.attachments[0] = value;}],
    ['attachment container', reply => {reply.value.metadata.attachments = value;}],
  ]) {
    test('Reject malformed ' + name + ' before aggregate requests: ' + JSON.stringify(value), async () => {
      let observed, before;
      const {request, calls} = fakeRequest((url, reply) => {
        if (url === sourceFor(2023).metadataUrl) {
          change(reply); observed = reply; before = structuredClone(reply);
        }
        return reply;
      });
      await assert.rejects(() => collectPublic({request, now: () => timestamp}), error => {
        assert.equal(error.code, 'COLLECTION_ERROR');
        assert.equal(error instanceof TypeError, false);
        assert.match(error.message, /metadata changed or is incomplete/);
        return true;
      });
      assert.deepEqual(observed, before);
      assert.equal(calls.some(call => call.url.includes('/resource/')), false);
    });
  }
}
