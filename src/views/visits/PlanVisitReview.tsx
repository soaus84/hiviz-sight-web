import { colors } from '@/tokens';
import { Card, Fact, Badge } from '@/components';
import { useActiveUser } from '@/state/ActiveUser';
import { INSIGHTS_BY_ID, INSIGHT_KIND_LABEL } from '@/data/insights';
import type { Site } from '@/types';
import type { DateChoice } from './PlanVisitSchedule';

export interface PlanVisitReviewProps {
  site: Site;
  dateChoice: DateChoice | null;
  date: string;
  time: string;
  focusNotes: string;
  relatedInsightIds: string[];
}

export function PlanVisitReview({ site, dateChoice, date, time, focusNotes, relatedInsightIds }: PlanVisitReviewProps) {
  const { user } = useActiveUser();
  const relatedInsights = relatedInsightIds.map((id) => INSIGHTS_BY_ID[id]).filter(Boolean);
  const isConfirmedDate = dateChoice !== 'later' && !!date;

  return (
    <div>
      <Card pad={16}>
        <Fact k="Site" v={site.name} />
        <Fact k="Region" v={site.region} />
        <Fact k="Date" v={isConfirmedDate ? date : 'To be confirmed'} />
        {isConfirmedDate && <Fact k="Time" v={time} />}
        <Fact k="Visitor" v={`${user.name} (You)`} last={!focusNotes && relatedInsights.length === 0} />
        {focusNotes && <Fact k="Focus" v={focusNotes} last={relatedInsights.length === 0} />}
      </Card>
      {relatedInsights.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, marginBottom: 8 }}>
            Related insights · {relatedInsights.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {relatedInsights.map((i) => {
              const [label, tone] = INSIGHT_KIND_LABEL[i.kind];
              return (
                <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-md)' }}>
                  <Badge tone={tone} outline>{label}</Badge>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600 }}>{i.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
