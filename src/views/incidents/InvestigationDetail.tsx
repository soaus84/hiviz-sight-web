import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, type Tone } from '@/tokens';
import { Card, Badge, Btn, AINote, Avatar, Icon, Toggle } from '@/components';
import { useActiveUser } from '@/state/ActiveUser';
import { AttnRow } from '@/views/shared/AttnRow';
import { WorkStreamsSection } from '@/views/shared/WorkStreamsSection';
import { InvestigationAssist } from '@/views/shared/InvestigationAssist';
import { Section } from '@/views/shared/SectionHeading';
import { InvestigationTimeline } from './InvestigationTimeline';
import { InvestigationFindings } from './InvestigationFindings';
import { RiskAssessment } from './RiskAssessment';
import { WitnessStatements } from './WitnessStatements';
import { deriveFindings } from './findingsView';
import { INCIDENTS } from '@/data/incidents';
import { energyLabel } from '@/data/observations';
import { SAFETY_PRACTICES } from '@/data/admin/taxonomies';
import { assignInvestigator, assignManager, updateFrameworkFields, submitInvestigationForApproval, approveInvestigation, closeInvestigation, flagSystemicCause } from '@/data/investigations';
import { timelineForInvestigation } from '@/data/timeline';
import { workStreamsFor } from '@/data/workStreams';
import { USERS } from '@/data/users';
import { STOP_WORK_EVENTS_BY_ID } from '@/data/stopWork';
import { INSIGHTS_BY_ID, INSIGHT_KIND_LABEL } from '@/data/insights';
import { INCIDENT_STATUS_DISPLAY, INVESTIGATION_STATUS_DISPLAY, SEVERITY_DISPLAY, STOP_WORK_STATUS_DISPLAY } from './incidentDisplay';
import type { CorrectiveAction, Incident, Investigation, SharingScope } from '@/types';

/** What to show for an incident's stop-work state, without leaving this
 * screen — an investigator needs to know if the site is still stopped, not
 * just what the incident's own status says. Checks the same three states
 * SevereIncidentReview.tsx/IncidentDetail.tsx render, in the same order. */
function stopWorkIndicator(i: Incident): { label: string; tone: Tone } | null {
  if (i.stopWorkEventId) {
    const e = STOP_WORK_EVENTS_BY_ID[i.stopWorkEventId];
    if (e) return { label: `Stop work: ${STOP_WORK_STATUS_DISPLAY[e.status].label}${e.siteWide ? ' · Site-wide' : ''}`, tone: STOP_WORK_STATUS_DISPLAY[e.status].tone };
  }
  if (i.stopWorkDismissedBy) return { label: 'Stop work: Dismissed', tone: 'primary' };
  if (i.stopWorkWarranted && !i.stopWorkCalled) return { label: 'Stop work: Needs decision', tone: 'error' };
  return null;
}

