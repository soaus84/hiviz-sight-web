import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { DataTable, SChip, type Column } from '@/components';
import { SIGNAL_DISPLAY } from '@/data/observations';
import type { Observation } from '@/types';

export function ObsTable({ rows }: { rows: Observation[] }) {
  const navigate = useNavigate();
  const cols: Column<Observation>[] = [
    { key: 'when', label: 'When', w: 110, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.when}</span> },
    { key: 'siteName', label: 'Site', w: 180, render: (r) => <span style={{ fontWeight: 600 }}>{r.siteName}</span> },
    { key: 'summary', label: 'Observation', render: (r) => <span style={{ display: 'block', maxWidth: 460, color: colors.ink, fontWeight: 500, lineHeight: 1.4 }}>{r.summary}</span> },
    { key: 'observerName', label: 'Observer', w: 130, render: (r) => <span style={{ color: colors.inkSoft }}>{r.observerName}</span> },
    { key: 'signal_type', label: 'Signal', w: 160, render: (r) => { const s = SIGNAL_DISPLAY[r.signal_type]; return <SChip hue={s.hue}>{s.label}</SChip>; } },
  ];
  return <DataTable columns={cols} rows={rows} rowKey="id" onRow={(r) => navigate(`/observations?id=${r.id}`)} />;
}
