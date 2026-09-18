import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { Card, Badge, Btn, AINote, Fact, Toggle } from '@/components';
import { AttnRow } from '@/views/shared/AttnRow';
import { useActiveUser } from '@/state/ActiveUser';
import { CRITICAL_CONTROLS_BY_ID, WORKSITE_CONTROLS_BY_ID } from '@/data/risk';
import { resolveDirectly, submitForReview, approve, returnForRevision, sentBackCount, formatWhen, BARRIER_FAILURES_BY_ID } from '@/data/barrierFailures';
import { STOP_WORK_EVENTS_BY_ID, callStopWork, dismissStopWorkWarning } from '@/data/stopWork';
import { STOP_WORK_STATUS_DISPLAY } from '@/views/incidents/incidentDisplay';
import { BARRIER_FAILURE_STATUS_DISPLAY, CONTROL_TYPE_LABEL, SEVERITY_DISPLAY } from './riskDisplay';
import { Section } from '@/views/shared/SectionHeading';
import type { BarrierFailure, BarrierFailureRound } from '@/types';

const fieldLabel = { display: 'block', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, marginBottom: 5 };
const textareaStyle = { width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.4, resize: 'vertical' as const, outline: 'none' };

// Same fixed narrative "now" the rest of the mock data uses.
const MOCK_NOW = new Date('2025-05-07T10:00:00');

function hoursSince(iso: string): number {
  return (MOCK_NOW.getTime() - new Date(iso).getTime()) / 3_600_000;
}

const ROUND_LABEL: Record<BarrierFailureRound['kind'], string> = {
  submitted: 'Submitted', approved: 'Approved', returned: 'Returned',
};

/** The append-only history rendered as a timeline — see StopWorkDrawer.tsx's
 * buildTimeline for the same pattern used on that pipeline. Makes a 3rd-round
 * item visibly distinct from a 1st-round one, which `status` alone can't. */
function buildTimeline(b: BarrierFailure) {
  return b.rounds.map((r) => ({ label: ROUND_LABEL[r.kind], by: r.by, at: r.at, note: r.note }));
}

/** A leaf in this app's linked-entity graph (see [[project_linked_entity_pattern]])
 * — its Stop Work reference card always jumps to the full page rather than
 * nesting a drawer over this one; only a hub ever nests a leaf's reference,
 * never the reverse. */
