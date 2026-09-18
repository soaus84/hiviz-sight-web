import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { IconBtn, Badge, AINote, Card, Btn, Fact, Avatar, Icon, Toggle } from '@/components';
import { AttnRow } from '@/views/shared/AttnRow';
import { energyLabel } from '@/data/observations';
import { acknowledgeIncident, progressToInvestigation, INCIDENTS_BY_ID } from '@/data/incidents';
import { INVESTIGATIONS_BY_ID } from '@/data/investigations';
import { useActiveUser } from '@/state/ActiveUser';
import { USERS } from '@/data/users';
import { STOP_WORK_EVENTS_BY_ID, callStopWork, dismissStopWorkWarning } from '@/data/stopWork';
import { INCIDENT_STATUS_DISPLAY, INCIDENT_TYPE_LABEL, SEVERITY_DISPLAY, STOP_WORK_STATUS_DISPLAY, BARRIER_ASSESSMENT_DISPLAY } from './incidentDisplay';
import { ClassificationCard, type ClassificationRow } from '@/views/shared/ClassificationCard';
import { Section } from '@/views/shared/SectionHeading';
import type { Incident } from '@/types';

const fieldLabel = { display: 'block', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, marginBottom: 5 };
const textareaStyle = { width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.4, resize: 'vertical' as const, outline: 'none' };

/** Same shell as SevereIncidentReview's own InvestigatorMenu (duplicated
 * locally per this app's convention — see PersonMenu's own doc comment in
 * InvestigationDetail.tsx) — this drawer variant reaches the same 'severe'
 * -> 'linked' transition SevereIncidentReview.tsx does, so it needs the same
 * investigator-assignment gate, not a narrower one. */
function InvestigatorMenu({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (name: string) => void }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
      <div className="a-pop" style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, width: 230, background: colors.panel, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-popover)', zIndex: 70, overflow: 'hidden' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.inkMuted, padding: '10px 14px 6px' }}>
          Assign investigator
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

/** A leaf in this app's linked-entity graph (see [[project_linked_entity_pattern]])
 * — its own inline stop-work fork below is native content, not a link, but
 * its Stop Work/Investigation *reference cards* always jump to the full
 * page rather than nesting a drawer over this one. Only a hub (Investigation,
 * Insight, StopWork) ever nests a leaf's reference in place — never the
 * reverse, which is what kept this loop-safe without conditional wiring. */
