import {shape, text, choice, eachField, own} from './validate-schema.mjs';
import {window, update} from './validate-time.mjs';

export function validateCleaner(value, context) {
  if (value === null) return;
  if (!shape(value, 'cleaner', ['cleanerId', 'role', 'assignedWard', 'shift', 'breaks',
    'currentWork', 'taskFinishWindow', 'updatedAt'], context)) return;
  eachField(value, 'cleaner', {
    cleanerId: (item, path) => text(item, path, context),
    role: (item, path) => text(item, path, context),
    assignedWard: (item, path) => text(item, path, context),
    currentWork: (item, path) => choice(item, ['idle', 'busy', 'unknown'], path, context),
    updatedAt: (item, path) => update(item, path, context),
  });
  const shift = own(value, 'shift') ? window(value.shift, 'cleaner.shift', context) : null;
  if (shift && shift[0] === shift[1]) context.issue('cleaner.shift', 'invalid_schedule');
  if (own(value, 'taskFinishWindow')) {
    window(value.taskFinishWindow, 'cleaner.taskFinishWindow', context);
    if (value.currentWork === 'idle' && value.taskFinishWindow !== null) {
      context.issue('cleaner.taskFinishWindow', 'invalid_schedule');
    }
  }
  if (!own(value, 'breaks') || value.breaks === null) return;
  if (!Array.isArray(value.breaks)) {context.issue('cleaner.breaks', 'invalid_schema'); return;}
  const periods = Array.from(value.breaks).map((pair, index) => {
    if (pair === null) {context.issue(`cleaner.breaks[${index}]`, 'invalid_window'); return null;}
    const bounds = window(pair, `cleaner.breaks[${index}]`, context);
    if (bounds && (bounds[0] === bounds[1] ||
        (shift && (bounds[0] < shift[0] || bounds[1] > shift[1])))) {
      context.issue('cleaner.breaks', 'invalid_schedule');
    }
    return bounds;
  }).filter(Boolean).sort((a, b) => a[0] - b[0]);
  for (let index = 1; index < periods.length; index++) {
    if (periods[index][0] < periods[index - 1][1]) context.issue('cleaner.breaks', 'invalid_schedule');
  }
}
