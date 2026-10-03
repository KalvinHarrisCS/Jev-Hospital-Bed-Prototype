import {readFileSync} from 'node:fs';

export const cases = JSON.parse(readFileSync(new URL('../fixtures/cases.json', import.meta.url), 'utf8'));
export const inputFor = (id = 'after-break') => structuredClone(cases.find(item => item.id === id).input);

export function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
}