const fieldLabel = { display: 'block', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, marginBottom: 5 };
const textareaStyle = { width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.4, resize: 'vertical' as const, outline: 'none' };
const inputStyle = { padding: '7px 9px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 12.5, outline: 'none' };

/** Popover listing real Users to assign as investigator or manager — same
 * shell as InsightDetail's AssigneeMenu, parameterised by `label` since the
 * 2026-09-14 redesign added a second assignable role (see
 * `Investigation.managerName`'s own doc comment, types/incident.ts). */
function PersonMenu({ open, onClose, onSelect, label }: { open: boolean; onClose: () => void; onSelect: (name: string) => void; label: string }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
      <div className="a-pop" style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, width: 230, background: colors.panel, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-popover)', zIndex: 70, overflow: 'hidden' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.inkMuted, padding: '10px 14px 6px' }}>
          {label}
        </div>
        {USERS.map((u) => (
          <button
            key={u.id}
            onClick={() => onSelect(u.name)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <Avatar name={u.name} size={26} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700 }}>{u.name}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: colors.inkSoft }}>{u.role}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

/** Always read-only now (2026-09-15) — corrective-action dissemination is
 * the Actions-phase Work Streams section's job (it already pulls Findings'
 * own recommendations via "Populate with Hiviz suggestions"); this list is
 * kept only because the closed seeds' entries carry real owner/dueDate/done
 * history that predates Work Streams and would otherwise be lost. See
 * [[project_investigation_timeline]]'s Framework audit. */
function ActionList({ actions }: { actions: CorrectiveAction[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {actions.map((a, k) => (
        <div key={k} style={{ border: `1px solid ${colors.ruleSoft}`, borderRadius: 'var(--radius-md)', padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Icon name={a.done ? 'check_box' : 'check_box_outline_blank'} size={18} color={a.done ? colors.green : colors.inkMuted} style={{ marginTop: 1, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, textDecoration: a.done ? 'line-through' : undefined, color: a.done ? colors.inkMuted : colors.ink }}>{a.action}</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontStyle: 'italic', color: colors.inkSoft, marginTop: 3 }}>{a.rationale}</div>
            {(a.owner || a.dueDate) && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, marginTop: 5 }}>{[a.owner, a.dueDate].filter(Boolean).join(' · ')}</div>
            )}
          </div>
        </div>
      ))}
      {actions.length === 0 && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkMuted, fontWeight: 500 }}>None recorded yet.</div>}
    </div>
  );
}

/** `onOpenIncident`/`onOpenSystemicInsight` open the linked record as a
 * nested drawer over this one instead of navigating away — omitted by
 * whichever page renders this already-nested inside someone else's, so
 * nesting never goes past one level deep. See StopWorkDrawer.tsx's own
 * onOpenSource for the same rule in the other direction. */
