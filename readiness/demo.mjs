import {readFileSync} from 'node:fs';
import {forecastBeds} from './forecast.mjs';
import {formatDemo} from './demo-format.mjs';

function parseArguments(arguments_) {
  const options = {asJson: false, inputFile: null, caseId: null};
  const usage = 'Usage: readiness:demo -- [case-id | --input file.json] [--json]';
  for (let index = 0; index < arguments_.length; index++) {
    const argument = arguments_[index];
    if (argument === '--json') {
      if (options.asJson) throw new Error(usage);
      options.asJson = true;
    } else if (argument === '--input') {
      const file = arguments_[++index];
      if (options.inputFile !== null || options.caseId !== null || !file || file.startsWith('--')) throw new Error(usage);
      options.inputFile = file;
    } else {
      if (argument.startsWith('--') || options.caseId !== null || options.inputFile !== null) throw new Error(usage);
      options.caseId = argument;
    }
  }
  return options;
}

function readInput({inputFile, caseId}) {
  if (inputFile) return JSON.parse(readFileSync(inputFile, 'utf8'));
  const name = caseId ?? 'after-break';
  const cases = JSON.parse(readFileSync(new URL('./fixtures/cases.json', import.meta.url), 'utf8'));
  const example = cases.find(item => item.id === name);
  if (!example) throw new Error('Choose one case ID from readiness/fixtures/cases.json.');
  return example.input;
}

try {
  const options = parseArguments(process.argv.slice(2));
  const result = forecastBeds(readInput(options));
  console.log(options.asJson ? JSON.stringify(result, null, 2) : formatDemo(result));
} catch (error) {
  console.error(error.message);
  if (error.issues) console.error(JSON.stringify(error.issues, null, 2));
  process.exitCode = 1;
}
