import { useState } from 'react';
import { colors } from '@/tokens';
import { Card, Badge, Btn, IconBtn, Icon, Pills } from '@/components';
import { useActiveUser } from '@/state/ActiveUser';
import { workStreamsFor, createWorkStream, populateWithHivizSuggestions, updateWorkStreamSteps, updateWorkStreamNarrative, goLive, discardDraft, workStreamProgress } from '@/data/workStreams';
import { WORK_STREAM_KIND_DISPLAY, WORK_STREAM_STATUS_DISPLAY, workStreamDoneWord } from './workStreamDisplay';
import { Section } from './SectionHeading';
import type { WorkStream, WorkStreamKind, WorkStreamSourceType } from '@/types';

type Suggestion = { steps?: { text: string }[]; narrative?: string };

const inputStyle = { padding: '7px 9px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 12.5, outline: 'none', width: '100%' };
const textareaStyle = { width: '100%', padding: '9px 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, resize: 'vertical' as const, outline: 'none' };

/** One continuous fill, not per-site segments — explicitly asked for over
 * the segmented-pip style from the reference mock. */
function ProgressBar({ complete, total }: { complete: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((complete / total) * 100);
  return (
    <div>
      <div style={{ height: 6, borderRadius: 999, background: colors.fill, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: colors.green, borderRadius: 999 }} />
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, marginTop: 4 }}>{complete}/{total} sites</div>
    </div>
  );
}

function WorkStreamCard({ ws, suggestion, onChanged, onPopulate }: { ws: WorkStream; suggestion?: Suggestion; onChanged: () => void; onPopulate: () => void }) {
  const kindInfo = WORK_STREAM_KIND_DISPLAY[ws.kind];
  const statusInfo = WORK_STREAM_STATUS_DISPLAY[ws.status];
  const { complete, total } = workStreamProgress(ws);
  const isDraft = ws.status === 'draft';
  const isTalk = ws.kind === 'toolbox_talk';
  const [newStep, setNewStep] = useState('');
  const [view, setView] = useState<'content' | 'sites'>('content');
  const doneWord = workStreamDoneWord(ws.kind);
  // Only offer the populate action while there's a suggestion to give, the
  // draft is still empty, and it hasn't already been used once — once
  // clicked, populatedByHiviz stays true regardless of later edits (see its
  // own doc comment), so the button doesn't reappear just because the
  // content was since cleared.
  const canPopulate = isDraft && !ws.populatedByHiviz && !!suggestion && (isTalk ? !ws.narrative?.trim() : ws.steps.length === 0);

  const patchStep = (idx: number, value: string) => {
    updateWorkStreamSteps(ws.id, ws.steps.map((s, i) => (i === idx ? { ...s, text: value } : s)));
    onChanged();
  };
  const removeStep = (idx: number) => {
    updateWorkStreamSteps(ws.id, ws.steps.filter((_, i) => i !== idx));
    onChanged();
  };
  const addStep = () => {
    if (!newStep.trim()) return;
    updateWorkStreamSteps(ws.id, [...ws.steps, { text: newStep.trim() }]);
    setNewStep('');
    onChanged();
  };

  return (
    <Card pad={16} style={{ marginBottom: 10, boxShadow: 'none', border: `1px solid ${colors.rule}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={kindInfo.icon} size={17} color={colors.inkSoft} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.inkSoft }}>{kindInfo.label}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 700 }}>{ws.title}</div>
        </div>
        {ws.populatedByHiviz && <Badge tone="primary" outline icon="auto_awesome">Hiviz-populated</Badge>}
        <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
      </div>

      {!isDraft && total > 0 && <div style={{ marginTop: 12 }}><ProgressBar complete={complete} total={total} /></div>}

      {!isDraft && (
        <div style={{ marginTop: 12 }}>
          <Pills
            value={view} onChange={(k) => setView(k as 'content' | 'sites')}
            items={[
              { k: 'content', label: isTalk ? 'Narrative' : 'Content' },
              { k: 'sites', label: 'Sites', n: total },
            ]}
          />
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        {!isDraft && view === 'sites' ? (
          // Read-only — the parent is just the aggregator. Verification/
          // response happens at the site level (views/sites/SiteWorkStreams.tsx
          // + SiteWorkStreamDrawer.tsx), never from here.
          <div>
            {ws.sites.map((s, i) => (
              <div key={s.siteId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderTop: i === 0 ? undefined : `1px solid ${colors.ruleSoft}` }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 500 }}>{s.siteName}</span>
                {s.complete ? (
                  <Badge tone="success" outline icon="check">{doneWord}</Badge>
                ) : (
                  <Badge tone="primary" outline>Pending</Badge>
                )}
              </div>
            ))}
          </div>
        ) : isTalk ? (
          isDraft ? (
            <>
              {canPopulate && (
                <div style={{ marginBottom: 8 }}>
                  <Btn variant="ghost" size="sm" icon="auto_awesome" onClick={onPopulate}>Populate with Hiviz suggestions</Btn>
                </div>
              )}
              <textarea
                style={textareaStyle} rows={5} placeholder="What should a supervisor read aloud to their crew?"
                value={ws.narrative ?? ''} onChange={(e) => { updateWorkStreamNarrative(ws.id, e.target.value); onChanged(); }}
              />
            </>
          ) : (
            <div style={{ border: `1px solid ${colors.ruleSoft}`, borderRadius: 'var(--radius-md)', padding: '10px 12px', fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.55 }}>
              {ws.narrative || <span style={{ color: colors.inkMuted }}>No narrative recorded.</span>}
            </div>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {canPopulate && (
              <div>
                <Btn variant="ghost" size="sm" icon="auto_awesome" onClick={onPopulate}>Populate with Hiviz suggestions</Btn>
              </div>
            )}
            {ws.steps.map((s, i) => isDraft ? (
              <div key={s.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input style={{ ...inputStyle, flex: 1 }} value={s.text} onChange={(e) => patchStep(i, e.target.value)} />
                <IconBtn name="close" onClick={() => removeStep(i)} />
              </div>
            ) : (
              <div key={s.id} style={{ border: `1px solid ${colors.ruleSoft}`, borderRadius: 'var(--radius-md)', padding: '8px 10px' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600 }}>{s.text}</div>
              </div>
            ))}

            {isDraft && (
              <div style={{ display: 'flex', gap: 6 }}>
                <input style={inputStyle} placeholder="Add a step…" value={newStep} onChange={(e) => setNewStep(e.target.value)} />
                <Btn variant="ghost" size="sm" icon="add" onClick={addStep}>Add</Btn>
              </div>
            )}

            {ws.steps.length === 0 && !isDraft && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkMuted }}>No content recorded.</div>}
          </div>
        )}
      </div>

      {isDraft && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Btn variant="ghost" size="sm" onClick={() => { discardDraft(ws.id); onChanged(); }}>Discard</Btn>
          <Btn
            variant="primary" size="sm" icon="send"
            disabled={isTalk ? !ws.narrative?.trim() : ws.steps.length === 0}
            onClick={() => { goLive(ws.id); onChanged(); }}
          >
            Go live
          </Btn>
        </div>
      )}
    </Card>
  );
}

/** The shared Work Streams surface for both Insight and Investigation — see
 * [[project_corrective_actions_enquiry_spec]]. `aiSuggestedQuestions`/
 * `aiSuggestedActions` (already normalised to plain `{text}` by the caller —
 * Insight and Investigation's own AI-suggestion fields have genuinely
 * different shapes, this component doesn't need to know that; any rationale
 * a caller's own suggestion carries is deliberately left behind, it's not
 * part of what a Work Stream step is) and `aiSuggestedNarrative` are no
 * longer auto-copied into a new draft on creation — a new stream always
 * opens empty, and "Populate with Hiviz suggestions" (shown inside an empty
 * draft when a suggestion exists for that kind) is the explicit action that
 * pulls them in. This both avoids showing the same suggested text twice on
 * the page (once in the parent's own read-only display, again inside the
 * draft) and gives Hiviz a real adoption signal (`WorkStream.populatedByHiviz`)
 * to gauge before automating more of this flow. `canAdd` gates the create
 * row separately from whether existing streams still render (a closed/
 * non-actionable parent keeps showing what's already live). */
export function WorkStreamsSection({ sourceType, sourceId, siteNames, canAdd, aiSuggestedQuestions, aiSuggestedActions, aiSuggestedNarrative, onChanged }: {
  sourceType: WorkStreamSourceType;
  sourceId: string;
  siteNames: string[];
  canAdd: boolean;
  aiSuggestedQuestions?: { text: string }[];
  aiSuggestedActions?: { text: string }[];
  aiSuggestedNarrative?: string;
  /** The parent detail page's own re-render trigger — this section mutates
   * WORK_STREAMS via module-level functions the parent has no other way to
   * know about, so anything the parent derives from this insight/
   * investigation's Work Streams (e.g. InsightDetail's resolve gate) would
   * otherwise go stale until some unrelated prop change forced a re-render. */
  onChanged?: () => void;
}) {
  const { user } = useActiveUser();
  const [, forceRender] = useState(0);
  const refresh = () => { forceRender((v) => v + 1); onChanged?.(); };
  const streams = workStreamsFor(sourceType, sourceId);

  if (streams.length === 0 && !canAdd) return null;

  const suggestionFor = (kind: WorkStreamKind): Suggestion | undefined => {
    if (kind === 'learn') return aiSuggestedQuestions?.length ? { steps: aiSuggestedQuestions } : undefined;
    if (kind === 'improve') return aiSuggestedActions?.length ? { steps: aiSuggestedActions } : undefined;
    return aiSuggestedNarrative ? { narrative: aiSuggestedNarrative } : undefined;
  };

  const handleAdd = (kind: WorkStreamKind) => {
    createWorkStream({ sourceType, sourceId, kind, siteNames, createdBy: user.name });
    refresh();
  };
  const handlePopulate = (ws: WorkStream) => {
    const suggestion = suggestionFor(ws.kind);
    if (!suggestion) return;
    populateWithHivizSuggestions(ws.id, suggestion);
    refresh();
  };

  return (
    <Section
      title="Work streams"
      subtitle="Toolbox talks, field enquiries, and corrective actions pushed to site to close this out."
      pad={streams.length === 0 ? 28 : 16}
      footer={canAdd ? (
        <>
          <Btn variant="ghost" size="sm" icon="forum" onClick={() => handleAdd('toolbox_talk')}>Toolbox talk</Btn>
          <Btn variant="ghost" size="sm" icon="help" onClick={() => handleAdd('learn')}>Learn</Btn>
          <Btn variant="ghost" size="sm" icon="task_alt" onClick={() => handleAdd('improve')}>Improve</Btn>
        </>
      ) : undefined}
    >
      {streams.length === 0 ? (
        <div style={{ textAlign: 'center' }}>
          <Icon name="task_alt" size={26} color={colors.inkMuted} />
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 700, marginTop: 10 }}>No work streams yet</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkSoft, lineHeight: 1.5, maxWidth: 380, margin: '6px auto 0' }}>
            Push a toolbox talk, field enquiry, or corrective action to site using the buttons below.
          </div>
        </div>
      ) : (
        streams.map((ws) => (
          <WorkStreamCard key={ws.id} ws={ws} suggestion={suggestionFor(ws.kind)} onChanged={refresh} onPopulate={() => handlePopulate(ws)} />
        ))
      )}
    </Section>
  );
}
