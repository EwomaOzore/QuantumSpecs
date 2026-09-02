/**
 * Demo clock helpers. Seed data is generated relative to "now"
 * so the checkout spike is always a few hours ago.
 */
export function hoursAgo(hours: number, from = new Date()) {
  return new Date(from.getTime() - hours * 60 * 60 * 1000);
}

export function minutesAgo(minutes: number, from = new Date()) {
  return new Date(from.getTime() - minutes * 60 * 1000);
}

export function spikeWindow(from = new Date()) {
  const end = minutesAgo(150, from);
  const start = new Date(end.getTime() - 32 * 60 * 1000);
  const deployAt = new Date(start.getTime() - 2 * 60 * 1000);
  return { start, end, deployAt };
}
