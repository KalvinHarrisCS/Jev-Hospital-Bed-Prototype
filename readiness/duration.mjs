const MILLISECONDS_PER_MINUTE = 60000;
const MAX_ROUNDING_ERROR_MILLISECONDS = 1e-7;

export function minutesToMilliseconds(minutes) {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    return null;
  }

  const milliseconds = minutes * MILLISECONDS_PER_MINUTE;
  const wholeMilliseconds = Math.round(milliseconds);
  if (!Number.isSafeInteger(wholeMilliseconds) || wholeMilliseconds <= 0) {
    return null;
  }

  // Decimal minutes can multiply to just above or below a whole millisecond.
  // Cap the tolerance so large values cannot admit fractional milliseconds.
  const machineRoundingError = Number.EPSILON * Math.max(1, Math.abs(milliseconds));
  const allowedError = Math.min(machineRoundingError, MAX_ROUNDING_ERROR_MILLISECONDS);
  if (Math.abs(milliseconds - wholeMilliseconds) > allowedError) {
    return null;
  }

  return wholeMilliseconds;
}
