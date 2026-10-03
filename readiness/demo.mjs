import {readFileSync} from 'node:fs';
import {forecastBeds} from './forecast.mjs';

try {
  const name = process.argv[2] ?? 'after-break';
  const cases = JSON.parse(readFileSync(new URL('./fixtures/cases.json', import.meta.url), 'utf8'));
  const example = cases.find(item => item.id === name);
  if (!example || process.argv.length > 3) throw new Error('Choose one case ID from readiness/fixtures/cases.json.');
  console.log(JSON.stringify(forecastBeds(example.input), null, 2));
} catch (error) {
  console.error(error.message); process.exitCode = 1;
}
