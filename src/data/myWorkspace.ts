import type { PurviewFilter } from './purview';
import { INCIDENTS, incidentInRegion } from './incidents';
import { STOP_WORK_EVENTS, stopWorkEventInRegion } from './stopWork';
import { BARRIER_FAILURES, barrierFailureInRegion } from './barrierFailures';
import { INSIGHTS, insightInRegion } from './insights';
import { INVESTIGATIONS, investigationInRegion } from './investigations';
import { VISITS } from './visits';
import { OBSERVATIONS } from './observations';
import type { Incident, StopWorkEvent, BarrierFailure, Insight, Investigation, Visit, Observation } from '@/types';

function stopWorkNeedsDecision<T extends { stopWorkWarranted?: boolean; stopWorkCalled?: boolean; stopWorkDismissedBy?: string }>(x: T): boolean {
  return !!x.stopWorkWarranted && !x.stopWorkCalled && !x.stopWorkDismissedBy;
}

/** Everything "awaiting a decision" across every workspace, scoped to one
 * purview — the single source both MyWorkspace's own pages and the Focus
 * nav item's badge count read from, so a count shown before you even open
 * the workspace can't drift from what the pages themselves show once you do.
 *
 * Stocktake (2026-09-04): every status in every source here was checked
 * against who actually acts on it next — a cross-site manager, or a
 * site-based role (supervisor/advisor). Only genuinely manager-decision
 * statuses are counted; a status whose next action belongs to the site is
 * excluded even if the underlying record is otherwise "unresolved in
 * purview". Purview-accountability (see [[project_my_workspace_architecture]])
 * still means a manager should be able to *see* the site-level backlog
 * somewhere — it just isn't this count, which is specifically "what's
 * waiting on me", not "everything not yet closed out anywhere in my patch".
 *
 * - Insight (`review` status): the triage decision (progress to action) and
 *   the owner assignment are both manager actions from the moment an
 *   insight lands in review. Fully in.
 * - Investigation: severe Incidents (`status: 'severe'`) awaiting the
 *   Acknowledge/Progress triage, and open Investigations awaiting an
 *   investigatorName assignment, are both manager actions. Fully in.
 * - Stop Work is two genuinely different manager touchpoints now, not one:
 *   `stopWorkIncidentDecisions`/`stopWorkBarrierFailureDecisions` are the
 *   warranted-but-not-called divergence on an Incident or BarrierFailure —
 *   Request stop work / Dismiss, decided directly on the source record
 *   itself, not a separate StopWorkEvent (see data/stopWork.ts's
 *   top-of-file note on why that decision was moved off StopWorkEvent
 *   entirely). `stopWorkActive` is a real, already-called stop
 *   (`pending_stop`/`stopped`) — confirming it actually happened is the
 *   site's job (`confirmStopped`), but approving the resume is the
 *   manager's, so it stays in. These two are sequential, not duplicate: a
 *   manager is never asked to manage the same real event on two surfaces at
 *   once, because a StopWorkEvent doesn't exist until the decision above is
 *   already made.
 * - Barrier Failures: only `review` status — approving or returning a
 *   submitted fix (serious/critical only) is the one real manager touchpoint
 *   (see `approve`/`returnForRevision` in data/barrierFailures.ts). Both
 *   `open` and `returned` are excluded: resolving it in the first place, and
 *   resubmitting after a return, are squarely the site's job, not the
 *   manager's to decide — counting `open` here was the inconsistency the
 *   user caught: a status with no manager action attached was still
 *   inflating "awaiting your decision".
 * - Pending control acceptance (`WorksiteControl` status `pending_review`):
 *   dropped entirely, not just uncounted. Accept/Modify/Not-required is a
 *   site-level decision start to finish (see `SiteControlDetail.tsx`) —
 *   there's no manager-decision status in this one's lifecycle at all,
 *   unlike Stop Work/Barrier Failures which have a real one further down
 *   their pipeline.
 *
 * Insight and Investigation are further split by assignee (`owner`,
 * `investigatorName`) — once a *named* colleague owns one, responsibility
 * has transferred to them and it drops off your list entirely (the full
 * workspace page is still there for oversight if it stalls); what stays is
 * assigned-to-you or unassigned-in-purview (your duty to triage/self-assign).
 * Stop Work and Barrier Failures have no assignee field to split by — see
 * the workspace-level note in workspaces.ts on why they structurally
 * shouldn't. */
export interface FocusItems {
  incidents: Incident[];
  stopWorkIncidentDecisions: Incident[];
  stopWorkBarrierFailureDecisions: BarrierFailure[];
  stopWorkActive: StopWorkEvent[];
  barrierFailures: BarrierFailure[];
  insightsMine: Insight[];
  insightsUnassigned: Insight[];
  investigationsMine: Investigation[];
  investigationsUnassigned: Investigation[];
}

