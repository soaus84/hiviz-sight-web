import type { WorkStream, WorkStreamKind, WorkStreamSourceType } from '@/types';
import { SITE_ID_BY_NAME } from './sites';
import { INSIGHTS_BY_ID } from './insights';
import { INVESTIGATIONS_BY_ID } from './investigations';

// The shared push-to-site mechanism for Insight and Investigation — see
// [[project_corrective_actions_enquiry_spec]] for the full design
// discussion. One parent (an Insight or Investigation) can carry several of
// these as independent child actions, added in any order — not one ordered
// multi-step ActionDissemination like the roadmap spec's plainer model.
// Targeting is deliberately just the parent's own siteNames (the
// "affected sites" case) for now, no work-type/full-org scope yet — same
// simplification data/risk.ts's pushControlToSite(s) already made for
// controls, reused here on purpose rather than inventing a second
// targeting mechanism.

export const WORK_STREAMS: WorkStream[] = [];
export const WORK_STREAMS_BY_ID: Record<string, WorkStream> = Object.fromEntries(WORK_STREAMS.map((w) => [w.id, w]));

let nextWorkStreamSeq = 1;
let nextStepSeq = 1;

function replaceWorkStream(id: string, patch: Partial<WorkStream>): WorkStream | null {
  const idx = WORK_STREAMS.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  const updated: WorkStream = { ...WORK_STREAMS[idx], ...patch };
  WORK_STREAMS[idx] = updated;
  WORK_STREAMS_BY_ID[id] = updated;
  return updated;
}

export function workStreamsFor(sourceType: WorkStreamSourceType, sourceId: string): WorkStream[] {
  return WORK_STREAMS.filter((w) => w.sourceType === sourceType && w.sourceId === sourceId);
}

/** Every non-draft stream targeting a given site, across both parent types —
 * the site's own "what's asked of me" list (views/sites/SiteWorkStreams.tsx).
 * Drafts are excluded — nothing dispatches to a site until goLive. */
export function workStreamsForSite(siteId: string): WorkStream[] {
  return WORK_STREAMS.filter((w) => w.status !== 'draft' && w.sites.some((s) => s.siteId === siteId));
}

export function workStreamParentTitle(ws: WorkStream): string {
  const parent = ws.sourceType === 'insight' ? INSIGHTS_BY_ID[ws.sourceId] : INVESTIGATIONS_BY_ID[ws.sourceId];
  return parent?.title ?? 'Unknown';
}

export function workStreamParentPath(ws: WorkStream): string {
  return ws.sourceType === 'insight' ? `/insights/${ws.sourceId}` : `/investigations/${ws.sourceId}`;
}

const KIND_TITLE: Record<WorkStreamKind, string> = {
  toolbox_talk: 'Toolbox talk',
  learn: 'Field enquiry',
  improve: 'Corrective actions',
};

/** Opens a new, empty draft. Sites are resolved immediately from siteNames
 * so the draft already shows who this will go to, but nobody is targeted
 * for real (no dispatch, no site sees anything) until goLive. Content is no
 * longer prefilled here — see `populateWithHivizSuggestions` below, the
 * explicit, trackable alternative to silently copying suggested content in
 * on creation (the old behavior showed the same text twice: once in the
 * parent's own read-only "suggested" display, again inside the freshly
 * created draft). */
export function createWorkStream(params: {
  sourceType: WorkStreamSourceType;
  sourceId: string;
  kind: WorkStreamKind;
  siteNames: string[];
  createdBy: string;
  title?: string;
}): WorkStream {
  const id = `WS-${nextWorkStreamSeq++}`;
  const ws: WorkStream = {
    id,
    kind: params.kind,
    status: 'draft',
    sourceType: params.sourceType,
    sourceId: params.sourceId,
    title: params.title ?? KIND_TITLE[params.kind],
    steps: [],
    narrative: params.kind === 'toolbox_talk' ? '' : undefined,
    sites: params.siteNames
      .filter((name) => SITE_ID_BY_NAME[name])
      .map((name) => ({ siteId: SITE_ID_BY_NAME[name], siteName: name, complete: false })),
    createdBy: params.createdBy,
    createdAt: new Date().toISOString(),
  };
  WORK_STREAMS.push(ws);
  WORK_STREAMS_BY_ID[id] = ws;
  return ws;
}

