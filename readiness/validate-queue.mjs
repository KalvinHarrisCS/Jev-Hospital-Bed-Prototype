import {shape, own, nonempty} from './validate-schema.mjs';

export function validateQueue(value, beds, context) {
  if (value === null) return;
  if (!shape(value, 'queueOverride', ['bedIds', 'reason'], context)) return;
  if (own(value, 'reason') && !nonempty(value.reason)) {
    context.issue('queueOverride.reason', typeof value.reason === 'string' ? 'invalid_queue_override' : 'invalid_schema');
  }
  if (!own(value, 'bedIds')) return;
  const ids = value.bedIds;
  if (!Array.isArray(ids) || Array.from(ids).some(id => !nonempty(id)) || new Set(ids).size !== ids.length) {
    context.issue('queueOverride.bedIds', 'invalid_queue_override'); return;
  }
  if (!Array.isArray(beds)) return;
  const active = beds.filter(bed => bed && Array.isArray(bed.holds) && bed.holds.length === 0).map(bed => bed.bedId);
  if (ids.length !== active.length || active.some(id => !ids.includes(id))) {
    context.issue('queueOverride.bedIds', 'invalid_queue_override');
  }
}
