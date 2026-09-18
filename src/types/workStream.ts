/** A "Work Stream" — the shared push-to-site mechanism for Insight and
 * Investigation, per [[project_corrective_actions_enquiry_spec]] (see that
 * memory for the full design discussion this implements). Reuses the exact
 * targeting idea already built for CriticalControl rollout
 * (data/risk.ts's pushControlToSite/pushControlToSites): resolve a scope to
 * a concrete site list, create one instance per site, track completion
 * per-site, roll that up into one aggregate progress readout on the parent.
 *
 * Deliberately NOT the roadmap's `ActionDissemination` shape — one parent
 * (an Insight or Investigation) can carry several of these as independent
 * "child actions," addable in any order, not one ordered multi-step
 * sequence. No per-stream `owner` — a Work Stream is pushed to sites, not
 * assigned to a named person (site is the owner), mirroring how a
 * WorksiteControl push has no individual owner either.
 */
export type WorkStreamKind = 'toolbox_talk' | 'learn' | 'improve';

export type WorkStreamStatus = 'draft' | 'live' | 'completed';

export type WorkStreamSourceType = 'insight' | 'investigation';

/** One line item within a 'learn' or 'improve' stream — a question or an
 * action step, just the text a site actually needs to act on. Deliberately
 * carries no "why Hiviz suggested this" rationale — that's manager-facing
 * decision support and belongs in wherever the parent Insight/Investigation
 * shows its suggestions for review, not as a second line riding along on
 * every dispatched item (a per-step rationale line read as an unlabeled
 * extra list item once populated — see [[project_corrective_actions_enquiry_spec]]).
 * 'toolbox_talk' does NOT use steps — see `WorkStream.narrative` below; a
 * toolbox talk is one ready-to-read comms narrative, never a checklist
 * (confirmed against a real generated CriticalInsight payload 2026-09-11). */
export interface WorkStreamStep {
  id: string;
  text: string;
}

/** One targeted site's own record — no owner. Verification/response happens
 * at the site level (see views/sites/SiteWorkStreams.tsx,
 * SiteWorkStreamDrawer.tsx) — the parent Insight/Investigation view is read
 * -only, an aggregator over these instances, not a place to mark one done.
 * `complete` means "delivered" for a toolbox_talk stream and "done" for
 * learn/improve — same underlying state, just relabelled per kind in the
 * UI (see workStreamDoneWord in views/shared/workStreamDisplay.ts). */
export interface WorkStreamSite {
  siteId: string;
  siteName: string;
  complete: boolean;
  completedAt?: string;
  /** The site's own response/closure note — required to mark complete,
   * same "what was actually done" convention as CorrectiveAction's
   * closure_notes in the roadmap spec. */
  note?: string;
}

export interface WorkStream {
  id: string;
  kind: WorkStreamKind;
  status: WorkStreamStatus;
  sourceType: WorkStreamSourceType;
  sourceId: string;
  title: string;
  /** 'learn'/'improve' only — a list of questions or action steps. Always
   * empty for 'toolbox_talk'. */
  steps: WorkStreamStep[];
  /** 'toolbox_talk' only — the single comms narrative a supervisor reads
   * aloud, prefilled from the parent's own aiToolboxNarrative when present.
   * Undefined for 'learn'/'improve'. */
  narrative?: string;
  /** Resolved at creation from the parent's own siteNames — always
   * "affected sites" scope for now, no work-type/full-org targeting yet. */
  sites: WorkStreamSite[];
  createdBy: string;
  createdAt: string;
  /** True once the manager has pulled Hiviz's suggested content into this
   * draft via "Populate with Hiviz suggestions" (WorkStreamsSection.tsx),
   * instead of writing it from scratch. Kept through later manual edits —
   * the thing worth tracking is "did this start from a suggestion," not
   * "is the final text still identical to it" — so this doubles as the
   * adoption signal for deciding whether to automate more of this flow
   * later (see [[project_corrective_actions_enquiry_spec]]). */
  populatedByHiviz?: boolean;
}
