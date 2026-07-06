import { colors } from '@/tokens';
import { DataTable, Badge, type Column } from '@/components';
import { SIGNAL_DISPLAY } from '@/data/observations';
import type { Observation } from '@/types';

export function ObsTable({ rows, onOpen, empty }: { rows: Observation[]; onOpen: (id: string) => void; empty?: string }) {
  const cols: Column<Observation>[] = [
    { key: 'when', label: 'When', w: 110, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.when}</span> },
    { key: 'siteName', label: 'Site', w: 180, render: (r) => <span style={{ fontWeight: 600 }}>{r.siteName}</span> },
    { key: 'summary', label: 'Observation', render: (r) => <span style={{ display: 'block', maxWidth: 460, color: colors.ink, fontWeight: 500, lineHeight: 1.4 }}>{r.summary}</span> },
    { key: 'observerName', label: 'Observer', w: 130, render: (r) => <span style={{ color: colors.inkSoft }}>{r.observerName}</span> },
    { key: 'signal_type', label: 'Signal', w: 160, render: (r) => { const s = SIGNAL_DISPLAY[r.signal_type]; return <Badge tone={s.tone}>{s.label}</Badge>; } },
  ];
  return <DataTable columns={cols} rows={rows} rowKey="id" onRow={(r) => onOpen(r.id)} empty={empty} />;
}
