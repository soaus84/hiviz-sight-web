import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Card } from '@/components';
import { BarrierFailureCard } from './BarrierFailureCard';
import type { BarrierFailure, BarrierFailureStatus } from '@/types';

const COLUMNS: { status: BarrierFailureStatus; label: string }[] = [
  { status: 'open', label: 'Open' },
  { status: 'pending_approval', label: 'Pending approval' },
  { status: 'resolved', label: 'Resolved' },
];

export function BarrierFailuresBoard({ failures, onOpen }: { failures: BarrierFailure[]; onOpen: (id: string) => void }) {
  const stacked = useBreakpoint() === 'mobile';
  const byColumn = (status: BarrierFailureStatus) => failures.filter((b) => b.status === status);

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
            {items.map((b) => <BarrierFailureCard key={b.id} b={b} onClick={() => onOpen(b.id)} />)}
          </div>
        );
      })}
    </div>
  );
}
