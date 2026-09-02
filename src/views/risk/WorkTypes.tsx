import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Search, DataTable, Badge, Icon, InfoTip, type Column } from '@/components';
import { HAZARDS, workTypeIdForBarrierFailure, computeWorkTypeRisk } from '@/data/risk';
import { BARRIER_FAILURES } from '@/data/barrierFailures';
import { SITES } from '@/data/sites';
import { HIGH_RISK_WORK } from '@/data/admin/taxonomies';
import { SEVERITY_DISPLAY } from './riskDisplay';
import { RiskRatingInfo } from './RiskRatingInfo';
import type { SeverityClass } from '@/types';

interface WorkTypeRow {
  id: string;
  name: string;
  icon?: string;
  hazardCount: number;
  rating: SeverityClass | null;
  siteCount: number;
  openFailures: number;
}

/** "The work we do" — scoped to work types actually in play (referenced by
 * at least one site, or already carrying a hazard), not the full 32-entry
 * HIGH_RISK_WORK taxonomy. This is the primary lens into hazard management;
 * the flat Register (Register.tsx) is the secondary, exportable artefact
 * view over the same underlying Hazard/CriticalControl data. */
export function WorkTypes() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const rows: WorkTypeRow[] = useMemo(() => {
    const inUse = HIGH_RISK_WORK.filter((t) => SITES.some((s) => s.workTypeIds.includes(t.id)) || HAZARDS.some((h) => h.workTypeId === t.id));
    return inUse.map((t) => {
      const hazardCount = HAZARDS.filter((h) => h.workTypeId === t.id).length;
      const openFailures = BARRIER_FAILURES.filter((b) => b.status !== 'resolved' && workTypeIdForBarrierFailure(b) === t.id).length;
      return {
        id: t.id, name: t.name, icon: t.icon,
        hazardCount,
        rating: computeWorkTypeRisk(t.id).rating,
        siteCount: SITES.filter((s) => s.workTypeIds.includes(t.id)).length,
        openFailures,
      };
    });
  }, []);

  const filtered = rows.filter((r) => !query || r.name.toLowerCase().includes(query.toLowerCase()));

  const cols: Column<WorkTypeRow>[] = [
    { key: 'name', label: 'Work type', render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={r.icon || 'engineering'} size={17} color={colors.inkSoft} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</span>
      </div>
    ) },
    { key: 'rating', label: 'Risk rating', w: 140, render: (r) => r.rating ? <Badge tone={SEVERITY_DISPLAY[r.rating].tone}>{SEVERITY_DISPLAY[r.rating].label}</Badge> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: colors.inkMuted }}>No hazards yet</span> },
    { key: 'hazardCount', label: 'Hazards', w: 90, align: 'left', mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{r.hazardCount}</span> },
    { key: 'siteCount', label: 'Sites doing this work', w: 160, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.siteCount}</span> },
    { key: 'openFailures', label: 'Open barrier failures', w: 160, render: (r) => r.openFailures > 0 ? <Badge tone="warning">{r.openFailures}</Badge> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: colors.inkMuted }}>None</span> },
    { key: 'go', label: '', w: 44, align: 'right', render: () => <Icon name="chevron_right" size={18} color={colors.inkMuted} /> },
  ];

  return (
    <div>
      <PageHead
        title="Work Types"
        sub="The work actually happening across your sites, and the hazards defined for each — add and manage hazards from here."
        actions={<>
          <InfoTip label="Risk rating"><RiskRatingInfo /></InfoTip>
          <Search placeholder="Search work types" width={260} value={query} onChange={setQuery} />
        </>}
      />
      <DataTable columns={cols} rows={filtered} rowKey="id" onRow={(r) => navigate(`/risk/work-types/${r.id}`)} empty="No work types match this search." />
    </div>
  );
}
