import {shape, text, eachField, own} from './validate-schema.mjs';
import {parseTime, timestamp} from './validate-time.mjs';
import {validateBeds} from './validate-beds.mjs';
import {validateCleaner} from './validate-cleaner.mjs';
import {validateQueue} from './validate-queue.mjs';

function assumptions(value, context) {
  if (!shape(value, 'assumptions', ['travelMinutes', 'releaseDelayMinutes', 'source'], context)) return;
  for (const key of ['travelMinutes', 'releaseDelayMinutes']) {
    if (!own(value, key)) continue;
    const item = value[key];
    if (typeof item !== 'number' || !Number.isFinite(item)) context.issue('assumptions.' + key, 'invalid_schema');
    else if (item !== 0) context.issue('assumptions.' + key, 'unsupported_assumption');
  }
  if (own(value, 'source')) text(value.source, 'assumptions.source', context);
}

export function validateRequest(input) {
  const issues = new Map();
  const context = {issue: (path, reason) => issues.set(path + ':' + reason, {path, reason})};
  if (shape(input, '', ['schemaVersion', 'snapshot', 'timezone', 'ward', 'maxUpdateAgeMinutes',
    'cleaner', 'beds', 'queueOverride', 'assumptions'], context)) {
    context.ward = input.ward;
    context.snapshot = parseTime(input.snapshot);
    eachField(input, '', {
      schemaVersion: value => {if (value !== 1) context.issue('schemaVersion', 'invalid_schema');},
      snapshot: value => timestamp(value, 'snapshot', context),
      timezone: value => {if (value !== 'America/New_York') context.issue('timezone', 'invalid_schema');},
      ward: value => text(value, 'ward', context),
      maxUpdateAgeMinutes: value => {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) context.issue('maxUpdateAgeMinutes', 'invalid_schema');
      },
      cleaner: value => validateCleaner(value, context),
      beds: value => validateBeds(value, context),
      queueOverride: value => validateQueue(value, input.beds, context),
      assumptions: value => assumptions(value, context),
    });
  }
  if (issues.size) {
    const error = new Error('The forecast request has invalid input.');
    error.code = 'INVALID_INPUT';
    error.issues = [...issues.values()].sort((a, b) =>
      a.path < b.path ? -1 : a.path > b.path ? 1 : a.reason < b.reason ? -1 : a.reason > b.reason ? 1 : 0);
    throw error;
  }
}
