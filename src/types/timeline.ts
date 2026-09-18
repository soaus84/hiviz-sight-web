import type { FwFactor } from './insight';

/** An Investigation's timeline — per the 2026-09-14 workshop redesign (see
 * [[project_investigation_timeline]]), this is treated as the substance of
 * the investigation itself, not a bolt-on artifact: "this is what happened,
 * these are the systemic factors identified as contributing or helping with
 * recovery at these event steps, these are the controls that failed." Only
 * on Investigation — Insight has no equivalent root-cause reconstruction
 * step, so this is a deliberate exception to this app's usual Insight/
 * Investigation symmetry (see [[feedback_insight_investigation_symmetry]]).
 */

/** The semantic tag(s) an event can carry — mirrors WorkStreamKind's shape
 * (types/workStream.ts): a small closed taxonomy plus a *_DISPLAY lookup for
 * label/icon/tone (views/shared/timelineDisplay.ts), rather than a new
 * pattern. An event can carry zero, one, or several context tags — a bare
 * fact can be logged before it's understood, and gain context as the
 * investigation progresses. */
export type TimelineContextKind = 'normal_work' | 'deviation' | 'recovery' | 'failure' | 'systemic';

/** One context tag on a TimelineEvent — and, per the 2026-09-15 redesign
 * (see [[project_investigation_timeline]]), the *only* place a "finding"
 * lives now. There is no separate Finding entity/store any more: a context
 * tag that carries a `recommendation` **is** a finding, intrinsically linked
 * to the one event it sits on — no separate "which events does this trace
 * to" picker, because the link was never anything other than "this context
 * is on this event." A finding "is control kind" when `context.kind` is
 * 'failure', "systemic kind" when it's 'systemic' — see
 * `views/incidents/findingsView.ts`'s `deriveFindings`/`findingKindOf`.
 * Deliberately keyed on `kind`, not `controlId` presence, since 2026-09-18:
 * a control finding can recommend a control that doesn't exist in the
 * register yet (`controlRecommendationType: 'new_control'`), so `controlId`
 * being unset no longer implies "not a control finding."
 *
 * `controlId`/`controlName` are only meaningful for 'recovery' (a control
 * caught or limited the deviation at this point) and 'failure' (a control
 * should have acted here but didn't) — resolved from the real Risk register
 * (data/risk.ts's CriticalControl) when a real control is picked, matching
 * how specs/features/INVESTIGATION.md already calls for contributing
 * factors linking to specific critical controls; for 'failure' with
 * `controlRecommendationType: 'new_control'`, `controlId` stays unset and
 * `controlName` instead carries the investigator's own free-text
 * description of the control that should exist. `controlName` is cached at
 * creation time, same convention as BarrierFailure.controlName
 * (types/risk.ts). `expectedBehavior` is 'deviation'-only — what should
 * have happened instead, i.e. the normal-work baseline this event departed
 * from. `influence` is also 'deviation'-only, added 2026-09-15 alongside the
 * ContextDrawer redesign — distinct from `expectedBehavior`: "what should
 * have happened" vs. "what influenced the drift or the unexpected
 * response," the baseline versus its own cause.
 *
 * `recommendation` is meaningful for 'failure' (a control finding) and
 * 'systemic' (a systemic finding) — the two kinds that actually produce a
 * finding — not 'normal_work'/'recovery'/'deviation', which stay purely
 * descriptive of what happened. Promotable into a real Work Stream via
 * "Populate with Hiviz suggestions" exactly like the old, now-removed,
 * standalone Finding.recommendation was.
 *
 * `controlRecommendationType` — 'failure' only, added 2026-09-18 as part of
 * the ICAM pass (see [[project_investigation_timeline]]): a control finding
 * isn't always "this existing control failed" — the register can simply be
 * missing a control the investigation concludes should exist, which is a
 * real finding even when every control that *does* exist was in place. Lets
 * `controlId` legitimately stay unset ('new_control': `controlName` carries
 * the investigator's own free-text description instead of a register
 * lookup) rather than forcing every control finding to reference something
 * that already exists in the register.
 *
 * `contribution`/`origin`/`confidence`/`leadsToInsight` — 'systemic' only,
 * added 2026-09-18, ICAM-style: two separate questions rather than one
 * generic `note`, because "what did this contribute" (the proximate
 * mechanism) and "how did this arise" (the organisational origin) are
 * different judgments an investigator can get right or wrong independently
 * — e.g. "they didn't know how to use the isolation switch" contributed,
 * but it arose because "the business was focused on production and training
 * was skipped." `confidence` is the investigator's own human judgment (0-1)
 * that this is a real contributor — deliberately not shaped like
 * `AiClassification`/`FwClassification`'s confidence+rationale, since
 * those are AI-generated and this one explicitly isn't. `leadsToInsight` is
 * the investigator's own call that this finding is significant enough to
 * raise through the systemic cause phase — distinct from
 * `suggestsSystemic`'s FW-domain heuristic in InvestigationDetail.tsx,
 * which is Hiviz's own hint from `fwClassifications` and can disagree with
 * the investigator's judgment here.
 *
 * `fwFactor` — 2026-09-15, reworked same day per direct user feedback ("I
 * thought systemic contributors were going to be a context type, not
 * nested within a context"): originally added as a 'deviation'-only field,
 * corrected into the defining field of the 'systemic' kind above —
 * 'systemic' is its own sibling context kind (a deviation describes what
 * happened at a moment; a systemic tag describes an organisational-level
 * factor — process, resourcing, leadership — that helped it happen, and
 * doesn't have to be tied to any one moment's behaviour). Classified
 * against one of the real Forge Works Map® 15 factors
 * (`views/shared/fwFactorDisplay.ts`, sourced from `globals/fw-map-
 * blueprint.md` in the Hiviz roadmap spec) rather than staying an
 * unclassified free-text note — this is what the old free-text
 * `Investigation.contributingFactors` list is retired in favour of.
 * 'systemic'-only; a control finding ('failure') already has its own
 * concrete classification via the control/hazard/work-type chain, so this
 * isn't offered there. */
