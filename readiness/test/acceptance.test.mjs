import assert from 'node:assert/strict';
import test, {before, after} from 'node:test';
import {forecastBeds} from '../forecast.mjs';
import {cases, inputFor, freeze} from './helpers.mjs';

const originalFetch = globalThis.fetch;
before(() => {globalThis.fetch = () => {assert.fail('Forecasts must not make network requests');};});
after(() => {globalThis.fetch = originalFetch;});

for (const item of cases) {
  test(item.id + ': matches the complete expected output without changing inputs', () => {
    const input = inputFor(item.id); const original = structuredClone(input);
    assert.deepEqual(forecastBeds(freeze(input)), item.expected);
    assert.deepEqual(input, original);
  });
}

test('Changing a returned window or assumption cannot change the input', () => {
  const input = inputFor(); const original = structuredClone(input);
  const result = forecastBeds(input);
  result.beds[0].startWindow[0] = 'changed'; result.beds[0].assumptions.source = 'changed';
  assert.deepEqual(input, original);
});

test('Each scenario has no overlapping cleaner assignments', () => {
  const result = forecastBeds(inputFor('two-rooms'));
  for (const bound of [0, 1]) {
    const rows = result.queue.map(id => result.beds.find(bed => bed.bedId === id));
    for (let index = 1; index < rows.length; index++) {
      assert.ok(Date.parse(rows[index].startWindow[bound]) >= Date.parse(rows[index - 1].completionWindow[bound]));
    }
  }
  assert.ok(Date.parse(result.beds[1].startWindow[0]) < Date.parse(result.beds[0].completionWindow[1]),
    'Alternative scenarios may overlap each other');
});
