import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Card } from '@/components';
import { InsightCard } from './InsightCard';
import { daysSince, RESOLVED_WINDOW_DAYS } from '@/data/insights';
import type { Insight, InsightStatus } from '@/types';

const COLUMNS: { status: InsightStatus; label: string }[] = [
  { status: 'review', label: 'Review' },
  { status: 'action', label: 'Action' },
  { status: 'closed', label: `Resolved (Last ${RESOLVED_WINDOW_DAYS} days)` },
];

export function InsightsBoard({ insights, onOpen }: { insights: Insight[]; onOpen: (id: string) => void }) {
  // Horizontal-scrolling columns are still useful once there's room to see
  // more than one at a time (tablet/desktop). On mobile there's only ever
  // width for a single column anyway, so scrolling sideways is the odd one
  // out compared to how every other view in the app stacks below desktop —
  // stack the columns as full-width rows there instead.
  const stacked = useBreakpoint() === 'mobile';

  const byColumn = (status: InsightStatus) =>
    insights.filter((i) => i.status === status && (status !== 'closed' || daysSince(i.updatedAt) <= RESOLVED_WINDOW_DAYS));

  return (
    <div style={{ display: 'flex', flexDirection: stacked ? 'column' : 'row', gap: stacked ? 24 : 16, overflowX: stacked ? undefined : 'auto', alignItems: stacked ? 'stretch' : 'flex-start', paddingBottom: 4 }}>
      {COLUMNS.map((col) => {
        const items = byColumn(col.status);
        return (
          <div key={col.status} style={{ width: stacked ? '100%' : 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, padding: '2px 2px 4px' }}>
              {col.label} · {items.length}
            </div>
            {items.length === 0 && (
              <Card pad={18} style={{ textAlign: 'center', color: colors.inkMuted, fontSize: 13, fontWeight: 500 }}>
                Nothing here.
              </Card>
            )}
            {items.map((i) => <InsightCard key={i.id} i={i} onClick={() => onOpen(i.id)} />)}
          </div>
        );
      })}
    </div>
  );
}
