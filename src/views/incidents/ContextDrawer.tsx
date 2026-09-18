import { useState } from 'react';
import { colors } from '@/tokens';
import { IconBtn, Btn, Badge, Icon, ListRow, Pills, Toggle } from '@/components';
import { addTimelineContext, updateTimelineContext, removeTimelineContext } from '@/data/timeline';
import { TIMELINE_CONTEXT_DISPLAY, contextKindUsesControl, allowedControlTypesFor } from '@/views/shared/timelineDisplay';
import { FW_FACTOR_DISPLAY } from '@/views/shared/fwFactorDisplay';
import { ControlPicker } from './ControlPicker';
import { FwFactorPicker } from './FwFactorPicker';
import type { TimelineContext, TimelineContextKind, ControlRecommendationType, FwFactor } from '@/types';

/** Coarse bands rather than a raw decimal input — this is the investigator's
 * own judgment call, not an AI-computed score, so "how sure am I" reads more
 * naturally as Low/Medium/High than typing "0.65". Stored as the same
 * decimal every AI-generated confidence value in this app already uses
 * (ClassificationCard, FwClassification) so it renders identically once
 * saved — see TimelineContext.confidence's own doc comment. */
const CONFIDENCE_BANDS: { value: number; label: string }[] = [
  { value: 0.3, label: 'Low' },
  { value: 0.6, label: 'Medium' },
  { value: 0.9, label: 'High' },
];

// Smaller and muted relative to the field's own value, rather than the same
// size/weight as the content below it — several of these labels are literal
// questions ("What influenced the drift...?"), so unlike FindingRow's own
// compact eyebrow labels (short noun phrases, safe to go mono/uppercase)
// this stays sentence case, just quieter — see [[project_investigation_timeline]]'s
// 2026-09-15 hierarchy audit.
const fieldLabel = { display: 'block', fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600, color: colors.inkSoft, marginBottom: 5 };
const textareaStyle = { width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.4, resize: 'vertical' as const, outline: 'none' };
const readOnlyText = { fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, marginBottom: 14 };

const KINDS = Object.keys(TIMELINE_CONTEXT_DISPLAY) as TimelineContextKind[];

type Step = 'kind' | 'form';

/** Add/edit surface for one TimelineContext tag — opened directly from the
 * event card on the timeline (InvestigationTimeline.tsx's EventRow). Two
 * steps, mirroring Communities' NewPostDrawer picker-then-form pattern (a
 * `ListRow`-per-option picker, a header that swaps to a back arrow + the
 * chosen kind once past it, never both shown at once) — "making the
 * decision on which to select more helpful" was the explicit ask, hence
 * each kind gets a real one-line description in the picker, not just an
 * icon and a word. Kind is fixed once created (same as a Work Stream's own
 * kind) — editing an existing tag always starts on the form step directly,
 * there's nothing to go "back" to. See [[project_investigation_timeline]]'s
 * 2026-09-15 redesign. */
