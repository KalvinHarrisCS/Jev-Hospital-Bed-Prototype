export const nonempty = value => typeof value === 'string' && value.trim().length > 0;
export const own = (value, key) => Object.hasOwn(value, key);
export const fieldPath = (path, key) => path ? `${path}.${key}` : key;

export function shape(value, path, fields, context) {
  if (value === null || typeof value !== 'object' || Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    context.issue(path, 'invalid_schema'); return false;
  }
  for (const key of fields) {
    if (!own(value, key)) context.issue(fieldPath(path, key), 'invalid_schema');
  }
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string' || !fields.includes(key)) {
      context.issue(fieldPath(path, String(key)), 'invalid_schema');
    }
  }
  return true;
}

export function text(value, path, context, nullable = false) {
  if (!(nullable && value === null) && !nonempty(value)) context.issue(path, 'invalid_schema');
}

export function choice(value, options, path, context) {
  if (!options.includes(value)) context.issue(path, 'invalid_schema');
}

export function eachField(value, path, validators) {
  for (const [key, validate] of Object.entries(validators)) {
    if (own(value, key)) validate(value[key], fieldPath(path, key));
  }
}
