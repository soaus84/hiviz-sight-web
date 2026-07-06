import { useState } from 'react';
import { colors, type Tone } from '@/tokens';
import { Card, Badge, Btn, LinkBtn, AINote, Avatar, Icon, ListRow } from '@/components';
import { OBSERVATIONS, SIGNAL_DISPLAY, energyLabel } from '@/data/observations';
import { INSIGHT_KIND_LABEL, moveToAction, addSupport, acknowledgeAndResolve, updateActionFields, resolveActionedInsight } from '@/data/insights';
import { useActiveUser } from '@/state/ActiveUser';
import type { ActionFields, Insight, InsightStatus, Observation } from '@/types';

const STATUS: Record<InsightStatus, [string, Tone]> = {
  review: ['Needs review', 'warning'],
  action: ['In action', 'info'],
  closed: ['Resolved', 'success'],
};

const sectionLabel = { fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const, color: colors.inkSoft, margin: '22px 0 10px' };
const fieldLabel = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' as const, color: colors.inkMuted, marginBottom: 5 };
const textareaStyle = { width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.4, resize: 'vertical' as const, outline: 'none' };

/** "Same site" mock stand-in for insights with no explicitly linked
 * observations yet — round-robins across the insight's sites (one from each
 * before taking a second from any) so a cross-site pattern's evidence
 * actually looks cross-site, instead of 3 examples that happen to share
 * whichever site sorts first in the data. */
function fallbackSourceObs(i: Insight): Observation[] {
  const bySite = i.siteNames.map((s) => OBSERVATIONS.filter((o) => o.siteName === s));
  const result: Observation[] = [];
  for (let round = 0; result.length < 3; round++) {
    const before = result.length;
    for (const group of bySite) {
      if (group[round]) result.push(group[round]);
      if (result.length === 3) break;
    }
    if (result.length === before) break;
  }
  return result;
}

function ActionRow({ label, needLabel, doneLabel, need, done, onNeedChange, onDoneChange, first }: {
  label: string; needLabel: string; doneLabel: string; need: string; done: string;
  onNeedChange: (v: string) => void; onDoneChange: (v: string) => void; first?: boolean;
}) {
  return (
    <div style={{ paddingTop: first ? 0 : 14, marginTop: first ? 0 : 14, borderTop: first ? undefined : `1px solid ${colors.ruleSoft}` }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <label style={fieldLabel}>{needLabel}</label>
      <textarea className="a-input" value={need} onChange={(e) => onNeedChange(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 8 }} />
      <label style={fieldLabel}>{doneLabel}</label>
      <textarea className="a-input" value={done} onChange={(e) => onDoneChange(e.target.value)} rows={2} placeholder="Not yet — fill in once done" style={textareaStyle} />
    </div>
  );
}

function ResolvedPillar({ label, need, done, first }: { label: string; need?: string; done?: string; first?: boolean }) {
  if (!need && !done) return null;
  return (
    <div style={{ paddingTop: first ? 0 : 12, marginTop: first ? 0 : 12, borderTop: first ? undefined : `1px solid ${colors.ruleSoft}` }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {need && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, marginBottom: done ? 4 : 0 }}>Needed: {need}</div>}
      {done && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.ink, fontWeight: 500 }}>Done: {done}</div>}
    </div>
  );
}

interface HeaderActionsProps {
  status: InsightStatus;
  /** Hides the button set while the inline acknowledge panel is open — it
   * has its own Resolve/Cancel pair, showing both would be two ways to do
   * the same thing at once. */
  ackOpen: boolean;
  onOpenAcknowledge: () => void;
  onProgressToAction: () => void;
  canResolve: boolean;
  onResolve: () => void;
}

/** The header's action button set — one variation per status, formalised
 * here instead of scattered inline conditionals so a new status or action
 * only means adding a branch in one place.
 * - `review`: a fork — acknowledge without acting, or progress to action.
 * - `action`: assign an owner, or resolve once there's an outcome to report.
 * - `closed`: nothing left to do. */
function HeaderActions({ status, ackOpen, onOpenAcknowledge, onProgressToAction, canResolve, onResolve }: HeaderActionsProps) {
  if (status === 'review') {
    if (ackOpen) return null;
    return (
      <>
        <LinkBtn onClick={onOpenAcknowledge}>Acknowledge & resolve</LinkBtn>
        <Btn variant="primary" size="sm" icon="arrow_forward" onClick={onProgressToAction}>Progress to action</Btn>
      </>
    );
  }
  if (status === 'action') {
    return (
      <>
        <Btn variant="ghost" size="sm" icon="person_add">Assign owner</Btn>
        <Btn variant="primary" size="sm" icon="check" disabled={!canResolve} onClick={onResolve}>Mark resolved</Btn>
      </>
    );
  }
  return null;
}