export function BarrierFailureDetail({ b, onChanged }: { b: BarrierFailure; onChanged?: () => void }) {
  const navigate = useNavigate();
  const { user } = useActiveUser();
  const status = BARRIER_FAILURE_STATUS_DISPLAY[b.status];
  const severity = SEVERITY_DISPLAY[b.severityClass];
  const rounds = sentBackCount(b);

  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolveNote, setResolveNote] = useState('');
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [sendBackOpen, setSendBackOpen] = useState(false);
  const [sendBackReason, setSendBackReason] = useState('');
  const [stopWorkIntent, setStopWorkIntent] = useState<'dismiss' | 'call' | null>(null);
  const [confirmSiteWide, setConfirmSiteWide] = useState(false);
  const [swNote, setSwNote] = useState('');
  const [siteWide, setSiteWide] = useState(false);
  // A stop-work decision replaces the BarrierFailure object in place
  // without necessarily changing b.status, so the parent's onChanged won't
  // always refresh this component's stale prop — read live, same pattern
  // as SevereIncidentReview.tsx/IncidentDetail.tsx.
  const [, forceRender] = useState(0);
  const live = BARRIER_FAILURES_BY_ID[b.id] ?? b;

  const worksiteControl = WORKSITE_CONTROLS_BY_ID[b.worksiteControlId];
  const slaHours = worksiteControl ? CRITICAL_CONTROLS_BY_ID[worksiteControl.criticalControlId]?.rectificationSlaHours : undefined;
  // Purely informational now — no action hangs off it since escalation was
  // dropped (see data/barrierFailures.ts's top-of-file note: a single
  // overdue item isn't itself a pattern worth a manual push anywhere).
  const pastSla = b.status !== 'resolved' && slaHours !== undefined && hoursSince(b.flaggedAt) > slaHours;

  // Site-side actions stay attributed to b.flaggedBy — there's no
  // switchable "site persona" in this app (see useActiveUser's own note),
  // site data is simulated, not something the current app user role-plays.
  const handleResolve = () => {
    const result = b.status === 'open' && !b.requiresApproval
      ? resolveDirectly(b.id, resolveNote, b.flaggedBy)
      : submitForReview(b.id, resolveNote, b.flaggedBy);
    setResolveError(result.error ?? null);
    if (!result.error) { setResolveOpen(false); setResolveNote(''); onChanged?.(); }
  };
  // Manager-side actions attribute to the active preview persona — the
  // exact gap the user caught (a manager submitting to themselves to
  // approve) is closed by these two always being a distinct identity from
  // whatever site name is in b.flaggedBy.
  const handleApprove = () => { approve(b.id, user.name); onChanged?.(); };
  const handleSendBack = () => {
    if (!sendBackReason.trim()) return;
    returnForRevision(b.id, sendBackReason.trim(), user.name);
    setSendBackOpen(false); setSendBackReason('');
    onChanged?.();
  };

  const stopWorkEvent = live.stopWorkEventId ? STOP_WORK_EVENTS_BY_ID[live.stopWorkEventId] : undefined;
  const needsStopWorkDecision = live.stopWorkWarranted && !live.stopWorkCalled && !live.stopWorkDismissedBy;
  const handleCallStopWork = () => {
    callStopWork('barrierFailure', b.id, user.name, siteWide, swNote.trim() || undefined);
    setStopWorkIntent(null); setSwNote(''); setSiteWide(false); setConfirmSiteWide(false);
    forceRender((v) => v + 1);
    onChanged?.();
  };
  const handleDismissStopWork = () => {
    if (!swNote.trim()) return;
    dismissStopWorkWarning('barrierFailure', b.id, user.name, swNote.trim());
    setStopWorkIntent(null); setSwNote('');
    forceRender((v) => v + 1);
    onChanged?.();
  };

  const lastReturn = [...b.rounds].reverse().find((r) => r.kind === 'returned');
  const timeline = buildTimeline(b);

  return (
    <Card pad={24}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <Badge tone={status.tone}>{status.label}</Badge>
        {rounds > 0 && <Badge tone="error" outline>Sent back ×{rounds}</Badge>}
        <Badge tone={severity.tone} outline>{severity.label}</Badge>
        <Badge tone="primary" outline>{CONTROL_TYPE_LABEL[b.controlType]}</Badge>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, color: colors.inkSoft, marginLeft: 'auto' }}>{b.id}</span>
      </div>
      <h2 style={{ fontFamily: 'var(--font-sans)', margin: 0, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2 }}>{b.controlName}</h2>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkSoft, marginTop: 10 }}>{b.hazardName}</div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
        <Badge tone="primary" outline icon="place">{b.siteName}</Badge>
        {pastSla && <Badge tone="error" outline icon="schedule">Past SLA</Badge>}
      </div>

      <Section title="What was flagged" subtitle="The original report — what was flagged, by whom, and when." pad={16}>
        <AINote title={`Reported by ${b.flaggedBy} · ${b.when}`}>{b.notes}</AINote>
      </Section>

      {needsStopWorkDecision && (
        <Card pad={16} style={{ marginTop: 16, border: `1px solid ${colors.red}`, boxShadow: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Badge tone="error" icon="front_hand">Stop work review</Badge>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft }}>This control failure was flagged as warranting a stop — nobody called one.</span>
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
                This stops all work at {b.siteName} — not just {b.controlName}. Confirm that's intended before it goes out.
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
      {b.status === 'open' && (
        <div style={{ marginTop: 16 }}>
          {!resolveOpen ? (
            <Btn variant="primary" icon="check" onClick={() => setResolveOpen(true)}>{b.requiresApproval ? 'Submit for review' : 'Resolve directly'}</Btn>
          ) : (
            <Card pad={16}>
              <label style={fieldLabel}>{b.requiresApproval ? 'What was done, pending sign-off' : 'Resolution note'}</label>
              <textarea
                className="a-input" autoFocus value={resolveNote} onChange={(e) => setResolveNote(e.target.value)}
                placeholder="What was fixed and how…" rows={3}
                style={{ ...textareaStyle, marginBottom: 10 }}
              />
              {resolveError && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.red, fontWeight: 600, marginBottom: 10 }}>{resolveError}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Btn variant="ghost" size="sm" onClick={() => { setResolveOpen(false); setResolveError(null); }}>Cancel</Btn>
                <Btn variant="primary" size="sm" icon="check" disabled={!resolveNote.trim()} onClick={handleResolve}>{b.requiresApproval ? 'Submit for review' : 'Resolve directly'}</Btn>
              </div>
            </Card>
          )}
        </div>
      )}

      {b.status === 'review' && (
        <>
          <Section title="Submitted for review" subtitle="What the site says was done, awaiting your approval." pad={16}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.55 }}>{b.resolutionNote}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, marginTop: 8 }}>— {b.resolvedBy}</div>
          </Section>
          {!sendBackOpen ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Btn variant="ghost" onClick={() => setSendBackOpen(true)}>Send back</Btn>
              <Btn variant="primary" icon="check" onClick={handleApprove}>Approve</Btn>
            </div>
          ) : (
            <Card pad={16} style={{ marginTop: 12 }}>
              <label style={fieldLabel}>Why does this need more work?</label>
              <textarea
                className="a-input" autoFocus value={sendBackReason} onChange={(e) => setSendBackReason(e.target.value)}
                placeholder="Give a specific direction for the next attempt…" rows={3} style={{ ...textareaStyle, marginBottom: 10 }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Btn variant="ghost" size="sm" onClick={() => { setSendBackOpen(false); setSendBackReason(''); }}>Cancel</Btn>
                <Btn variant="primary" size="sm" icon="arrow_back" disabled={!sendBackReason.trim()} onClick={handleSendBack}>Send back</Btn>
              </div>
            </Card>
          )}
        </>
      )}

      {b.status === 'returned' && (
        <>
          <Section title="Sent back to you" subtitle="Why this was returned — what needs to change before resubmitting." pad={16}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.55 }}>{lastReturn?.note}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, marginTop: 8 }}>— {lastReturn?.by}</div>
          </Section>
          <div style={{ marginTop: 16 }}>
            {!resolveOpen ? (
              <Btn variant="primary" icon="check" onClick={() => setResolveOpen(true)}>Confirm and resubmit</Btn>
            ) : (
              <Card pad={16}>
                <label style={fieldLabel}>Confirm what's been done</label>
                <textarea
                  className="a-input" autoFocus value={resolveNote} onChange={(e) => setResolveNote(e.target.value)}
                  placeholder="Confirm you've actioned the direction above, with evidence if you have it…" rows={2}
                  style={{ ...textareaStyle, marginBottom: 10 }}
                />
                {resolveError && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.red, fontWeight: 600, marginBottom: 10 }}>{resolveError}</div>}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Btn variant="ghost" size="sm" onClick={() => { setResolveOpen(false); setResolveError(null); }}>Cancel</Btn>
                  <Btn variant="primary" size="sm" icon="check" disabled={!resolveNote.trim()} onClick={handleResolve}>Resubmit for review</Btn>
                </div>
              </Card>
            )}
          </div>
        </>
      )}

      {b.status === 'resolved' && (
        <Section title="Resolution" subtitle="What was done to close this out." pad={16}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.55 }}>{b.resolutionNote}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, marginTop: 8 }}>— {b.resolvedBy}</div>
        </Section>
      )}

      {timeline.length > 0 && (
        <Section title="Story" subtitle="This barrier failure's review history, in order." pad={4}>
          {timeline.map((t, i) => (
            <div key={i} style={{ padding: '10px 12px', borderTop: i === 0 ? undefined : `1px solid ${colors.ruleSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700 }}>{t.label} · {t.by}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, whiteSpace: 'nowrap' }}>{formatWhen(t.at)}</span>
              </div>
              {t.note && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, lineHeight: 1.5, marginTop: 4 }}>{t.note}</div>}
            </div>
          ))}
        </Section>
      )}

      <Section title="Detail" subtitle="Site, control type, and the hazard this control failure exposed.">
        <Fact k="Flagged by" v={b.flaggedBy} />
        <Fact k="Site" v={b.siteName} />
        <Fact k="When" v={b.when} />
        <Fact k="Control type" v={CONTROL_TYPE_LABEL[b.controlType]} />
        <Fact k="Hazard" v={b.hazardName} last />
      </Section>

      {stopWorkEvent && (
        <Section title="Stop work" subtitle="This control failure's live stop-work status." pad={4}>
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
    </Card>
  );
}
