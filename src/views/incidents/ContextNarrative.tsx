import { colors } from '@/tokens';
import { Badge, IconBtn } from '@/components';
import { TIMELINE_CONTEXT_DISPLAY } from '@/views/shared/timelineDisplay';
import { FW_FACTOR_DISPLAY } from '@/views/shared/fwFactorDisplay';
import type { TimelineContext } from '@/types';

const fieldEyebrow = { fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' as const, color: colors.inkMuted, marginBottom: 2 };
const fieldBlock = { marginTop: 8 };
const fieldValue = { fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.ink, lineHeight: 1.45 };

/** One context tag, shown in full — same "every field it actually carries,
 * not just a label" pattern as InvestigationFindings' own FindingRow (the
 * 2026-09-15 hierarchy audit that fixed findings applies word-for-word here:
 * a reader was getting kind + control name + note only, with
 * expectedBehavior/influence/fwFactor/recommendation invisible unless they
 * opened the drawer — exactly the "can't read the timeline as a report
 * without opening every block" complaint this fixes). A colour-coded `Badge`
 * for the kind (the at-a-glance danger/warning/good read this app leans on
 * throughout), then every field this kind actually has, each with its own
 * small eyebrow label, never truncated — "if this was presented event by
 * event on screen the story should be clear." Wrapped in its own light
 * bordered box so each tag reads as one distinct fact when an event carries
 * several, not a run-on paragraph.
 *
 * `onEdit` (2026-09-15) — a small explicit edit affordance next to the
 * badge, shown only when `canEdit`, rather than wrapping the whole box in an
 * onClick as before: the box is now always fully expanded (nothing behind
 * it to reveal), so a click-anywhere-to-open affordance read as "there's
 * more here, click to see it" when there wasn't — misleading once the
 * content is already long-form on the page. See
 * [[project_investigation_timeline]]'s "long form it now" note: the timeline
 * should read like a report at every phase, not just once closed, so this
 * component carries no separate "closed/report" variant — it's the one
 * rendering, always. */
export function ContextNarrative({ c, canEdit, onEdit }: { c: TimelineContext; canEdit?: boolean; onEdit?: () => void }) {
  const info = TIMELINE_CONTEXT_DISPLAY[c.kind];
  return (
    <div style={{ border: `1px solid ${colors.ruleSoft}`, borderRadius: 'var(--radius-md)', padding: '8px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Badge tone={info.tone} outline icon={info.icon}>{info.label}</Badge>
        {c.controlRecommendationType === 'new_control' && <Badge tone="warning" outline>New control</Badge>}
        {c.controlName && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 700 }}>{c.controlName}</span>}
        {c.leadsToInsight && <Badge tone="warning" outline icon="lightbulb">Worth raising as insight</Badge>}
        {canEdit && onEdit && (
          <div style={{ marginLeft: 'auto' }}>
            <IconBtn name="edit" size={15} onClick={onEdit} />
          </div>
        )}
      </div>

      {c.expectedBehavior && (
        <div style={fieldBlock}>
          <div style={fieldEyebrow}>Should have happened</div>
          <div style={fieldValue}>{c.expectedBehavior}</div>
        </div>
      )}
      {c.influence && (
        <div style={fieldBlock}>
          <div style={fieldEyebrow}>What influenced this</div>
          <div style={fieldValue}>{c.influence}</div>
        </div>
      )}
      {c.fwFactor && (
        <div style={fieldBlock}>
          <div style={fieldEyebrow}>Forge Works Map® factor</div>
          <div style={fieldValue}>{FW_FACTOR_DISPLAY[c.fwFactor].label}</div>
        </div>
      )}
      {c.contribution && (
        <div style={fieldBlock}>
          <div style={fieldEyebrow}>How this contributed</div>
          <div style={fieldValue}>{c.contribution}</div>
        </div>
      )}
      {c.origin && (
        <div style={fieldBlock}>
          <div style={fieldEyebrow}>How this arose</div>
          <div style={fieldValue}>{c.origin}</div>
        </div>
      )}
      {c.confidence !== undefined && (
        <div style={fieldBlock}>
          <div style={fieldEyebrow}>Investigator confidence</div>
          <div style={fieldValue}>{c.confidence >= 0.75 ? 'High' : c.confidence >= 0.45 ? 'Medium' : 'Low'} ({c.confidence.toFixed(2)})</div>
        </div>
      )}
      {c.note && (
        <div style={fieldBlock}>
          <div style={fieldEyebrow}>Note</div>
          <div style={{ ...fieldValue, color: colors.inkSoft }}>{c.note}</div>
        </div>
      )}
      {c.recommendation && (
        <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${colors.ruleSoft}` }}>
          <div style={fieldEyebrow}>{c.kind === 'systemic' ? 'Systemic recommendation' : 'Recommendation'}</div>
          <div style={{ ...fieldValue, fontWeight: 600 }}>{c.recommendation}</div>
        </div>
      )}
    </div>
  );
}