export function IncidentDetail({ i, onClose, onChanged }: { i: Incident; onClose: () => void; onChanged?: () => void }) {
  const navigate = useNavigate();
  const { user } = useActiveUser();
  const status = INCIDENT_STATUS_DISPLAY[i.status];
  const severity = SEVERITY_DISPLAY[i.severityClass];
  // Richer, confidence-scored classification (2026-09-15) — only some
  // incidents have this (see AiClassification's own doc comment,
  // types/observation.ts); most just show the bare Energy fact below.
  const classificationRows: ClassificationRow[] = [];
  if (i.energyClassification) classificationRows.push({ label: 'Energy', valueLabel: energyLabel(i.energyClassification.value), tone: i.energyClassification.value === 'none' ? 'warning' : 'error', confidence: i.energyClassification.confidence, rationale: i.energyClassification.rationale });
  if (i.barrierClassification) classificationRows.push({ label: 'Barrier', valueLabel: BARRIER_ASSESSMENT_DISPLAY[i.barrierClassification.value].label, tone: BARRIER_ASSESSMENT_DISPLAY[i.barrierClassification.value].tone, confidence: i.barrierClassification.confidence, rationale: i.barrierClassification.rationale });
  const hasRichClassification = classificationRows.length > 0 || !!i.keyHazard || !!i.safetyPracticeIds?.length;
  const [ackOpen, setAckOpen] = useState(false);
  const [ackComment, setAckComment] = useState('');
  const [investigatorMenuOpen, setInvestigatorMenuOpen] = useState(false);
  const [investigatorName, setInvestigatorName] = useState<string | undefined>(undefined);
  const [actionError, setActionError] = useState<string | null>(null);
  const [stopWorkIntent, setStopWorkIntent] = useState<'dismiss' | 'call' | null>(null);
  const [confirmSiteWide, setConfirmSiteWide] = useState(false);
  const [swNote, setSwNote] = useState('');
  const [siteWide, setSiteWide] = useState(false);
  // Same reasoning as SevereIncidentReview.tsx: a stop-work decision
  // replaces the Incident object in place without touching i.status, so
  // onChanged alone won't refresh this component's stale prop — read live.
  const [, forceRender] = useState(0);
  const live = INCIDENTS_BY_ID[i.id] ?? i;

  const handleAcknowledge = () => {
    if (!ackComment.trim()) return;
    acknowledgeIncident(i.id, ackComment.trim());
    onChanged?.();
  };
  const handleProgress = () => {
    const result = progressToInvestigation(i.id, investigatorName ?? '');
    setActionError(result.error ?? null);
    if (!result.error) onChanged?.();
  };

  const stopWorkEvent = live.stopWorkEventId ? STOP_WORK_EVENTS_BY_ID[live.stopWorkEventId] : undefined;
  const needsStopWorkDecision = live.stopWorkWarranted && !live.stopWorkCalled && !live.stopWorkDismissedBy;
  const handleCallStopWork = () => {
    callStopWork('incident', i.id, user.name, siteWide, swNote.trim() || undefined);
    setStopWorkIntent(null); setSwNote(''); setSiteWide(false); setConfirmSiteWide(false);
    forceRender((v) => v + 1);
    onChanged?.();
  };
  const handleDismissStopWork = () => {
    if (!swNote.trim()) return;
    dismissStopWorkWarning('incident', i.id, user.name, swNote.trim());
    setStopWorkIntent(null); setSwNote('');
    forceRender((v) => v + 1);
    onChanged?.();
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <Badge tone={status.tone}>{status.label}</Badge>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: colors.inkSoft, flex: 1 }}>{i.id}</span>
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 12 }}>
          <Badge tone="primary" outline>{INCIDENT_TYPE_LABEL[i.incidentType]}</Badge>
          <Badge tone={severity.tone} outline>{severity.label}</Badge>
          {i.notifiableFlag && <Badge tone="error" outline icon="campaign">Notifiable</Badge>}
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.3 }}>{i.description}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkSoft, marginTop: 8, fontWeight: 500 }}>{i.siteName} · {i.when}</div>

        <Section title="Detail" subtitle="Reporter, site, work type, and the facts recorded at the time.">
          <Fact k="Reported by" v={i.reporterName} />
          <Fact k="Site" v={i.siteName} />
          <Fact k="When" v={i.when} />
          <Fact k="Work type" v={i.workType} />
          <Fact k="Energy" v={energyLabel(i.energyType)} />
          <Fact k="Scene secured" v={i.sceneSecured === null ? 'Unknown' : i.sceneSecured ? 'Yes' : 'No'} />
          <Fact k="People involved" v={i.peopleInvolvedCount} last={i.status !== 'acknowledged'} />
          {i.status === 'acknowledged' && <Fact k="Status" v={status.label} last />}
        </Section>

        {hasRichClassification && (
          <Section title="Classification" subtitle="Energy and barrier classification for this incident, with confidence and rationale.">
            <ClassificationCard rows={classificationRows} keyHazard={i.keyHazard} safetyPracticeIds={i.safetyPracticeIds} />
          </Section>
        )}

        {needsStopWorkDecision && (
          <Card pad={16} style={{ marginTop: 16, border: `1px solid ${colors.red}`, boxShadow: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Badge tone="error" icon="front_hand">Stop work review</Badge>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft }}>Hiviz flagged this as warranting a stop — nobody called one.</span>
            </div>
            {live.stopWorkWarrantedRationale && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>{live.stopWorkWarrantedRationale}</div>}
            {stopWorkIntent === null && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="ghost" size="sm" onClick={() => setStopWorkIntent('dismiss')}>Dismiss</Btn>
                <Btn variant="danger" size="sm" icon="front_hand" onClick={() => setStopWorkIntent('call')}>Request stop work</Btn>
              </div>
            )}
            {stopWorkIntent === 'dismiss' && (
              <>
                <label style={fieldLabel}>Why doesn't this warrant a stop?</label>
                <textarea className="a-input" autoFocus value={swNote} onChange={(e) => setSwNote(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 12 }} placeholder="Isolated fault, already contained…" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="ghost" size="sm" onClick={() => { setStopWorkIntent(null); setSwNote(''); }}>Cancel</Btn>
                  <Btn variant="primary" size="sm" disabled={!swNote.trim()} onClick={handleDismissStopWork}>Dismiss</Btn>
                </div>
              </>
            )}
            {stopWorkIntent === 'call' && !confirmSiteWide && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600 }}>Site-wide stop</span>
                  <Toggle checked={siteWide} onChange={setSiteWide} />
                </div>
                <label style={fieldLabel}>Instruction (optional)</label>
                <textarea className="a-input" autoFocus value={swNote} onChange={(e) => setSwNote(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 12 }} placeholder="Anything site needs to know before stopping…" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="ghost" size="sm" onClick={() => { setStopWorkIntent(null); setSwNote(''); setSiteWide(false); }}>Cancel</Btn>
                  <Btn variant="danger" size="sm" icon="front_hand" onClick={() => (siteWide ? setConfirmSiteWide(true) : handleCallStopWork())}>
                    {siteWide ? 'Request stop work — site-wide' : 'Request stop work'}
                  </Btn>
                </div>
              </>
            )}
            {stopWorkIntent === 'call' && confirmSiteWide && (
              <>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
                  This stops all work at {i.siteName} — not just {i.workType}. Confirm that's intended before it goes out.
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="ghost" size="sm" onClick={() => setConfirmSiteWide(false)}>Back</Btn>
                  <Btn variant="danger" size="sm" icon="front_hand" onClick={handleCallStopWork}>Confirm site-wide stop</Btn>
                </div>
              </>
            )}
          </Card>
        )}
        {live.stopWorkDismissedBy && !stopWorkEvent && (
          <Card pad={16} style={{ marginTop: 16, boxShadow: 'none' }}>
            <Badge tone="primary" outline icon="front_hand">Stop work dismissed</Badge>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, marginTop: 8 }}>{live.stopWorkDismissedNote}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, marginTop: 8 }}>— {live.stopWorkDismissedBy}</div>
          </Card>
        )}
        {i.status === 'severe' && (
          <div style={{ position: 'relative', marginTop: 16, background: colors.fill, borderRadius: 'var(--radius-lg)', padding: '10px 12px' }}>
            <button
              onClick={() => setInvestigatorMenuOpen((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4 }}>Investigator</span>
              {investigatorName ? <Avatar name={investigatorName} size={26} /> : (
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: colors.rule, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="person" size={14} color={colors.inkMuted} />
                </div>
              )}
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 500, color: investigatorName ? colors.ink : colors.inkMuted }}>{investigatorName || 'Unassigned'}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, color: colors.ink, textDecoration: 'underline', textTransform: 'uppercase' }}>{investigatorName ? 'Reassign' : 'Assign'}</span>
            </button>
            <InvestigatorMenu open={investigatorMenuOpen} onClose={() => setInvestigatorMenuOpen(false)} onSelect={(name) => { setInvestigatorName(name); setInvestigatorMenuOpen(false); }} />
          </div>
        )}
        {actionError && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.red, fontWeight: 600, marginTop: 8 }}>{actionError}</div>}
        {i.status === 'severe' && !ackOpen && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <Btn variant="ghost" full onClick={() => setAckOpen(true)}>Acknowledge</Btn>
            <Btn variant="primary" full icon="arrow_forward" onClick={handleProgress}>Progress to investigation</Btn>
          </div>
        )}
        {i.status === 'severe' && ackOpen && (
          <Card pad={16} style={{ marginTop: 16 }}>
            <label style={fieldLabel}>Acknowledgement reason</label>
            <textarea
              className="a-input" autoFocus value={ackComment} onChange={(e) => setAckComment(e.target.value)}
              placeholder="Why no investigation is needed — isolated fault, already contained…" rows={3}
              style={{ ...textareaStyle, marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" size="sm" onClick={() => { setAckOpen(false); setAckComment(''); }}>Cancel</Btn>
              <Btn variant="primary" size="sm" icon="check" disabled={!ackComment.trim()} onClick={handleAcknowledge}>Acknowledge</Btn>
            </div>
          </Card>
        )}
        {i.status === 'acknowledged' && i.acknowledgeComment && (
          <div style={{ marginTop: 16 }}>
            <AINote title="Reviewer's acknowledgement">{i.acknowledgeComment}</AINote>
          </div>
        )}

        {stopWorkEvent && (
          <Section title="Stop work" subtitle="This incident's live stop-work status." pad={4}>
            <AttnRow
              label={STOP_WORK_STATUS_DISPLAY[stopWorkEvent.status].label}
              icon="front_hand"
              tone={STOP_WORK_STATUS_DISPLAY[stopWorkEvent.status].tone}
              title={stopWorkEvent.workType}
              meta={`${stopWorkEvent.siteName}${stopWorkEvent.siteWide ? ' · Site-wide' : ''}`}
              last external
              onClick={() => navigate(`/incidents/stop-work?id=${stopWorkEvent.id}`)}
            />
          </Section>
        )}

        {i.status === 'linked' && i.linkedInvestigationId && (() => {
          const investigation = INVESTIGATIONS_BY_ID[i.linkedInvestigationId];
          if (!investigation) return null;
          return (
            <Section title="Investigation" subtitle="The investigation this incident has been linked to." pad={4}>
              <AttnRow
                label={investigation.status === 'closed' ? 'Closed' : 'Investigating'}
                icon="search"
                tone={SEVERITY_DISPLAY[investigation.severityClass].tone}
                title={investigation.title}
                meta={investigation.siteNames.join(', ')}
                last external
                onClick={() => navigate(`/investigations/${investigation.id}`)}
              />
            </Section>
          );
        })()}
      </div>
    </>
  );
}