export function ContextDrawer({ eventId, context, relevantWorkTypeIds, canEdit, onClose, onChanged }: {
  eventId: string;
  context: TimelineContext | null;
  relevantWorkTypeIds: string[];
  canEdit: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const isNew = !context;
  const [step, setStep] = useState<Step>(isNew ? 'kind' : 'form');
  const [kind, setKind] = useState<TimelineContextKind | null>(context?.kind ?? null);
  const [controlId, setControlId] = useState(context?.controlId ?? '');
  const [controlRecommendationType, setControlRecommendationType] = useState<ControlRecommendationType>(context?.controlRecommendationType ?? 'improve_control');
  const [newControlName, setNewControlName] = useState(!context?.controlId ? (context?.controlName ?? '') : '');
  const [expectedBehavior, setExpectedBehavior] = useState(context?.expectedBehavior ?? '');
  const [influence, setInfluence] = useState(context?.influence ?? '');
  const [fwFactor, setFwFactor] = useState<string>(context?.fwFactor ?? '');
  const [note, setNote] = useState(context?.note ?? '');
  const [contribution, setContribution] = useState(context?.contribution ?? '');
  const [origin, setOrigin] = useState(context?.origin ?? '');
  const [confidence, setConfidence] = useState<number | undefined>(context?.confidence);
  const [leadsToInsight, setLeadsToInsight] = useState(context?.leadsToInsight ?? false);
  const [recommendation, setRecommendation] = useState(context?.recommendation ?? '');

  const isNewControl = kind === 'failure' && controlRecommendationType === 'new_control';
  const needsControl = kind ? contextKindUsesControl(kind) : false;
  const needsControlSelection = needsControl && !isNewControl;
  const needsFwFactor = kind === 'systemic';
  const canSave = !!kind
    && (!needsControlSelection || !!controlId)
    && (!isNewControl || !!newControlName.trim())
    && (!needsFwFactor || !!fwFactor);

  const handlePick = (k: TimelineContextKind) => {
    setKind(k);
    setStep('form');
  };
  const handleSave = () => {
    if (!kind) return;
    const fields = {
      controlId: needsControlSelection ? (controlId || undefined) : undefined,
      controlName: isNewControl ? (newControlName.trim() || undefined) : undefined,
      controlRecommendationType: kind === 'failure' ? controlRecommendationType : undefined,
      expectedBehavior: expectedBehavior.trim() || undefined,
      influence: influence.trim() || undefined,
      fwFactor: (kind === 'systemic' ? (fwFactor || undefined) : undefined) as FwFactor | undefined,
      note: note.trim() || undefined,
      contribution: kind === 'systemic' ? (contribution.trim() || undefined) : undefined,
      origin: kind === 'systemic' ? (origin.trim() || undefined) : undefined,
      confidence: kind === 'systemic' ? confidence : undefined,
      leadsToInsight: kind === 'systemic' ? leadsToInsight : undefined,
      recommendation: recommendation.trim() || undefined,
    };
    if (isNew) addTimelineContext(eventId, kind, fields);
    else updateTimelineContext(eventId, context.id, fields);
    onChanged();
    onClose();
  };
  const handleDelete = () => {
    if (!context) return;
    removeTimelineContext(eventId, context.id);
    onChanged();
    onClose();
  };

  const info = kind ? TIMELINE_CONTEXT_DISPLAY[kind] : null;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        {step === 'form' && isNew && <IconBtn name="arrow_back" onClick={() => setStep('kind')} />}
        {step === 'kind' ? (
          <Badge tone="primary" outline icon="label">Add context</Badge>
        ) : (
          info && <Badge tone={info.tone} outline icon={info.icon}>{info.label}</Badge>
        )}
        <span style={{ flex: 1 }} />
        <IconBtn name="close" onClick={onClose} />
      </div>

      {step === 'kind' ? (
        <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 22px' }}>
          {KINDS.map((k, i) => {
            const kInfo = TIMELINE_CONTEXT_DISPLAY[k];
            return (
              <ListRow key={k} last={i === KINDS.length - 1} onClick={() => handlePick(k)}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={kInfo.icon} size={19} color={colors.inkSoft} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700 }}>{kInfo.label}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, marginTop: 1 }}>{kInfo.hint}</div>
                </div>
                <Icon name="chevron_right" size={18} color={colors.inkMuted} style={{ flexShrink: 0 }} />
              </ListRow>
            );
          })}
        </div>
      ) : (
        <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
          {info && (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, lineHeight: 1.5, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${colors.ruleSoft}` }}>
              {info.definition}
            </div>
          )}

          {kind === 'deviation' && (
            <>
              <label style={fieldLabel}>What was supposed to happen</label>
              {canEdit ? (
                <textarea className="a-input" value={expectedBehavior} onChange={(e) => setExpectedBehavior(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 14 }} placeholder="Describe the normal work this departed from…" />
              ) : (
                <div style={readOnlyText}>{expectedBehavior || '—'}</div>
              )}

              <label style={fieldLabel}>What influenced the drift or the unexpected response?</label>
              {canEdit ? (
                <textarea className="a-input" value={influence} onChange={(e) => setInfluence(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 14 }} placeholder="What led to this departing from normal…" />
              ) : (
                <div style={readOnlyText}>{influence || '—'}</div>
              )}
            </>
          )}

          {kind === 'systemic' && (
            <>
              <label style={fieldLabel}>Forge Works Map® factor</label>
              {canEdit ? (
                <div style={{ marginBottom: 14 }}>
                  <FwFactorPicker value={fwFactor} onChange={setFwFactor} />
                </div>
              ) : (
                <div style={readOnlyText}>{context?.fwFactor ? FW_FACTOR_DISPLAY[context.fwFactor].label : '—'}</div>
              )}

              <label style={fieldLabel}>How did this situation contribute to the incident?</label>
              {canEdit ? (
                <textarea className="a-input" value={contribution} onChange={(e) => setContribution(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 14 }} placeholder="e.g. They didn’t know how to use the isolation switch…" />
              ) : (
                <div style={readOnlyText}>{contribution || '—'}</div>
              )}

              <label style={fieldLabel}>How did this situation arise?</label>
              {canEdit ? (
                <textarea className="a-input" value={origin} onChange={(e) => setOrigin(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 14 }} placeholder="e.g. The business was focused on production and training was skipped…" />
              ) : (
                <div style={readOnlyText}>{origin || '—'}</div>
              )}
            </>
          )}

          {kind === 'failure' && (
            <>
              <label style={fieldLabel}>Recommendation type</label>
              {canEdit ? (
                <div style={{ marginBottom: 14 }}>
                  <Pills
                    value={controlRecommendationType}
                    onChange={(k) => setControlRecommendationType(k as ControlRecommendationType)}
                    items={[
                      { k: 'improve_control', label: 'Improve existing control' },
                      { k: 'new_control', label: 'Add new control' },
                    ]}
                  />
                </div>
              ) : (
                <div style={readOnlyText}>{context?.controlRecommendationType === 'new_control' ? 'Add new control' : 'Improve existing control'}</div>
              )}
            </>
          )}

          {needsControlSelection && kind && (
            <>
              <label style={fieldLabel}>Which control</label>
              {canEdit ? (
                <div style={{ marginBottom: 14 }}>
                  <ControlPicker relevantWorkTypeIds={relevantWorkTypeIds} allowedControlTypes={allowedControlTypesFor(kind)} value={controlId} onChange={setControlId} />
                </div>
              ) : (
                <div style={readOnlyText}>{context?.controlName || '—'}</div>
              )}
            </>
          )}

          {isNewControl && (
            <>
              <label style={fieldLabel}>Describe the new control</label>
              {canEdit ? (
                <textarea className="a-input" value={newControlName} onChange={(e) => setNewControlName(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 14 }} placeholder="What control should exist that doesn’t today…" />
              ) : (
                <div style={readOnlyText}>{context?.controlName || '—'}</div>
              )}
            </>
          )}

          {kind === 'systemic' && (
            <>
              <label style={fieldLabel}>How confident are you this is a real contributor?</label>
              {canEdit ? (
                <div style={{ marginBottom: 14 }}>
                  <Pills
                    value={confidence !== undefined ? String(confidence) : ''}
                    onChange={(v) => setConfidence(Number(v))}
                    items={CONFIDENCE_BANDS.map((b) => ({ k: String(b.value), label: b.label }))}
                  />
                </div>
              ) : (
                <div style={readOnlyText}>{confidence !== undefined ? CONFIDENCE_BANDS.find((b) => b.value === confidence)?.label ?? confidence.toFixed(2) : '—'}</div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600 }}>Worth raising as an insight</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.inkMuted, marginTop: 2, maxWidth: 320 }}>Flags this as significant enough for the systemic cause phase.</div>
                </div>
                {canEdit ? <Toggle checked={leadsToInsight} onChange={setLeadsToInsight} /> : <Badge tone={leadsToInsight ? 'warning' : 'primary'} outline>{leadsToInsight ? 'Yes' : 'No'}</Badge>}
              </div>
            </>
          )}

          {(kind === 'failure' || kind === 'systemic') && (
            <>
              <label style={fieldLabel}>{kind === 'systemic' ? 'Systemic recommendation' : 'Recommendation'}</label>
              {canEdit ? (
                <textarea className="a-input" value={recommendation} onChange={(e) => setRecommendation(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 14 }} placeholder="What should be done about this…" />
              ) : (
                <div style={readOnlyText}>{recommendation || 'None recorded yet.'}</div>
              )}
            </>
          )}

          <label style={fieldLabel}>Note (optional)</label>
          {canEdit ? (
            <textarea className="a-input" value={note} onChange={(e) => setNote(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 14 }} />
          ) : (
            <div style={readOnlyText}>{note || '—'}</div>
          )}

          {canEdit && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 10 }}>
              {!isNew ? <Btn variant="ghost" size="sm" icon="delete" onClick={handleDelete}>Delete</Btn> : <span />}
              <Btn variant="primary" size="sm" icon="check" disabled={!canSave} onClick={handleSave}>{isNew ? 'Add' : 'Save'}</Btn>
            </div>
          )}
        </div>
      )}
    </>
  );
}