export type ControlRecommendationType = 'new_control' | 'improve_control';

export interface TimelineContext {
  id: string;
  kind: TimelineContextKind;
  controlId?: string;
  controlName?: string;
  controlRecommendationType?: ControlRecommendationType;
  expectedBehavior?: string;
  influence?: string;
  fwFactor?: FwFactor;
  note?: string;
  contribution?: string;
  origin?: string;
  confidence?: number;
  leadsToInsight?: boolean;
  recommendation?: string;
  promotedWorkStreamId?: string;
}

/** One entry on an Investigation's timeline — "this happened, at this
 * time." `at` is the investigator's best-known time, not necessarily
 * precise — `timeUnknown` marks it as approximate/undetermined (e.g. a
 * systemic "decision" event, such as a rostering policy set weeks before the
 * incident, where `at` still holds a real date for sorting purposes but
 * shouldn't be displayed as if it were precise). `context` is the addable
 * semantic layer above — see `TimelineContext`. `evidenceIds` is here so the
 * shape won't need revisiting once evidence attachment (a later phase)
 * lands; nothing populates it yet. */
export interface TimelineEvent {
  id: string;
  investigationId: string;
  at: string;
  timeUnknown?: boolean;
  description: string;
  context: TimelineContext[];
  evidenceIds?: string[];
  /** True for an event created via "Populate with Hiviz suggestions" from
   * investigation.assist's output (InvestigationAssistFields.aiSuggested
   * TimelineEvents, types/incident.ts) rather than typed by hand — same
   * "did this start from a suggestion" tracking convention as
   * WorkStream.populatedByHiviz. The investigator can edit, delete, or
   * ignore it exactly like any other event; this only ever labels
   * provenance. */
  populatedByHiviz?: boolean;
  createdBy: string;
  createdAt: string;
}
