import { useState } from 'react';
import { colors } from '@/tokens';
import { Badge, Icon, Drawer } from '@/components';
import { timelineForInvestigation } from '@/data/timeline';
import { deriveFindings, findingKindOf } from './findingsView';
import { FINDING_KIND_DISPLAY } from '@/views/shared/findingDisplay';
import { FW_FACTOR_DISPLAY } from '@/views/shared/fwFactorDisplay';
import { Section } from '@/views/shared/SectionHeading';
import { ContextDrawer } from './ContextDrawer';
import type { FindingView } from './findingsView';
import type { TimelineContext } from '@/types';

// A small "eyebrow" above each field's value, not an inline "Label: value"
// prefix — labels and values sitting at the same size/weight is exactly
// what made this row hard to scan before (see [[project_investigation_timeline]]'s
// 2026-09-15 audit note; this pattern is worth carrying to other forms in
// the app, not just this one).
const fieldEyebrow = { fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' as const, color: colors.inkMuted, marginBottom: 2 };
const fieldBlock = { marginTop: 10 };
const fieldValue = { fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.ink, lineHeight: 1.5 };

/** Shows every field a finding (a TimelineContext) actually carries — what
 * happened, an optional note, and always the recommendation, plus whichever
 * kind-specific fields this finding's context has (expectedBehavior/
 * influence never appear here in practice since those are 'deviation'-only
 * and 'deviation' itself never carries a recommendation — but the fields
 * stay generically conditional rather than hardcoded to 'control'/'systemic'
 * shape, since a finding is still just "any context with a recommendation").
 * "The findings should output their full story," per the 2026-09-15 audit: a
 * reader shouldn't have to open the drawer just to see content that was
 * already typed in. */
function FindingRow({ f, onClick }: { f: FindingView; onClick: () => void }) {
  const kind = findingKindOf(f.context);
  const info = FINDING_KIND_DISPLAY[kind];
  const c = f.context;
  return (
    <div
      className="a-card-int" onClick={onClick}
      style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={info.icon} size={18} color={colors.inkSoft} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Badge tone={info.tone} outline>{info.label}</Badge>
          {c.controlRecommendationType === 'new_control' && <Badge tone="warning" outline>New control</Badge>}
          {c.controlName && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 700 }}>{c.controlName}</span>}
          {c.leadsToInsight && <Badge tone="warning" outline icon="lightbulb">Worth raising as insight</Badge>}
        </div>

        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 700, lineHeight: 1.35, marginTop: 8 }}>{f.event.description}</div>

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
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${colors.ruleSoft}` }}>
          <div style={fieldEyebrow}>{kind === 'systemic' ? 'Systemic recommendation' : 'Recommendation'}</div>
          <div style={{ ...fieldValue, fontWeight: 600 }}>{c.recommendation}</div>
        </div>
      </div>
      <Icon name="chevron_right" size={18} color={colors.inkMuted} style={{ marginTop: 2, flexShrink: 0 }} />
    </div>
  );
}

/** A derived roll-up, not a separately-authored list — see
 * [[project_investigation_timeline]]'s 2026-09-15 redesign. Every row here
 * is a TimelineContext tag (on some event, out on the Timeline section
 * above) that's had a recommendation attached; clicking one opens the exact
 * same ContextDrawer the Timeline itself uses, since editing "a finding" is
 * just editing that context tag. There's no "Add finding" flow left in this
 * section on purpose — findings come from tagging context on the timeline
 * (a control failure, or a systemic contributor with a recommendation), not
 * from a parallel authoring surface that could drift from it. */
export function InvestigationFindings({ investigationId, canEdit, onChanged, relevantWorkTypeIds }: { investigationId: string; canEdit: boolean; onChanged?: () => void; relevantWorkTypeIds: string[] }) {
  const [, forceRender] = useState(0);
  const refresh = () => { forceRender((v) => v + 1); onChanged?.(); };
  const [target, setTarget] = useState<{ eventId: string; context: TimelineContext } | null>(null);

  const events = timelineForInvestigation(investigationId);
  const findings = deriveFindings(events);

  if (findings.length === 0 && !canEdit) return null;

  return (
    <>
      <Section title="Findings" subtitle="Control failures and systemic contributors flagged with a recommendation, pulled straight from the timeline above.">
        {findings.length === 0 ? (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkMuted, fontWeight: 500 }}>
            None yet — tag a control failure, or a systemic contributor with a recommendation, on the timeline above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {findings.map((f) => <FindingRow key={f.context.id} f={f} onClick={() => setTarget({ eventId: f.event.id, context: f.context })} />)}
          </div>
        )}
      </Section>

      <Drawer open={!!target} onClose={() => setTarget(null)}>
        {target && (
          <ContextDrawer
            eventId={target.eventId} context={target.context} relevantWorkTypeIds={relevantWorkTypeIds}
            canEdit={canEdit} onClose={() => setTarget(null)} onChanged={refresh}
          />
        )}
      </Drawer>
    </>
  );
}
