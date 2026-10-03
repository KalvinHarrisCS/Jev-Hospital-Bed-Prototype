import {shape, text, choice, eachField, own, nonempty} from './validate-schema.mjs';
import {window, update, duration} from './validate-time.mjs';

function departure(value, path, context) {
  if (value === null) return;
  if (!shape(value, path, ['kind', 'window', 'updatedAt', 'source'], context)) return;
  eachField(value, path, {
    kind: (item, field) => choice(item, ['estimated', 'observed'], field, context),
    updatedAt: (item, field) => update(item, field, context),
    source: (item, field) => text(item, field, context, true),
  });
  if (!own(value, 'window')) return;
  const bounds = window(value.window, path + '.window', context);
  if (bounds && value.kind === 'observed') {
    if (bounds[0] !== bounds[1]) context.issue(path + '.window', 'invalid_window');
    if (context.snapshot && bounds[1] > context.snapshot.milliseconds) {
      context.issue(path + '.window', 'future_observed_departure');
    }
  }
}

function cleaning(value, path, context) {
  if (!shape(value, path, ['minutes', 'source'], context)) return;
  eachField(value, path, {
    minutes: (item, field) => duration(item, field, context),
    source: (item, field) => text(item, field, context, true),
  });
}

function holds(value, path, context) {
  if (!Array.isArray(value) || Array.from(value).some(item => !nonempty(item)) ||
      new Set(value).size !== value.length) context.issue(path, 'invalid_schema');
}

export function validateBeds(value, context) {
  if (!Array.isArray(value)) {context.issue('beds', 'invalid_schema'); return;}
  const seen = new Set();
  Array.from(value).forEach((bed, index) => {
    const path = `beds[${index}]`;
    if (!shape(bed, path, ['bedId', 'ward', 'actualStatus', 'departure', 'cleaning', 'holds', 'noteStatus'], context)) return;
    eachField(bed, path, {
      bedId: (item, field) => {
        text(item, field, context);
        if (nonempty(item) && seen.has(item)) context.issue(field, 'duplicate_bed');
        if (nonempty(item)) seen.add(item);
      },
      ward: (item, field) => {
        text(item, field, context);
        if (item !== context.ward) context.issue(field, 'invalid_schema');
      },
      actualStatus: (item, field) => choice(item, ['occupied', 'awaiting_cleaning'], field, context),
      departure: (item, field) => departure(item, field, context),
      cleaning: (item, field) => cleaning(item, field, context),
      holds: (item, field) => holds(item, field, context),
      noteStatus: (item, field) => choice(item,
        ['not_checked', 'improving', 'needs_review', 'unclear', 'unavailable'], field, context),
    });
  });
}
