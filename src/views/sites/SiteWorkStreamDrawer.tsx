import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { IconBtn, Badge, Btn, LinkBtn } from '@/components';
import { markSiteComplete, workStreamParentTitle, workStreamParentPath } from '@/data/workStreams';
import { WORK_STREAM_KIND_DISPLAY, workStreamDoneWord } from '@/views/shared/workStreamDisplay';
import { Section } from '@/views/shared/SectionHeading';
import type { WorkStream } from '@/types';

const fieldLabel = { display: 'block', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, marginBottom: 5 };
const textareaStyle = { width: '100%', padding: '9px 10px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, resize: 'vertical' as const, outline: 'none' };

/** The site's own respond-and-close surface for one Work Stream instance —
 * see [[project_corrective_actions_enquiry_spec]]. This is the ONLY place a
 * site's own status flips to complete/delivered; the parent Insight/
 * Investigation view (WorkStreamsSection.tsx) is read-only over the exact
 * same data. */
export function SiteWorkStreamDrawer({ ws, siteId, onClose, onChanged }: { ws: WorkStream; siteId: string; onClose: () => void; onChanged: () => void }) {
  const navigate = useNavigate();
  const mine = ws.sites.find((s) => s.siteId === siteId);
  const kindInfo = WORK_STREAM_KIND_DISPLAY[ws.kind];
  const doneWord = workStreamDoneWord(ws.kind);
  const [note, setNote] = useState(mine?.note ?? '');

  const handleMark = () => {
    if (!note.trim()) return;
    markSiteComplete(ws.id, siteId, note.trim());
    onChanged();
  };

  const goToSource = () => {
    onClose();
    navigate(workStreamParentPath(ws));
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <Badge tone="primary" outline icon={kindInfo.icon}>{kindInfo.label}</Badge>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: colors.inkSoft, flex: 1 }}>{ws.id}</span>
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.3 }}>{ws.title}</div>
        <LinkBtn icon="open_in_new" onClick={goToSource} style={{ marginTop: 8 }}>From: {workStreamParentTitle(ws)}</LinkBtn>

        {ws.kind === 'toolbox_talk' ? (
          <Section title="Narrative" subtitle="What should be read aloud to the crew." pad={16}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.6 }}>{ws.narrative || 'No narrative recorded.'}</div>
          </Section>
        ) : (
          <Section
            title={ws.kind === 'learn' ? 'Questions' : 'Actions'}
            subtitle={ws.kind === 'learn' ? 'Questions to confirm this pattern in the field.' : 'Actions to close the gap driving this.'}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ws.steps.map((step) => (
                <div key={step.id} style={{ border: `1px solid ${colors.ruleSoft}`, borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700 }}>{step.text}</div>
                </div>
              ))}
              {ws.steps.length === 0 && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkMuted }}>Nothing recorded.</div>}
            </div>
          </Section>
        )}

        <Section title="Response" subtitle="This site's own record of what was done." pad={16}>
          {mine?.complete ? (
            <>
              <Badge tone="success" outline icon="check">{doneWord}</Badge>
              {mine.note && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, marginTop: 10 }}>{mine.note}</div>}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkMuted, marginTop: 8 }}>{mine.completedAt && new Date(mine.completedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
            </>
          ) : (
            <>
              <label style={fieldLabel}>{ws.kind === 'toolbox_talk' ? 'Confirm this was passed on to the crew' : 'What was done'}</label>
              <textarea
                className="a-input" autoFocus value={note} onChange={(e) => setNote(e.target.value)} rows={3} style={{ ...textareaStyle, marginBottom: 10 }}
                placeholder={ws.kind === 'toolbox_talk' ? 'Delivered at shift start, crew acknowledged…' : 'What actually happened at this site…'}
              />
              <Btn variant="primary" icon="check" disabled={!note.trim()} onClick={handleMark}>Mark {doneWord.toLowerCase()}</Btn>
            </>
          )}
        </Section>
      </div>
    </>
  );
}
