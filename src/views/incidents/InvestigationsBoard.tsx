import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Card } from '@/components';
import { InvestigationCard } from './InvestigationCard';
import { SevereIncidentCard } from './SevereIncidentCard';
import { daysSince, RESOLVED_WINDOW_DAYS } from '@/data/investigations';
import type { Incident, Investigation } from '@/types';

// Four-stage shape now (2026-09-14 redesign, see
// [[project_investigation_timeline]]) — 'Needs review' is severe Incidents
// awaiting the Acknowledge/Progress decision, not Investigation records,
// since an Investigation doesn't exist yet at that point (see
// data/investigations.ts's top-of-file note). The other three columns are
// real Investigation records, one per InvestigationStatus value.
export function InvestigationsBoard({
  severeIncidents, investigations, onOpenIncident, onOpenInvestigation,
}: {
  severeIncidents: Incident[];
  investigations: Investigation[];
  onOpenIncident: (id: string) => void;
  onOpenInvestigation: (id: string) => void;
}) {
  const stacked = useBreakpoint() === 'mobile';
  const timeline = investigations.filter((v) => v.status === 'timeline');
  const actions = investigations.filter((v) => v.status === 'actions');
  const closed = investigations.filter((v) => v.status === 'closed' && daysSince(v.updatedAt) <= RESOLVED_WINDOW_DAYS);

  const columns = [
    { label: 'Needs review', count: severeIncidents.length, render: () => severeIncidents.map((i) => <SevereIncidentCard key={i.id} i={i} onClick={() => onOpenIncident(i.id)} />) },
    { label: 'Timeline', count: timeline.length, render: () => timeline.map((v) => <InvestigationCard key={v.id} v={v} onClick={() => onOpenInvestigation(v.id)} />) },
    { label: 'Actions', count: actions.length, render: () => actions.map((v) => <InvestigationCard key={v.id} v={v} onClick={() => onOpenInvestigation(v.id)} />) },
    { label: `Closed (Last ${RESOLVED_WINDOW_DAYS} days)`, count: closed.length, render: () => closed.map((v) => <InvestigationCard key={v.id} v={v} onClick={() => onOpenInvestigation(v.id)} />) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: stacked ? 'column' : 'row', gap: stacked ? 24 : 16, overflowX: stacked ? undefined : 'auto', alignItems: stacked ? 'stretch' : 'flex-start', paddingBottom: 4 }}>
      {columns.map((col) => (
        <div key={col.label} style={{ width: stacked ? '100%' : 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, padding: '2px 2px 4px' }}>
            {col.label} · {col.count}
          </div>
          {col.count === 0 && (
            <Card pad={18} style={{ textAlign: 'center', color: colors.inkMuted, fontSize: 13, fontWeight: 500 }}>
              Nothing here.
            </Card>
          )}
          {col.render()}
        </div>
      ))}
    </div>
  );
}
