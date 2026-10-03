function compareIds(left, right) {
  const a = Array.from(left, character => character.codePointAt(0));
  const b = Array.from(right, character => character.codePointAt(0));
  for (let index = 0; index < Math.min(a.length, b.length); index++) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return a.length - b.length;
}

export function queueOrder(input) {
  const beds = input.beds.filter(bed => bed.holds.length === 0);
  if (input.queueOverride) return [...input.queueOverride.bedIds];
  if (beds.length > 1 && beds.some(bed => !bed.departure?.window)) return null;
  return beds.sort((a, b) => {
    const difference = Date.parse(a.departure?.window?.[0]) - Date.parse(b.departure?.window?.[0]);
    if (difference) return difference;
    return compareIds(a.bedId, b.bedId);
  }).map(bed => bed.bedId);
}