export function computeFocusItems(purview: PurviewFilter, userName: string): FocusItems {
  const incidents = INCIDENTS.filter((i) => i.status === 'severe' && incidentInRegion(i, purview));
  const stopWorkIncidentDecisions = INCIDENTS.filter((i) => stopWorkNeedsDecision(i) && incidentInRegion(i, purview));
  const stopWorkBarrierFailureDecisions = BARRIER_FAILURES.filter((b) => stopWorkNeedsDecision(b) && barrierFailureInRegion(b, purview));
  const stopWorkActive = STOP_WORK_EVENTS.filter((e) => (e.status === 'pending_stop' || e.status === 'stopped') && stopWorkEventInRegion(e, purview));
  const barrierFailures = BARRIER_FAILURES.filter((b) => b.status === 'review' && barrierFailureInRegion(b, purview));

  const insightsInPurview = INSIGHTS.filter((i) => i.status === 'review' && insightInRegion(i, purview));
  const insightsMine = insightsInPurview.filter((i) => i.owner === userName);
  const insightsUnassigned = insightsInPurview.filter((i) => !i.owner);

  const investigationsInPurview = INVESTIGATIONS.filter((v) => v.status === 'open' && investigationInRegion(v, purview));
  const investigationsMine = investigationsInPurview.filter((v) => v.investigatorName === userName);
  const investigationsUnassigned = investigationsInPurview.filter((v) => !v.investigatorName);

  return { incidents, stopWorkIncidentDecisions, stopWorkBarrierFailureDecisions, stopWorkActive, barrierFailures, insightsMine, insightsUnassigned, investigationsMine, investigationsUnassigned };
}

export function countFocusItems(purview: PurviewFilter, userName: string): number {
  const f = computeFocusItems(purview, userName);
  return f.incidents.length + f.stopWorkIncidentDecisions.length + f.stopWorkBarrierFailureDecisions.length + f.stopWorkActive.length + f.barrierFailures.length
    + f.insightsMine.length + f.insightsUnassigned.length + f.investigationsMine.length + f.investigationsUnassigned.length;
}

// --- Row sets for a "Mine" filter on the real workspace pages ---
//
// Currently unused — the My*.tsx wrapper pages these were built for (each
// reusing Insights.tsx/Investigations.tsx/etc. with a pre-filtered rows
// prop) were removed once it was clear Focus alone should be the single
// personal index, not a duplicate route per type (see workspaces.ts's
// note). Deliberately kept rather than deleted: the natural next step is a
// "Mine" toggle on the real pages themselves (Insights.tsx already has the
// rows-override plumbing from that same removed pass), and these are
// exactly the functions it would call — parked here on purpose, not dead
// code nobody meant to write.
//
// Broader than computeFocusItems above on purpose: Focus is specifically
// "pending decisions" (review-stage only), but a page like Insights.tsx has
// its own tabs (For review / In action / Resolved) — a "Mine" filter there
// needs to cover every status, not just review, or the Action and Resolved
// tabs would silently show the same unfiltered company-wide list Focus
// never would. The rule stays the same one from computeFocusItems's own
// note: mine (any status) + unassigned (review/open only, since action/
// closed items are past the point where "unassigned" is meaningful).

export function myInsightRows(purview: PurviewFilter, userName: string): Insight[] {
  return INSIGHTS.filter((i) => insightInRegion(i, purview) && (i.owner === userName || (i.status === 'review' && !i.owner)));
}

export interface MyInvestigationRows {
  severeIncidents: Incident[];
  openInvestigations: Investigation[];
  closedInvestigations: Investigation[];
}

export function myInvestigationRows(purview: PurviewFilter, userName: string): MyInvestigationRows {
  const severeIncidents = INCIDENTS.filter((i) => i.status === 'severe' && incidentInRegion(i, purview));
  const investigationsInPurview = INVESTIGATIONS.filter((v) => investigationInRegion(v, purview));
  const openInvestigations = investigationsInPurview.filter((v) => v.status === 'open' && (v.investigatorName === userName || !v.investigatorName));
  const closedInvestigations = investigationsInPurview.filter((v) => v.status === 'closed' && v.investigatorName === userName);
  return { severeIncidents, openInvestigations, closedInvestigations };
}

/** Real authorship, not purview-derived — a visit stays yours regardless of
 * which purview lens the switcher currently happens to be set to. */
export function myVisitRows(userName: string): Visit[] {
  return VISITS.filter((v) => v.visitor === userName);
}

export function myObservationRows(userName: string): Observation[] {
  return OBSERVATIONS.filter((o) => o.observerName === userName);
}
