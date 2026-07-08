import type { Tone } from '@/tokens';
import type { User } from '@/types';
import { USERS } from './users';
import { VISITS } from './visits';
import { OBSERVATIONS } from './observations';
import { regionMatchesScope } from './regions';
import { divisionMatchesScope } from './divisions';
import type { PurviewFilter } from './purview';

// Fixed narrative "now" — mirrors the same literal already used in
// data/insights.ts and Dashboard.tsx so all mock "today" math agrees.
const MOCK_NOW = new Date('2025-05-07T10:00:00');

export interface MonthRange {
  start: Date;
  end: Date;
  label: string;
  isCurrent: boolean;
}

/** offset 0 = the current mock month, bounded at "today" (month to date).
 * Negative offsets step back through fully-elapsed prior months — there's
 * no "future" scenario to guard against since every day up to MOCK_NOW has
 * already happened. */
export function monthRange(offset: number): MonthRange {
  const base = new Date(MOCK_NOW.getFullYear(), MOCK_NOW.getMonth() + offset, 1);
  const isCurrent = offset === 0;
  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  const end = isCurrent
    ? new Date(MOCK_NOW.getFullYear(), MOCK_NOW.getMonth(), MOCK_NOW.getDate(), 23, 59, 59, 999)
    : new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);
  const monthLabel = start.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
  return { start, end, label: isCurrent ? `${monthLabel} (month to date)` : monthLabel, isCurrent };
}

function inRange(iso: string, range: MonthRange): boolean {
  const d = new Date(iso);
  return d >= range.start && d <= range.end;
}

export interface MemberStats {
  visitCount: number;
  obsCount: number;
}

/** Visit/observation counts within the given month range. Matched by name —
 * neither Visit nor Observation carries a userId FK (no backend in this app)
 * — so names in visits.ts/observations.ts must agree with data/users.ts's
 * spelling for a contribution to be attributable to a member. */
export function memberStats(member: User, range: MonthRange): MemberStats {
  const visitCount = VISITS.filter((v) => v.visitor === member.name && inRange(v.date, range)).length;
  const obsCount = OBSERVATIONS.filter((o) => o.observerName === member.name && inRange(o.occurredAt, range)).length;
  return { visitCount, obsCount };
}

/** All-time visit/observation totals — for the member's own profile drawer,
 * which is a stable identity view and shouldn't shift underneath someone
 * because they happened to have a different month selected on the list
 * page. Visits exclude `upcoming` (not yet happened); observations have no
 * scheduled state so all of them count. */
export function totalMemberStats(member: User): MemberStats {
  const visitCount = VISITS.filter((v) => v.visitor === member.name && v.state !== 'upcoming').length;
  const obsCount = OBSERVATIONS.filter((o) => o.observerName === member.name).length;
  return { visitCount, obsCount };
}

export interface VisitRecency {
  label: string;
  /** null = no visits on record — render as plain muted text, not a badge. */
  tone: Tone | null;
}

/** Days since this member's most recent completed visit, independent of the
 * month range being viewed — bucketed like the Visibility tone scale on the
 * Sites list (recent/ageing/stale) rather than shown as a raw day count. */
export function lastVisitRecency(member: User): VisitRecency {
  const past = VISITS.filter((v) => v.visitor === member.name && v.state !== 'upcoming');
  if (past.length === 0) return { label: 'No visits yet', tone: null };
  const mostRecent = past.reduce((latest, v) => (v.date > latest.date ? v : latest));
  const days = Math.floor((MOCK_NOW.getTime() - new Date(mostRecent.date).getTime()) / 86_400_000);
  const label = days === 0 ? 'Today' : `${days}d ago`;
  if (days <= 7) return { label, tone: 'success' };
  if (days <= 21) return { label, tone: 'warning' };
  return { label, tone: 'error' };
}

/** A member is in purview if their home region matches the scope, and —
 * only when they carry a division pin — their division matches too. An
 * unpinned member (most region-wide roles) is visible under any division
 * filter within their region, since they aren't a single division's person
 * to begin with. */
export function memberInPurview(member: User, purview: PurviewFilter): boolean {
  if (!regionMatchesScope(member.region, purview.region)) return false;
  if (!member.division) return true;
  return divisionMatchesScope(member.division, purview.division);
}

/** Excludes revoked members — someone who's lost access shouldn't read as a
 * current contributor. Invited members still show (matches the existing
 * "unassigned" filtering elsewhere — being invited isn't a reason to hide
 * someone), only revoked is a real exclusion. */
export function membersInPurview(purview: PurviewFilter): User[] {
  return USERS.filter((u) => u.status !== 'revoked' && memberInPurview(u, purview));
}
