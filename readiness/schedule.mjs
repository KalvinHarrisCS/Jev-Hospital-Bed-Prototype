import {minutesToMilliseconds} from './duration.mjs';

export function workPeriods(cleaner) {
  if (!cleaner?.shift || !cleaner.breaks) return [];
  const [shiftStart, shiftEnd] = cleaner.shift.map(Date.parse);
  const breaks = cleaner.breaks.map(pair => pair.map(Date.parse)).sort((a, b) => a[0] - b[0]);
  const periods = []; let cursor = shiftStart;
  for (const [start, end] of breaks) {
    if (start > cursor) periods.push([cursor, start]);
    cursor = end;
  }
  if (cursor < shiftEnd) periods.push([cursor, shiftEnd]);
  return periods;
}

function startInPeriod(earliest, maximumMilliseconds, periods) {
  for (const [open, close] of periods) {
    const start = Math.max(earliest, open);
    if (start + maximumMilliseconds <= close) return start;
  }
  return null;
}

export function scheduleBed(input, bed, previous, periods) {
  const durations = bed.cleaning.minutes.map(minutesToMilliseconds);
  const starts = [0, 1].map(bound => startInPeriod(
    Math.max(Date.parse(input.snapshot), Date.parse(bed.departure.window[bound]), previous[bound]),
    durations[1], periods));
  if (starts.some(start => start === null)) return null;
  const completions = starts.map((start, bound) => start + durations[bound]);
  return {starts, completions};
}
