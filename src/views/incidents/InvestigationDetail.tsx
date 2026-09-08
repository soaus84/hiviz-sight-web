import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, type Tone } from '@/tokens';
import { Card, Badge, Btn, AINote, Avatar, Icon, Toggle } from '@/components';
import { AttnRow } from '@/views/shared/AttnRow';
import { INCIDENTS } from '@/data/incidents';
import { energyLabel } from '@/data/observations';
import { assignInvestigator, updateFrameworkFields, closeInvestigation, flagSystemicCause } from '@/data/investigations';
import { USERS } from '@/data/users';
import { STOP_WORK_EVENTS_BY_ID } from '@/data/stopWork';
import { INSIGHTS_BY_ID, INSIGHT_KIND_LABEL } from '@/data/insights';
import { INCIDENT_STATUS_DISPLAY, SEVERITY_DISPLAY, STOP_WORK_STATUS_DISPLAY } from './incidentDisplay';
import type { ContributingFactor, CorrectiveAction, Incident, Investigation, InvestigationStatus, SharingScope } from '@/types';

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

const STATUS: Record<InvestigationStatus, [string, Tone]> = {
  open: ['Investigating', 'info'],
  closed: ['Closed', 'success'],
};

const sectionLabel = { fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const, color: colors.inkSoft, margin: '22px 0 10px' };
const fieldLabel = { display: 'block', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, marginBottom: 5 };
const textareaStyle = { width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.4, resize: 'vertical' as const, outline: 'none' };
const inputStyle = { padding: '7px 9px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 12.5, outline: 'none' };

/** Popover listing real Users to assign as investigator — same shell as
 * InsightDetail's AssigneeMenu. */
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

function FactorList({ factors, onAdd, editable }: { factors: ContributingFactor[]; onAdd: (f: ContributingFactor) => void; editable: boolean }) {
  const [factor, setFactor] = useState('');
  const [rationale, setRationale] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {factors.map((f, k) => (
        <div key={k} style={{ border: `1px solid ${colors.ruleSoft}`, borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700 }}>{f.factor}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontStyle: 'italic', color: colors.inkSoft, marginTop: 3 }}>{f.rationale}</div>
        </div>
      ))}
      {factors.length === 0 && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkMuted, fontWeight: 500 }}>None recorded yet.</div>}
      {editable && (
        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="Contributing factor" value={factor} onChange={(e) => setFactor(e.target.value)} />
          <input style={{ ...inputStyle, flex: 1 }} placeholder="Rationale" value={rationale} onChange={(e) => setRationale(e.target.value)} />
          <Btn variant="ghost" size="sm" icon="add" disabled={!factor.trim() || !rationale.trim()} onClick={() => { onAdd({ factor: factor.trim(), rationale: rationale.trim() }); setFactor(''); setRationale(''); }}>Add</Btn>
        </div>
      )}
    </div>
  );
}

