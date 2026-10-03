import {minutesToMilliseconds} from './duration.mjs';

const pattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?([+-]\d{2}:\d{2})$/;
const clock = new Intl.DateTimeFormat('en-US', {timeZone: 'America/New_York', timeZoneName: 'longOffset'});

export function parseTime(value) {
  if (typeof value !== 'string') return null;
  const parts = value.match(pattern);
  if (!parts) return null;
  const [year, month, day, hour, minute, second] = parts.slice(1, 7).map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > days[month - 1] ||
      hour > 23 || minute > 59 || second > 59) return null;
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) return null;
  const offset = clock.formatToParts(milliseconds).find(part => part.type === 'timeZoneName')?.value;
  if (offset !== 'GMT' + parts[8]) return null;
  return {milliseconds, date: value.slice(0, 10), offset: parts[8]};
}

export function timestamp(value, path, context) {
  const parsed = parseTime(value);
  if (!parsed || (context.snapshot &&
      (parsed.date !== context.snapshot.date || parsed.offset !== context.snapshot.offset))) {
    context.issue(path, 'invalid_timestamp'); return null;
  }
  return parsed.milliseconds;
}

export function update(value, path, context) {
  if (value === null) return;
  const time = timestamp(value, path, context);
  if (time !== null && context.snapshot && time > context.snapshot.milliseconds) {
    context.issue(path, 'future_update');
  }
}

export function window(value, path, context) {
  if (value === null) return null;
  if (!Array.isArray(value) || value.length !== 2) {
    context.issue(path, 'invalid_window'); return null;
  }
  const start = timestamp(value[0], path, context);
  const end = timestamp(value[1], path, context);
  if (start === null || end === null) return null;
  if (start > end) {context.issue(path, 'invalid_window'); return null;}
  return [start, end];
}

export function duration(value, path, context) {
  if (value === null) return;
  if (!Array.isArray(value) || value.length !== 2) {
    context.issue(path, 'invalid_duration');
    return;
  }

  const milliseconds = Array.from(value, minutesToMilliseconds);
  const invalidBound = milliseconds.some(bound => bound === null);
  const reversedBounds = value[0] > value[1];
  if (invalidBound || reversedBounds) {
    context.issue(path, 'invalid_duration');
  }
}