export function InvestigationDetail({ v, onOpenIncident, onOpenSystemicInsight, onChanged }: { v: Investigation; onOpenIncident?: (id: string) => void; onOpenSystemicInsight?: (insightId: string) => void; onChanged?: () => void }) {
  const navigate = useNavigate();
  const { user } = useActiveUser();
  const status = INVESTIGATION_STATUS_DISPLAY[v.status];
  const severity = SEVERITY_DISPLAY[v.severityClass];
  const srcIncidents = INCIDENTS.filter((i) => i.linkedInvestigationId === v.id);
  // Scopes the Timeline/Findings control pickers to the work type(s) this
  // investigation's own incidents actually occurred under — see
  // data/risk.ts's controlsForWorkTypes and [[project_investigation_timeline]].
  const relevantWorkTypeIds = [...new Set(srcIncidents.map((i) => i.workTypeId).filter((id): id is string => !!id))];
  // Whatever source incidents happen to carry their own stop-work event —
  // usually 0 or 1 — surfaced live on the Timeline (InvestigationTimeline's
  // StopWorkBanner), never a stored snapshot. Barrier failures would get the
  // same treatment but there's no Incident<->BarrierFailure link to source
  // one from yet (see [[project_deferred_risk_incident_ideas]]).
  const stopWorkEventIds = [...new Set(srcIncidents.map((i) => i.stopWorkEventId).filter((id): id is string => !!id))];
  const timelineEvents = timelineForInvestigation(v.id);
  const findings = deriveFindings(timelineEvents);

  const [investigatorMenuOpen, setInvestigatorMenuOpen] = useState(false);
  const [managerMenuOpen, setManagerMenuOpen] = useState(false);
  const [immediateCause, setImmediateCause] = useState(v.immediateCause ?? '');
  const [rootCause, setRootCause] = useState(v.rootCause ?? '');
  const [actionError, setActionError] = useState<string | null>(null);
  const [systemicOpen, setSystemicOpen] = useState(false);
  const [systemicSummary, setSystemicSummary] = useState(v.rootCause ?? '');
  const [systemicError, setSystemicError] = useState<string | null>(null);

  // 2026-09-14 redesign (see [[project_investigation_timeline]]): the old
  // single 'open'-derived `editable` boolean split in two, one per phase —
  // canEditTimeline covers everything that used to be gated on 'open'
  // (Framework fields, Findings, the Timeline itself), canEditActions is new
  // and gates Work Stream creation, which now belongs to its own phase
  // rather than being available throughout 'open'.
  const canEditTimeline = v.status === 'timeline';
  const canEditActions = v.status === 'actions';
  // investigation.assist's output — only worth showing while the
  // investigator is still working the framework; superseded by the
  // investigator's own confirmed fields (and later, real fwClassifications)
  // once past that phase. Narrowed to root cause/contributing factors/factor
  // hint only (2026-09-18) — suggested interview questions and corrective
  // actions were dropped from "The story so far" itself since they now have
  // real homes on this same page (Witness Statements pre-populates from
  // aiSuggestedInterviewQuestions; Work Streams' own "Populate with Hiviz
  // suggestions" already surfaces aiSuggestedCorrectiveActions in the
  // Actions phase) — showing them again here was pure duplication, and
  // `hasInvestigationAssist`'s broader check (which also counts those two
  // fields) would otherwise gate this section open with nothing left to show
  // if an investigation only ever had those two populated.
  const hasAiAssist = canEditTimeline && !!(v.aiSuggestedRootCause || v.aiSuggestedContributingFactors?.length || v.aiFactorHint);
  const suggestsSystemic = v.fwClassifications?.some((f) => f.domain === 'guide' || f.domain === 'enable') ?? false;

  const handleAssignInvestigator = (name: string) => {
    assignInvestigator(v.id, name);
    setInvestigatorMenuOpen(false);
    onChanged?.();
  };
  const handleAssignManager = (name: string) => {
    assignManager(v.id, name);
    setManagerMenuOpen(false);
    onChanged?.();
  };
  const patchImmediateCause = (val: string) => { setImmediateCause(val); updateFrameworkFields(v.id, { immediateCause: val }); };
  const patchRootCause = (val: string) => { setRootCause(val); updateFrameworkFields(v.id, { rootCause: val }); };
  const setClearedForSharing = (checked: boolean) => { updateFrameworkFields(v.id, { clearedForSharing: checked }); onChanged?.(); };
  const setSharingScope = (scope: SharingScope) => { updateFrameworkFields(v.id, { sharingScope: scope }); onChanged?.(); };
  const setLegalHold = (checked: boolean) => { updateFrameworkFields(v.id, { legalHold: checked }); onChanged?.(); };

  // The two-signoff gate — see InvestigationStatus's own doc comment
  // (types/incident.ts). Submitting doesn't change status by itself;
  // approving is what actually advances 'timeline' -> 'actions'.
  const handleSubmit = () => {
    const result = submitInvestigationForApproval(v.id, user.name, findings.length > 0);
    setActionError(result.error ?? null);
    if (!result.error) onChanged?.();
  };
  const handleApprove = () => {
    const result = approveInvestigation(v.id, user.name);
    setActionError(result.error ?? null);
    if (!result.error) onChanged?.();
  };
  const handleClose = () => {
    const hasLiveWorkStream = workStreamsFor('investigation', v.id).some((w) => w.status !== 'draft');
    const result = closeInvestigation(v.id, hasLiveWorkStream);
    setActionError(result.error ?? null);
    if (!result.error) onChanged?.();
  };
  const handleFlagSystemic = () => {
    const result = flagSystemicCause(v.id, systemicSummary);
    setSystemicError(result.error ?? null);
    if (!result.error) { setSystemicOpen(false); onChanged?.(); }
  };

  return (
    <Card pad={24}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <Badge tone={status.tone}>{status.label}</Badge>
        <Badge tone={severity.tone} outline>{severity.label}</Badge>
        {v.legalHold && <Badge tone="error" outline icon="lock">Legal hold</Badge>}
        {v.status === 'timeline' && v.submittedAt && <Badge tone="primary" outline icon="hourglass_top">Awaiting approval</Badge>}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, color: colors.inkSoft, marginLeft: 'auto' }}>{v.id}</span>
      </div>
      <h2 style={{ fontFamily: 'var(--font-sans)', margin: 0, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2 }}>{v.title}</h2>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkSoft, marginTop: 10, lineHeight: 1.5 }}>{v.summary}</div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
        {v.siteNames.map((s, k) => <Badge key={k} tone="primary" outline icon="place">{s}</Badge>)}
      </div>

      <div style={{ position: 'relative', marginTop: 14, background: colors.fill, borderRadius: 'var(--radius-lg)', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setInvestigatorMenuOpen((val) => !val)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, width: 68, textAlign: 'left', flexShrink: 0 }}>Investigator</span>
              {v.investigatorName ? <Avatar name={v.investigatorName} size={26} /> : (
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: colors.rule, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="person" size={14} color={colors.inkMuted} />
                </div>
              )}
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 500, color: v.investigatorName ? colors.ink : colors.inkMuted }}>{v.investigatorName || 'Unassigned'}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, color: colors.ink, textDecoration: 'underline', textTransform: 'uppercase' }}>{v.investigatorName ? 'Reassign' : 'Assign'}</span>
            </button>
            <PersonMenu open={investigatorMenuOpen} onClose={() => setInvestigatorMenuOpen(false)} onSelect={handleAssignInvestigator} label="Assign investigator" />
          </div>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setManagerMenuOpen((val) => !val)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, width: 68, textAlign: 'left', flexShrink: 0 }}>Manager</span>
              {v.managerName ? <Avatar name={v.managerName} size={26} /> : (
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: colors.rule, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="shield_person" size={14} color={colors.inkMuted} />
                </div>
              )}
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 500, color: v.managerName ? colors.ink : colors.inkMuted }}>{v.managerName || 'Unassigned'}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, color: colors.ink, textDecoration: 'underline', textTransform: 'uppercase' }}>{v.managerName ? 'Reassign' : 'Assign'}</span>
            </button>
            <PersonMenu open={managerMenuOpen} onClose={() => setManagerMenuOpen(false)} onSelect={handleAssignManager} label="Assign manager" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {v.status === 'timeline' && !v.submittedAt && (
            <Btn variant="primary" size="sm" icon="arrow_forward" onClick={handleSubmit}>Submit for approval</Btn>
          )}
          {v.status === 'timeline' && v.submittedAt && (
            <Btn variant="primary" size="sm" icon="check" onClick={handleApprove}>Approve</Btn>
          )}
          {v.status === 'actions' && (
            <Btn variant="primary" size="sm" icon="check" onClick={handleClose}>Close investigation</Btn>
          )}
        </div>
      </div>
      {actionError && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.red, fontWeight: 600, marginTop: 8 }}>{actionError}</div>}

      {/* Energy/keyHazard/safetyPracticeIds are static facts carried over
       * from the source Incident at openInvestigationFromIncident time (see
       * their own doc comment, types/incident.ts) — never re-classified here
       * (see [[project_investigation_timeline]]'s roadmap-spec check:
       * INVESTIGATION.md is explicit that investigation jobs consume
       * "already-confirmed... classified energy/barrier values from the
       * upstream incident — no independent classification happens here").
       * Grouped as one "Incident context" block and moved up here (2026-09-17
       * regroup) — previously these sat after Framework/Work Streams, far
       * from the story they give context to. Deliberately kept separate from
       * "The story so far" below rather than merged into it: this context is
       * always present regardless of phase, while the story below only
       * exists during 'timeline' with investigation.assist output — folding
       * a phase-gated block and an always-on one together would make the
       * always-on content flicker in and out of a section that's sometimes
       * there and sometimes not. Forge Works Map® classification (below,
       * near Systemic cause phase) is deliberately NOT in this group either
       * — it's the investigation's own Stage 5 output, produced at close,
       * not an inherited incident fact, so it stays next to the systemic
       * cause phase it actually informs. */}
      <Section title="Incident context" subtitle="Energy type, key hazard, and safety practices carried over from the source incident.">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Energy classification</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: (v.keyHazard || !!v.safetyPracticeIds?.length) ? 14 : 0 }}>
          {v.energyTypes.map((e, k) => <Badge key={k} tone={e === 'none' ? 'warning' : 'error'} outline>{energyLabel(e)}</Badge>)}
        </div>
        {v.keyHazard && (
          <div style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '12px 14px', marginBottom: v.safetyPracticeIds?.length ? 14 : 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Key hazard</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{v.keyHazard.title}</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontStyle: 'italic', color: colors.inkSoft, lineHeight: 1.45 }}>{v.keyHazard.rationale}</div>
          </div>
        )}
        {!!v.safetyPracticeIds?.length && (
          <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Safety practices</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {v.safetyPracticeIds.map((id) => {
                const p = SAFETY_PRACTICES.find((s) => s.id === id);
                return p ? <Badge key={id} tone="primary" outline icon={p.icon}>{p.name}</Badge> : null;
              })}
            </div>
          </>
        )}
      </Section>

      {/* The AI-generated story sits above the Timeline on purpose — it's
       * the orienting narrative a reader should have *before* working
       * through the event-by-event reconstruction, same reasoning Insight
       * puts its own Pattern Summary before Source observations. Used to
       * live nested inside the Framework card below, which put it after
       * both the Timeline and the Findings it should actually inform —
       * moved 2026-09-15 per a direct audit request. Its own
       * aiSuggestedContributingFactors/aiSuggestedCorrectiveActions/
       * interview-question rationale stay visible here throughout — while
       * the action text itself (once a Work Stream exists) is also
       * reachable via "Populate with Hiviz suggestions" on the
       * improve/learn draft, the per-item *rationale* has no home there
       * (Work Stream steps deliberately carry no rationale — see
       * WorkStreamStep's own doc comment), so this AI panel is the only
       * place it's shown. The old manual "Contributing factors" list this
       * used to also feed was removed outright (see Framework audit,
       * [[project_investigation_timeline]]) — every instance of it was
       * fully duplicated by a real Finding. */}
      {hasAiAssist && (
        <Section title="The story so far" subtitle="Hiviz's orienting read on what happened — worth reading before working through the timeline below." pad={16}>
          <InvestigationAssist
            aiSuggestedRootCause={v.aiSuggestedRootCause}
            aiSuggestedRootCauseRationale={v.aiSuggestedRootCauseRationale}
            aiSuggestedContributingFactors={v.aiSuggestedContributingFactors}
            aiFactorHint={v.aiFactorHint}
          />
        </Section>
      )}

      <InvestigationTimeline investigationId={v.id} canEdit={canEditTimeline} onChanged={onChanged} relevantWorkTypeIds={relevantWorkTypeIds} aiSuggestedTimelineEvents={v.aiSuggestedTimelineEvents} stopWorkEventIds={stopWorkEventIds} onOpenIncident={onOpenIncident} />
      <WitnessStatements investigationId={v.id} canEdit={canEditTimeline} witnessStatements={v.witnessStatements ?? []} aiSuggestedInterviewQuestions={v.aiSuggestedInterviewQuestions} onChanged={onChanged} />
      <RiskAssessment investigationId={v.id} canEdit={canEditTimeline} controlAssessments={v.controlAssessments ?? []} relevantWorkTypeIds={relevantWorkTypeIds} onChanged={onChanged} />
      <InvestigationFindings investigationId={v.id} canEdit={canEditTimeline} onChanged={onChanged} relevantWorkTypeIds={relevantWorkTypeIds} />

      <Section title="Framework" subtitle="Immediate and root cause, plus this investigation's sharing scope and legal-hold status." pad={16}>
        <label style={fieldLabel}>Immediate cause</label>
        {canEditTimeline ? (
          <textarea className="a-input" value={immediateCause} onChange={(e) => patchImmediateCause(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 14 }} />
        ) : (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>{v.immediateCause || '—'}</div>
        )}

        <label style={fieldLabel}>Root cause</label>
        {canEditTimeline ? (
          <textarea className="a-input" value={rootCause} onChange={(e) => patchRootCause(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 14 }} />
        ) : (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>{v.rootCause || '—'}</div>
        )}

        {(v.correctiveActions?.length ?? 0) > 0 && (
          <>
            <label style={fieldLabel}>Corrective actions</label>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkMuted, fontStyle: 'italic', marginBottom: 8 }}>
              Legacy entries, kept for reference — dissemination now happens via Work Streams below.
            </div>
            <div style={{ marginBottom: 14 }}>
              <ActionList actions={v.correctiveActions ?? []} />
            </div>
          </>
        )}

        {canEditTimeline && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, marginTop: 14, borderTop: `1px solid ${colors.ruleSoft}` }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600 }}>Cleared for sharing</div>
              <Toggle checked={!!v.clearedForSharing} onChange={setClearedForSharing} />
            </div>
            {v.clearedForSharing && (
              <div style={{ marginTop: 10 }}>
                <label style={fieldLabel}>Sharing scope</label>
                <select className="a-input" style={inputStyle} value={v.sharingScope ?? 'site'} onChange={(e) => setSharingScope(e.target.value as SharingScope)}>
                  <option value="site">Site</option>
                  <option value="region">Region</option>
                  <option value="division">Division</option>
                  <option value="organisation">Organisation</option>
                </select>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, marginTop: 14, borderTop: `1px solid ${colors.ruleSoft}` }}>
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600 }}>Legal hold</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.inkMuted, marginTop: 2, maxWidth: 300 }}>Blocks the systemic cause phase and sharing while active.</div>
              </div>
              <Toggle checked={!!v.legalHold} onChange={setLegalHold} />
            </div>
          </>
        )}
        {!canEditTimeline && (
          <div style={{ display: 'flex', gap: 16, paddingTop: 14, marginTop: 14, borderTop: `1px solid ${colors.ruleSoft}`, fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, fontWeight: 500 }}>
            <span>Cleared for sharing: <strong style={{ color: colors.ink }}>{v.clearedForSharing ? `Yes · ${v.sharingScope ?? 'site'}` : 'No'}</strong></span>
            <span>Legal hold: <strong style={{ color: colors.ink }}>{v.legalHold ? 'Yes' : 'No'}</strong></span>
          </div>
        )}
      </Section>

      {/* aiSuggestedActions now merges Findings' own recommendations
       * alongside investigation.assist's AI output — "Populate with Hiviz
       * suggestions" is the same mechanism either way, sourced from
       * whichever content exists. The button's own label still says "Hiviz
       * suggestions" even when a Finding (human-authored) is the source —
       * a known holdover from this being an incremental build, worth
       * revisiting once the Findings mechanism settles (see
       * [[project_investigation_timeline]]). */}
      <WorkStreamsSection
        sourceType="investigation" sourceId={v.id} siteNames={v.siteNames} canAdd={canEditActions}
        aiSuggestedQuestions={v.aiSuggestedInterviewQuestions?.map((q) => ({ text: q.question }))}
        aiSuggestedActions={[
          ...(v.aiSuggestedCorrectiveActions?.map((a) => ({ text: a.action })) ?? []),
          ...findings.map((f) => ({ text: f.context.recommendation! })),
        ]}
      />

      {v.fwClassifications && v.fwClassifications.length > 0 && (
        <Section title="Forge Works Map® classification" subtitle="Factors classified against the Forge Works Map®, each with a confidence score and rationale.">
          {v.fwClassifications.map((f, k) => (
            <div key={k} style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '12px 14px', marginBottom: k === v.fwClassifications!.length - 1 ? 0 : 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700 }}>{f.factor}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase' }}>{f.domain}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, color: colors.green, marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="check" size={13} color={colors.green} />{f.confidence.toFixed(2)}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontStyle: 'italic', color: colors.inkSoft, lineHeight: 1.45 }}>{f.rationale}</div>
            </div>
          ))}
        </Section>
      )}

      {v.status === 'closed' && (
        <Section title="Systemic cause phase" subtitle="Whether this investigation's findings point to a wider pattern worth raising as an Insight.">
          {v.systemicCauseInsightId ? (
            <>
              <AINote title="Bridged to the Insight pipeline">
                This investigation's findings were entered as a critical insight — visible now in the Insights workspace.
              </AINote>
              {(() => {
                const insight = INSIGHTS_BY_ID[v.systemicCauseInsightId];
                if (!insight) return null;
                const [kindLabel, kindTone] = INSIGHT_KIND_LABEL[insight.kind];
                return (
                  <Card pad={4} style={{ marginTop: 10, boxShadow: 'none' }}>
                    <AttnRow
                      label={kindLabel}
                      icon="lightbulb"
                      tone={kindTone}
                      title={insight.title}
                      meta={insight.siteNames.join(', ')}
                      last
                      onClick={() => (onOpenSystemicInsight ? onOpenSystemicInsight(insight.id) : navigate(`/insights/${insight.id}`))}
                    />
                  </Card>
                );
              })()}
            </>
          ) : v.legalHold ? (
            <Card pad={16} style={{ boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="lock" size={18} color={colors.red} />
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkSoft, fontWeight: 500 }}>Blocked while legal hold is active.</div>
            </Card>
          ) : (
            <>
              {suggestsSystemic && !systemicOpen && (
                <div style={{ marginBottom: 10, fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, fontStyle: 'italic' }}>
                  This classified against a guide/enable-domain factor — often worth escalating as a systemic finding.
                </div>
              )}
              {!systemicOpen ? (
                <Btn variant="ghost" icon="hub" onClick={() => setSystemicOpen(true)}>Flag as systemic cause</Btn>
              ) : (
                <Card pad={16}>
                  <label style={fieldLabel}>Pattern summary — what should the Insights workspace see?</label>
                  <textarea
                    className="a-input" autoFocus value={systemicSummary} onChange={(e) => setSystemicSummary(e.target.value)}
                    rows={3} style={{ ...textareaStyle, marginBottom: 10 }}
                  />
                  {systemicError && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.red, fontWeight: 600, marginBottom: 10 }}>{systemicError}</div>}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <Btn variant="ghost" size="sm" onClick={() => { setSystemicOpen(false); setSystemicError(null); }}>Cancel</Btn>
                    <Btn variant="primary" size="sm" icon="check" disabled={!systemicSummary.trim()} onClick={handleFlagSystemic}>Flag as systemic cause</Btn>
                  </div>
                </Card>
              )}
            </>
          )}
        </Section>
      )}

      <Section
        title="Source incidents"
        subtitle="The incidents this investigation was opened to explain."
        action={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700, color: colors.inkMuted }}>{srcIncidents.length}</span>}
      >
        {srcIncidents.length === 0 && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkMuted, fontWeight: 500 }}>No incidents linked yet.</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {srcIncidents.map((i) => {
          const status = INCIDENT_STATUS_DISPLAY[i.status];
          const stopWork = stopWorkIndicator(i);
          return (
            <div
              key={i.id}
              className="a-card-int"
              onClick={() => (onOpenIncident ? onOpenIncident(i.id) : navigate(`/incidents?id=${i.id}`))}
              style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10 }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="report" size={17} color={colors.inkSoft} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, lineHeight: 1.4 }}>"{i.description}"</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{i.siteName} · {i.when}</span>
                  <Badge tone={status.tone}>{status.label}</Badge>
                  {stopWork && <Badge tone={stopWork.tone} outline icon="front_hand">{stopWork.label}</Badge>}
                </div>
              </div>
              <Icon name="chevron_right" size={18} color={colors.inkMuted} style={{ marginTop: 2, flexShrink: 0 }} />
            </div>
          );
        })}
        </div>
      </Section>
    </Card>
  );
}