function ActionList({ actions, onAdd, onToggleDone, editable }: { actions: CorrectiveAction[]; onAdd: (a: CorrectiveAction) => void; onToggleDone: (idx: number) => void; editable: boolean }) {
  const [action, setAction] = useState('');
  const [rationale, setRationale] = useState('');
  const [owner, setOwner] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {actions.map((a, k) => (
        <div key={k} style={{ border: `1px solid ${colors.ruleSoft}`, borderRadius: 'var(--radius-md)', padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          {editable && (
            <button onClick={() => onToggleDone(k)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginTop: 1 }}>
              <Icon name={a.done ? 'check_box' : 'check_box_outline_blank'} size={18} color={a.done ? colors.green : colors.inkMuted} />
            </button>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, textDecoration: a.done ? 'line-through' : undefined, color: a.done ? colors.inkMuted : colors.ink }}>{a.action}</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontStyle: 'italic', color: colors.inkSoft, marginTop: 3 }}>{a.rationale}</div>
            {(a.owner || a.dueDate) && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, marginTop: 5 }}>{[a.owner, a.dueDate].filter(Boolean).join(' · ')}</div>
            )}
          </div>
        </div>
      ))}
      {actions.length === 0 && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkMuted, fontWeight: 500 }}>None recorded yet — at least one is required to close.</div>}
      {editable && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...inputStyle, flex: 2 }} placeholder="Corrective action" value={action} onChange={(e) => setAction(e.target.value)} />
            <input style={{ ...inputStyle, flex: 1 }} placeholder="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="Rationale" value={rationale} onChange={(e) => setRationale(e.target.value)} />
            <Btn variant="ghost" size="sm" icon="add" disabled={!action.trim() || !rationale.trim()} onClick={() => { onAdd({ action: action.trim(), rationale: rationale.trim(), owner: owner.trim() || undefined }); setAction(''); setRationale(''); setOwner(''); }}>Add</Btn>
          </div>
        </div>
      )}
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
  const [sl, sh] = STATUS[v.status];
  const severity = SEVERITY_DISPLAY[v.severityClass];
  const srcIncidents = INCIDENTS.filter((i) => i.linkedInvestigationId === v.id);

  const [investigatorMenuOpen, setInvestigatorMenuOpen] = useState(false);
  const [immediateCause, setImmediateCause] = useState(v.immediateCause ?? '');
  const [rootCause, setRootCause] = useState(v.rootCause ?? '');
  const [closeError, setCloseError] = useState<string | null>(null);
  const [systemicOpen, setSystemicOpen] = useState(false);
  const [systemicSummary, setSystemicSummary] = useState(v.rootCause ?? '');
  const [systemicError, setSystemicError] = useState<string | null>(null);

  const editable = v.status === 'open';
  const suggestsSystemic = v.fwClassifications?.some((f) => f.domain === 'guide' || f.domain === 'enable') ?? false;

  const handleAssign = (name: string) => {
    assignInvestigator(v.id, name);
    setInvestigatorMenuOpen(false);
    onChanged?.();
  };
  const patchImmediateCause = (val: string) => { setImmediateCause(val); updateFrameworkFields(v.id, { immediateCause: val }); };
  const patchRootCause = (val: string) => { setRootCause(val); updateFrameworkFields(v.id, { rootCause: val }); };
  const addFactor = (f: ContributingFactor) => { updateFrameworkFields(v.id, { contributingFactors: [...(v.contributingFactors ?? []), f] }); onChanged?.(); };
  const addAction = (a: CorrectiveAction) => { updateFrameworkFields(v.id, { correctiveActions: [...(v.correctiveActions ?? []), a] }); onChanged?.(); };
  const toggleActionDone = (idx: number) => {
    const next = (v.correctiveActions ?? []).map((a, k) => (k === idx ? { ...a, done: !a.done } : a));
    updateFrameworkFields(v.id, { correctiveActions: next });
    onChanged?.();
  };
  const setClearedForSharing = (checked: boolean) => { updateFrameworkFields(v.id, { clearedForSharing: checked }); onChanged?.(); };
  const setSharingScope = (scope: SharingScope) => { updateFrameworkFields(v.id, { sharingScope: scope }); onChanged?.(); };
  const setLegalHold = (checked: boolean) => { updateFrameworkFields(v.id, { legalHold: checked }); onChanged?.(); };

  const handleClose = () => {
    const result = closeInvestigation(v.id);
    setCloseError(result.error ?? null);
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
        <Badge tone={sh}>{sl}</Badge>
        <Badge tone={severity.tone} outline>{severity.label}</Badge>
        {v.legalHold && <Badge tone="error" outline icon="lock">Legal hold</Badge>}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, color: colors.inkSoft, marginLeft: 'auto' }}>{v.id}</span>
      </div>
      <h2 style={{ fontFamily: 'var(--font-sans)', margin: 0, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2 }}>{v.title}</h2>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: colors.inkSoft, marginTop: 10, lineHeight: 1.5 }}>{v.summary}</div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
        {v.siteNames.map((s, k) => <Badge key={k} tone="primary" outline icon="place">{s}</Badge>)}
      </div>

      <div style={{ position: 'relative', marginTop: 14, background: colors.fill, borderRadius: 'var(--radius-lg)', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => setInvestigatorMenuOpen((val) => !val)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          {v.investigatorName ? <Avatar name={v.investigatorName} size={26} /> : (
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: colors.rule, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="person" size={14} color={colors.inkMuted} />
            </div>
          )}
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 500, color: v.investigatorName ? colors.ink : colors.inkMuted }}>{v.investigatorName || 'Unassigned'}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, color: colors.ink, textDecoration: 'underline', textTransform: 'uppercase' }}>{v.investigatorName ? 'Reassign' : 'Assign'}</span>
        </button>
        <InvestigatorMenu open={investigatorMenuOpen} onClose={() => setInvestigatorMenuOpen(false)} onSelect={handleAssign} />
        {v.status === 'open' && (
          <div>
            <Btn variant="primary" size="sm" icon="check" onClick={handleClose}>Close investigation</Btn>
          </div>
        )}
      </div>
      {closeError && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.red, fontWeight: 600, marginTop: 8 }}>{closeError}</div>}

      <div style={sectionLabel}>Framework</div>
      <Card pad={16} style={{ boxShadow: 'none' }}>
        <label style={fieldLabel}>Immediate cause</label>
        {editable ? (
          <textarea className="a-input" value={immediateCause} onChange={(e) => patchImmediateCause(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 14 }} />
        ) : (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>{v.immediateCause || '—'}</div>
        )}

        <label style={fieldLabel}>Contributing factors</label>
        <div style={{ marginBottom: 14 }}>
          <FactorList factors={v.contributingFactors ?? []} onAdd={addFactor} editable={editable} />
        </div>

        <label style={fieldLabel}>Root cause</label>
        {editable ? (
          <textarea className="a-input" value={rootCause} onChange={(e) => patchRootCause(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 14 }} />
        ) : (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>{v.rootCause || '—'}</div>
        )}

        <label style={fieldLabel}>Corrective actions</label>
        <div style={{ marginBottom: editable ? 14 : 0 }}>
          <ActionList actions={v.correctiveActions ?? []} onAdd={addAction} onToggleDone={toggleActionDone} editable={editable} />
        </div>

        {editable && (
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
        {!editable && (
          <div style={{ display: 'flex', gap: 16, paddingTop: 14, marginTop: 14, borderTop: `1px solid ${colors.ruleSoft}`, fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, fontWeight: 500 }}>
            <span>Cleared for sharing: <strong style={{ color: colors.ink }}>{v.clearedForSharing ? `Yes · ${v.sharingScope ?? 'site'}` : 'No'}</strong></span>
            <span>Legal hold: <strong style={{ color: colors.ink }}>{v.legalHold ? 'Yes' : 'No'}</strong></span>
          </div>
        )}
      </Card>

      {v.fwClassifications && v.fwClassifications.length > 0 && (
        <>
          <div style={sectionLabel}>Forge Works Map® classification</div>
          {v.fwClassifications.map((f, k) => (
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

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px' }}>Energy classification</div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {v.energyTypes.map((e, k) => <Badge key={k} tone={e === 'none' ? 'warning' : 'error'} outline>{energyLabel(e)}</Badge>)}
      </div>

      {v.status === 'closed' && (
        <>
          <div style={sectionLabel}>Systemic cause phase</div>
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
        </>
      )}

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Source incidents</span><span style={{ color: colors.inkMuted }}>{srcIncidents.length}</span>
      </div>
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
    </Card>
  );
}
