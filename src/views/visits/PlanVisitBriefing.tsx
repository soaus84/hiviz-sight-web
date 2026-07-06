import { colors } from '@/tokens';
import { Badge, Icon, LinkBtn } from '@/components';
import { formatVisitWhen } from '@/utils/format';
import { INSIGHTS, INSIGHT_KIND_LABEL } from '@/data/insights';
import type { Site } from '@/types';
import type { DateChoice } from './PlanVisitSchedule';

const labelStyle = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const, color: colors.inkSoft, marginBottom: 8 };

export interface PlanVisitBriefingProps {
  site: Site;
  dateChoice: DateChoice | null;
  date: string;
  time: string;
  focusNotes: string;
  onNotesChange: (v: string) => void;
  relatedInsightIds: string[];
  onInsightsChange: (ids: string[]) => void;
  onChangeSchedule: () => void;
}

export function PlanVisitBriefing({ site, dateChoice, date, time, focusNotes, onNotesChange, relatedInsightIds, onInsightsChange, onChangeSchedule }: PlanVisitBriefingProps) {
  const openInsights = INSIGHTS.filter((i) => i.siteNames.includes(site.name) && i.status !== 'closed');
  const isConfirmedDate = dateChoice !== 'later' && !!date;
  const whenLabel = isConfirmedDate ? formatVisitWhen(date, time) : 'Date to be confirmed';

  const toggle = (id: string) => {
    onInsightsChange(relatedInsightIds.includes(id) ? relatedInsightIds.filter((x) => x !== id) : [...relatedInsightIds, id]);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 'var(--radius-lg)', background: colors.ink, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: colors.hi, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700, color: '#fff' }}>{site.name}</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>{whenLabel}</div>
          </div>
        </div>
        <LinkBtn onClick={onChangeSchedule} style={{ color: colors.hi }}>Change</LinkBtn>
      </div>

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
