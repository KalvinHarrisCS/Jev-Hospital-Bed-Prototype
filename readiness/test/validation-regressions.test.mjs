import assert from 'node:assert/strict';
import test from 'node:test';
import {validateRequest} from '../validate.mjs';
import {inputFor} from './helpers.mjs';

for (const [name, path, reason, mutate] of [
  ['sparse bed list', 'beds[0]', 'invalid_schema', input => {input.beds = Array(1);}],
  ['sparse duration pair', 'beds[0].cleaning.minutes', 'invalid_duration', input => {
    input.beds[0].cleaning.minutes = Array(2);
  }],
  ['sparse holds', 'beds[0].holds', 'invalid_schema', input => {input.beds[0].holds = Array(1);}],
  ['sparse breaks', 'cleaner.breaks[0]', 'invalid_window', input => {input.cleaner.breaks = Array(1);}],
]) {
  test('Reject a ' + name + ' without changing the request', () => {
    const input = inputFor(); mutate(input);
    const before = structuredClone(input);
    assert.throws(() => validateRequest(input), error => {
      assert.equal(error.code, 'INVALID_INPUT');
      assert.ok(error.issues.some(issue => issue.path === path && issue.reason === reason));
      return true;
    });
    assert.deepEqual(input, before);
  });
}
