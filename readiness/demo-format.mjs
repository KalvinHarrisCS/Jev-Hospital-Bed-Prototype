export function formatDemo(result) {
  const clock = new Intl.DateTimeFormat('en-US', {
    timeZone: result.timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  const formatTime = value => clock.format(new Date(value));
  const lines = [
    'Fictional bed-readiness example',
    'Times: ' + result.timezone,
    'Snapshot: ' + formatTime(result.snapshot),
  ];
  for (const bed of result.beds) {
    lines.push('', `${bed.bedId} | ${bed.actualStatus} | ${bed.status}`);
    if (bed.readyWindow) {
      lines.push('Ready: ' + bed.readyWindow.map(formatTime).join(' – ') + ' (pending staff release)');
    } else {
      lines.push('Ready: unknown');
      lines.push('Reasons: ' + bed.reasons.join(', '));
    }
  }
  return lines.join('\n');
}