export function InsightDetail({ i, onOpenObservation, onStatusChange }: { i: Insight; onOpenObservation: (obsId: string) => void; onStatusChange?: () => void }) {
  const { user } = useActiveUser();
  const hasDetail = !!i.suggested;
  // Prefer observations explicitly linked to this insight; only a handful of
  // insights have that authored yet, so fall back to "same site" as a mock
  // stand-in for the rest rather than showing nothing.
  const linkedObs = OBSERVATIONS.filter((o) => o.linkedInsightId === i.id);
  const srcObs = linkedObs.length > 0 ? linkedObs : fallbackSourceObs(i);
  const [sl, sh] = STATUS[i.status];
  const [kindLabel, kindTone] = INSIGHT_KIND_LABEL[i.kind];
  const supporters = hasDetail ? i.endorsements! : i.supporterInitials.map((s) => ({ name: s, note: 'Backing this for action.' }));

  // Persists to the mock store on every keystroke (cheap at this scale) so
  // progress survives navigating away without a resolve — no separate save
  // step, no risk of losing a draft if a blur event doesn't fire.
  const [action, setAction] = useState<ActionFields>(i.action ?? {});
  const patchAction = (field: keyof ActionFields) => (v: string) => {
    setAction((a) => ({ ...a, [field]: v }));
    updateActionFields(i.id, { [field]: v });
  };
  const hasOutcome = !!(action.controlDone?.trim() || action.learnDone?.trim() || action.improveDone?.trim());

  const [ackOpen, setAckOpen] = useState(false);
  const [ackComment, setAckComment] = useState('');
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportNote, setSupportNote] = useState('');

  const handleProgressToAction = () => {
    moveToAction(i.id);
    onStatusChange?.();
  };
  const handleSupport = () => {
    addSupport(i.id, user.name, user.initials, supportNote.trim() || 'Backing this for action.');
    setSupportOpen(false);
    setSupportNote('');
    onStatusChange?.();
  };
  const handleAcknowledge = () => {
    if (!ackComment.trim()) return;
    acknowledgeAndResolve(i.id, ackComment.trim());
    onStatusChange?.();
  };
  const handleResolve = () => {
    resolveActionedInsight(i.id);
    onStatusChange?.();
  };

  return (
    <Card pad={24}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <Badge tone={sh}>{sl}</Badge>
        <Badge tone={kindTone} outline>{kindLabel}</Badge>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, color: colors.inkSoft }}>{i.id}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <HeaderActions
            status={i.status}
            ackOpen={ackOpen}
            onOpenAcknowledge={() => setAckOpen(true)}
            onProgressToAction={handleProgressToAction}
            canResolve={hasOutcome}
            onResolve={handleResolve}
          />
        </div>
      </div>
      <h2 style={{ fontFamily: 'var(--font-sans)', margin: 0, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2 }}>{i.title}</h2>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
        {i.siteNames.map((s, k) => <Badge key={k} tone="primary" outline icon="place">{s}</Badge>)}
      </div>

      {i.status === 'review' && ackOpen && (
        <Card pad={16} style={{ marginTop: 16 }}>
          <label style={fieldLabel}>Acknowledgement comment</label>
          <textarea
            className="a-input" autoFocus value={ackComment} onChange={(e) => setAckComment(e.target.value)}
            placeholder="Why is no action needed — false positive, accepted risk, duplicate…" rows={3}
            style={{ ...textareaStyle, marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" size="sm" onClick={() => { setAckOpen(false); setAckComment(''); }}>Cancel</Btn>
            <Btn variant="primary" size="sm" icon="check" disabled={!ackComment.trim()} onClick={handleAcknowledge}>Resolve</Btn>
          </div>
        </Card>
      )}

      {i.status === 'closed' && (
        <>
          <div style={sectionLabel}>Resolution</div>
          {i.resolutionType === 'actioned' ? (
            <>
              <AINote title="Hiviz outcome summary" style={{ marginBottom: 10 }}>{i.resolutionSummary}</AINote>
              {i.action && (
                <Card pad={16} style={{ boxShadow: 'none' }}>
                  <ResolvedPillar label="Control" need={i.action.controlNeed} done={i.action.controlDone} first />
                  <ResolvedPillar label="Learn" need={i.action.learnNeed} done={i.action.learnDone} />
                  <ResolvedPillar label="Improve" need={i.action.improveNeed} done={i.action.improveDone} />
                </Card>
              )}
            </>
          ) : (
            <Card pad={16} style={{ boxShadow: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <Icon name="chat_bubble" size={14} color={colors.inkSoft} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.9, textTransform: 'uppercase', color: colors.inkSoft }}>Acknowledged, no action taken</span>
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.55, fontWeight: 500 }}>{i.resolutionComment}</div>
            </Card>
          )}
        </>
      )}

      <div style={sectionLabel}>Pattern summary</div>
      <AINote title="AI has suggested" style={{ marginBottom: 10 }}>
        {i.suggested || i.summary}
        {i.suggestedBasis && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(26,31,0,0.15)', fontStyle: 'italic', fontWeight: 500, color: 'rgba(26,31,0,0.65)' }}>
            {i.suggestedBasis}
          </div>
        )}
      </AINote>
      {i.cause && (
        <AINote title="Likely systemic cause">
          {i.cause}
          {i.causeBasis && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(26,31,0,0.15)', fontStyle: 'italic', fontWeight: 500, color: 'rgba(26,31,0,0.65)' }}>
              {i.causeBasis}
            </div>
          )}
        </AINote>
      )}

      {i.status === 'action' && (
        <>
          <div style={{ ...sectionLabel, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span>Action</span>
            <span style={{ textTransform: 'none', fontWeight: 500, letterSpacing: 0, color: colors.inkMuted }}>Autosaves as you go</span>
          </div>
          <Card pad={16} style={{ boxShadow: 'none', marginBottom: 10 }}>
            <ActionRow
              label="Control" needLabel="What do we need to control?" doneLabel="What was controlled?"
              need={action.controlNeed ?? ''} done={action.controlDone ?? ''}
              onNeedChange={patchAction('controlNeed')} onDoneChange={patchAction('controlDone')} first
            />
            <ActionRow
              label="Learn" needLabel="What do we need to learn?" doneLabel="What did we learn?"
              need={action.learnNeed ?? ''} done={action.learnDone ?? ''}
              onNeedChange={patchAction('learnNeed')} onDoneChange={patchAction('learnDone')}
            />
            <ActionRow
              label="Improve" needLabel="What do we need to improve?" doneLabel="What did we improve?"
              need={action.improveNeed ?? ''} done={action.improveDone ?? ''}
              onNeedChange={patchAction('improveNeed')} onDoneChange={patchAction('improveDone')}
            />
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${colors.ruleSoft}`, fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.inkMuted, textAlign: 'center' }}>
              {hasOutcome ? 'Ready to resolve — use Mark resolved above.' : 'Fill in at least one outcome, then use Mark resolved above.'}
            </div>
          </Card>
        </>
      )}

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px' }}>Energy classification</div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {i.energyTypes.map((e, k) => <Badge key={k} tone={e === 'none' ? 'warning' : 'error'} outline>{energyLabel(e)}</Badge>)}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Source observations</span><span style={{ color: colors.inkMuted }}>{srcObs.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {srcObs.map((o) => {
          const s = SIGNAL_DISPLAY[o.signal_type];
          return (
            <div
              key={o.id}
              className="a-card-int"
              onClick={() => onOpenObservation(o.id)}
              style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10 }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, lineHeight: 1.4 }}>“{o.summary}”</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{o.siteName} · {o.when}</span>
                  <Badge tone={s.tone}>{s.label}</Badge>
                </div>
              </div>
              <Icon name="chevron_right" size={18} color={colors.inkMuted} style={{ marginTop: 2, flexShrink: 0 }} />
            </div>
          );
        })}
      </div>

      {hasDetail && (
        <>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px' }}>Forge Works Map® classification</div>
          {i.fwClassifications!.map((f, k) => (
            <div key={k} style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '12px 14px', marginBottom: 8 }}>
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
        </>
      )}

      <div style={sectionLabel}>Support for action</div>
      {supporters.length === 0 ? (
        <Card pad={28} style={{ textAlign: 'center' }}>
          <Icon name="handshake" size={26} color={colors.inkMuted} />
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 700, marginTop: 10 }}>No one's backed this yet</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkSoft, lineHeight: 1.5, maxWidth: 380, margin: '6px auto 0' }}>
            Backing an insight as a manager signals it's a real, recurring pattern worth prioritising — not a one-off. It's what turns a suggestion into something ops leadership acts on.
          </div>
          {i.status !== 'closed' && !supportOpen && (
            <div style={{ marginTop: 16 }}>
              <Btn variant="primary" size="sm" icon="check" onClick={() => setSupportOpen(true)}>Support for action</Btn>
            </div>
          )}
        </Card>
      ) : (
        <div style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '4px 14px' }}>
          {supporters.map((e, k) => (
            <ListRow key={k} last={k === supporters.length - 1 && !(i.status !== 'closed' && !supportOpen)} padding="12px 0">
              <Avatar name={e.name} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{e.name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, marginTop: 2, lineHeight: 1.45, fontWeight: 500 }}>{e.note}</div>
              </div>
            </ListRow>
          ))}
          {i.status !== 'closed' && !supportOpen && (
            <ListRow last padding="12px 0">
              <LinkBtn icon="add" onClick={() => setSupportOpen(true)}>Add your support</LinkBtn>
            </ListRow>
          )}
        </div>
      )}
      {i.status !== 'closed' && supportOpen && (
        <Card pad={16} style={{ marginTop: 10 }}>
          <label style={fieldLabel}>Why are you backing this for action? (optional)</label>
          <textarea
            className="a-input" autoFocus value={supportNote} onChange={(e) => setSupportNote(e.target.value)}
            placeholder="Saw the same pattern elsewhere, this needs a system fix, etc…" rows={3}
            style={{ ...textareaStyle, marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" size="sm" onClick={() => { setSupportOpen(false); setSupportNote(''); }}>Cancel</Btn>
            <Btn variant="primary" size="sm" icon="check" onClick={handleSupport}>Add support</Btn>
          </div>
        </Card>
      )}
    </Card>
  );
}
