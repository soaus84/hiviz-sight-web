export function firstName(fullName: string): string {
  return fullName.split(' ')[0];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Matches the existing "Thu 8 May · 09:30" display convention used across VISITS. */
export function formatVisitWhen(date: string, time: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${WEEKDAYS[dt.getDay()]} ${dt.getDate()} ${MONTHS[dt.getMonth()]} · ${time}`;
}

/** Weekday + zero-padded day-of-month, for the pseudo-calendar date tile
 * (e.g. visit drawers) — a compact stand-in for spelling the whole date out
 * in a giant Stat-style number. */
export function dayParts(date: string): { weekday: string; day: string } {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return { weekday: WEEKDAYS[dt.getDay()], day: String(dt.getDate()).padStart(2, '0') };
}
