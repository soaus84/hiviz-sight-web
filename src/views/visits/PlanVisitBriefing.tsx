import { colors } from '@/tokens';
import { Badge, Icon } from '@/components';
import { INSIGHTS, INSIGHT_KIND_LABEL } from '@/data/insights';
import type { Site } from '@/types';

const labelStyle = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const, color: colors.inkSoft, marginBottom: 8 };

export interface PlanVisitBriefingProps {
  site: Site;
  focusNotes: string;
  onNotesChange: (v: string) => void;
  relatedInsightIds: string[];
  onInsightsChange: (ids: string[]) => void;
}

export function PlanVisitBriefing({ site, focusNotes, onNotesChange, relatedInsightIds, onInsightsChange }: PlanVisitBriefingProps) {
  const openInsights = INSIGHTS.filter((i) => i.siteNames.includes(site.name) && i.status !== 'closed');

  const toggle = (id: string) => {
    onInsightsChange(relatedInsightIds.includes(id) ? relatedInsightIds.filter((x) => x !== id) : [...relatedInsightIds, id]);
  };

  return (
    <div>
      <label style={labelStyle}>What should this visit focus on?</label>
      <textarea
        className="a-input"
        value={focusNotes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="e.g. Confirm PTW compliance following last week's near-misses…"
        style={{ width: '100%', minHeight: 100, padding: '12px 14px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 14, outline: 'none', resize: 'vertical' }}
      />

      {openInsights.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <label style={labelStyle}>Related open insights (optional)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {openInsights.map((i) => {
              const on = relatedInsightIds.includes(i.id);
              const [kindLabel, kindTone] = INSIGHT_KIND_LABEL[i.kind];
              return (
                <div
                  key={i.id}
                  onClick={() => toggle(i.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${on ? colors.ink : colors.rule}`, background: on ? colors.fill : colors.panel, cursor: 'pointer' }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${on ? colors.ink : colors.rule}`, background: on ? colors.ink : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {on && <Icon name="check" size={13} color="#fff" />}
                  </div>
                  <Badge tone={kindTone} outline>{kindLabel}</Badge>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, flex: 1, minWidth: 0 }}>{i.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
