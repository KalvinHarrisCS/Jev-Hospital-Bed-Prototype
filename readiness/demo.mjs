import {readFileSync} from 'node:fs';
import {forecastBeds} from './forecast.mjs';
import {formatDemo} from './demo-format.mjs';

function readInput(arguments_) {
  if (arguments_[0] === '--input') {
    if (arguments_.length !== 2) throw new Error('Usage: readiness:demo -- --input file.json [--json]');
    return JSON.parse(readFileSync(arguments_[1], 'utf8'));
  }
  if (arguments_.length > 1) throw new Error('Choose one case ID from readiness/fixtures/cases.json.');
  const name = arguments_[0] ?? 'after-break';
  const cases = JSON.parse(readFileSync(new URL('./fixtures/cases.json', import.meta.url), 'utf8'));
  const example = cases.find(item => item.id === name);
  if (!example) throw new Error('Choose one case ID from readiness/fixtures/cases.json.');
  return example.input;
}

try {
  const arguments_ = process.argv.slice(2);
  const asJson = arguments_.at(-1) === '--json';
  if (asJson) arguments_.pop();
  const result = forecastBeds(readInput(arguments_));
  console.log(asJson ? JSON.stringify(result, null, 2) : formatDemo(result));
} catch (error) {
  console.error(error.message);
  if (error.issues) console.error(JSON.stringify(error.issues, null, 2));
  process.exitCode = 1;
}