/** Pulls the parent's Hiviz-suggested content into an existing draft — an
 * explicit action instead of an automatic copy, so (a) the manager never
 * sees the same suggested text rendered twice unless they deliberately
 * chose to bring it in, and (b) whether/how often this gets clicked is a
 * real adoption signal (`populatedByHiviz`) worth tracking before deciding
 * to automate more of this flow. Only the actionable text is copied in —
 * any per-item rationale on the suggestion stays behind on the parent's own
 * review/suggestion display, it's not carried onto the dispatched step (see
 * `WorkStreamStep`'s own doc comment). */
export function populateWithHivizSuggestions(id: string, content: { steps?: { text: string }[]; narrative?: string }): WorkStream | null {
  const current = WORK_STREAMS_BY_ID[id];
  if (!current) return null;
  const patch: Partial<WorkStream> = { populatedByHiviz: true };
  if (content.steps) patch.steps = content.steps.map((s) => ({ id: `step${nextStepSeq++}`, text: s.text }));
  if (content.narrative !== undefined) patch.narrative = content.narrative;
  return replaceWorkStream(id, patch);
}

export function updateWorkStreamTitle(id: string, title: string): WorkStream | null {
  return replaceWorkStream(id, { title });
}

/** Full replace of the step list — covers add/edit/remove from one call
 * site (the draft editor keeps its own local array and saves it back here),
 * rather than three separate mutators for what's really one "here's the
 * current list" action. 'learn'/'improve' only. */
export function updateWorkStreamSteps(id: string, steps: { text: string }[]): WorkStream | null {
  const current = WORK_STREAMS_BY_ID[id];
  if (!current) return null;
  return replaceWorkStream(id, { steps: steps.map((s, i) => ({ id: current.steps[i]?.id ?? `step${nextStepSeq++}`, text: s.text })) });
}

/** 'toolbox_talk' only — the narrative is one block, autosaved as the
 * manager edits it, same convention as the free-text fields elsewhere in
 * this app (e.g. Investigation's updateFrameworkFields). */
export function updateWorkStreamNarrative(id: string, narrative: string): WorkStream | null {
  return replaceWorkStream(id, { narrative });
}

/** draft -> live. The moment this would actually dispatch to sites in a
 * real backend — nothing else changes here, the site instances already
 * exist from creation. */
export function goLive(id: string): WorkStream | null {
  return replaceWorkStream(id, { status: 'live' });
}

export function discardDraft(id: string): void {
  const idx = WORK_STREAMS.findIndex((w) => w.id === id);
  if (idx === -1) return;
  WORK_STREAMS.splice(idx, 1);
  delete WORK_STREAMS_BY_ID[id];
}

/** The site's own close-out action (views/sites/SiteWorkStreamDrawer.tsx) —
 * response verification happens at the site, never from the parent
 * Insight/Investigation view, which is read-only over these instances. Once
 * every targeted site is complete, the stream itself rolls up to
 * 'completed' — aggregate status is always derived from the instances, per
 * the roadmap's own "never a stored counter" rule, just applied to status
 * too rather than only the progress count. */
export function markSiteComplete(workStreamId: string, siteId: string, note?: string): WorkStream | null {
  const current = WORK_STREAMS_BY_ID[workStreamId];
  if (!current) return null;
  const sites = current.sites.map((s) => (s.siteId === siteId ? { ...s, complete: true, completedAt: new Date().toISOString(), note } : s));
  const allComplete = sites.length > 0 && sites.every((s) => s.complete);
  return replaceWorkStream(workStreamId, { sites, status: allComplete ? 'completed' : current.status });
}

export function workStreamProgress(ws: WorkStream): { complete: number; total: number } {
  return { complete: ws.sites.filter((s) => s.complete).length, total: ws.sites.length };
}
