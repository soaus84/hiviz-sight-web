import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Btn, Search, DataTable, Badge, Icon, type Column } from '@/components';
import { HAZARDS, CRITICAL_CONTROLS } from '@/data/risk';
import { SITES } from '@/data/sites';
import { HIGH_RISK_WORK } from '@/data/admin/taxonomies';
import { SEVERITY_DISPLAY } from './riskDisplay';
import type { Hazard } from '@/types';

const WORK_TYPE_NAME: Record<string, string> = Object.fromEntries(HIGH_RISK_WORK.map((t) => [t.id, t.name]));

/** The flat, exportable artefact over the same Hazard/CriticalControl data
 * Work Types (WorkTypes.tsx) manages — every hazard in one searchable list,
 * regardless of work type. Read + search only: hazards are added and
 * managed from Work Types (scoped to the relevant work type) or from a
 * hazard's own detail page, not from here. */
export function Register() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const rows = useMemo(
    () => HAZARDS.filter((h) => !query || h.name.toLowerCase().includes(query.toLowerCase()) || WORK_TYPE_NAME[h.workTypeId]?.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const cols: Column<Hazard>[] = [
    { key: 'name', label: 'Hazard', render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="hub" size={17} color={colors.inkSoft} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>{WORK_TYPE_NAME[r.workTypeId] ?? r.workTypeId}</div>
        </div>
      </div>
    ) },
    { key: 'severityClass', label: 'Severity', w: 110, render: (r) => { const s = SEVERITY_DISPLAY[r.severityClass]; return <Badge tone={s.tone}>{s.label}</Badge>; } },
    { key: 'prevention', label: 'Prevention', w: 110, align: 'left', mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{CRITICAL_CONTROLS.filter((c) => c.hazardId === r.id && c.controlType === 'prevention').length}</span> },
    { key: 'mitigation', label: 'Mitigation', w: 110, align: 'left', mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{CRITICAL_CONTROLS.filter((c) => c.hazardId === r.id && c.controlType === 'mitigation').length}</span> },
    { key: 'sites', label: 'Sites targeted', w: 130, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{SITES.filter((s) => s.workTypeIds.includes(r.workTypeId)).length}</span> },
    { key: 'go', label: '', w: 44, align: 'right', render: () => <Icon name="chevron_right" size={18} color={colors.inkMuted} /> },
  ];

  return (
    <div>
      <PageHead
        title="Register"
        sub="Every hazard across every work type, in one flat list — for audit and export. Manage hazards from Work Types."
        actions={<>
          <Search placeholder="Search hazards" width={260} value={query} onChange={setQuery} />
          <Btn variant="ghost" icon="download">Export CSV</Btn>
        </>}
      />
      <DataTable columns={cols} rows={rows} rowKey="id" onRow={(r) => navigate(`/risk/register/${r.id}`)} empty="No hazards match this search." />
    </div>
  );
}
