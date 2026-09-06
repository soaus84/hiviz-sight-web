import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Pills, Search, DataTable, Badge, Icon, InfoTip, type Column } from '@/components';
import { SITES } from '@/data/sites';
import { inPurview, purviewPhrase } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';
import { computeSiteRisk, implementingControlsCount } from '@/data/risk';
import { SEVERITY_DISPLAY } from './riskDisplay';
import { RiskRatingInfo } from './RiskRatingInfo';

export function RiskSites() {
  const navigate = useNavigate();
  const { region, division } = usePurviewScope();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const inRegion = useMemo(() => SITES.filter((s) => inPurview(s, { region, division })), [region, division]);

  // Computed once per site here rather than inline in the column renderers —
  // both the table cells and the filter pill counts need the same numbers.
  //
  // Deliberately doesn't surface "work types with no control pushed here" —
  // that gap isn't always the site's fault (a control might not have
  // reached it yet for a perfectly good reason) and belongs upstream: on
  // the Work Types list for "no hazard defined at all", and on the
  // control's own card (HazardDetail's "Push to N more sites") for "defined
  // but not yet pushed here". "Pending verification" below IS a site's own gap —
  // it already accepted the control, so finishing the rollout is on them.
  const rows = useMemo(() => inRegion.map((s) => ({
    id: s.id,
    site: s,
    risk: computeSiteRisk(s),
    implementing: implementingControlsCount(s),
  })), [inRegion]);

  const filtered = useMemo(() => {
    return rows
      .filter((r) => filter === 'all' || (filter === 'open' && r.site.openBarrierFailuresCount > 0) || (filter === 'pending' && r.site.pendingControlsCount > 0) || (filter === 'implementing' && r.implementing > 0))
      .filter((r) => !query || r.site.name.toLowerCase().includes(query.toLowerCase()));
  }, [rows, filter, query]);

  const cols: Column<(typeof rows)[number]>[] = [
    { key: 'name', label: 'Site', render: ({ site: r }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="location_on" size={17} color={colors.inkSoft} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>{r.region} · {r.division} · {r.type}</div>
        </div>
      </div>
    ) },
    { key: 'risk', label: 'Risk rating', w: 120, render: ({ risk }) => risk.rating ? <Badge tone={SEVERITY_DISPLAY[risk.rating].tone}>{SEVERITY_DISPLAY[risk.rating].label}</Badge> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: colors.inkMuted }}>—</span> },
    { key: 'openBarrierFailuresCount', label: 'Open barrier failures', w: 170, render: ({ site: r }) => r.openBarrierFailuresCount > 0 ? <Badge tone="warning">{r.openBarrierFailuresCount}</Badge> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: colors.inkMuted }}>None</span> },
    { key: 'pendingControlsCount', label: 'Pending acceptance', w: 150, render: ({ site: r }) => r.pendingControlsCount > 0 ? <Badge tone="info">{r.pendingControlsCount}</Badge> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: colors.inkMuted }}>None</span> },
    { key: 'implementing', label: 'Pending verification', w: 140, render: ({ implementing }) => implementing > 0 ? <Badge tone="info">{implementing}</Badge> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: colors.inkMuted }}>None</span> },
    { key: 'go', label: '', w: 44, align: 'right', render: () => <Icon name="chevron_right" size={18} color={colors.inkMuted} /> },
  ];

  return (
    <div>
      <PageHead
        title="Sites"
        sub={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {`Every worksite in ${purviewPhrase(region, division)}, with its risk rating, outstanding barrier failures and controls still finishing rollout.`}
          <InfoTip><RiskRatingInfo /></InfoTip>
        </span>}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <Pills
          value={filter}
          onChange={setFilter}
          items={[
            { k: 'all', label: 'All', n: inRegion.length },
            { k: 'open', label: 'Open barrier failures', n: inRegion.filter((s) => s.openBarrierFailuresCount > 0).length },
            { k: 'pending', label: 'Pending acceptance', n: inRegion.filter((s) => s.pendingControlsCount > 0).length },
            { k: 'implementing', label: 'Pending verification', n: rows.filter((r) => r.implementing > 0).length },
          ]}
        />
        <Search placeholder="Search sites" width={260} value={query} onChange={setQuery} />
      </div>
      <DataTable columns={cols} rows={filtered} rowKey="id" onRow={(r) => navigate(`/sites/${r.site.id}`)} empty={inRegion.length === 0 ? `No sites in ${purviewPhrase(region, division)} yet.` : 'No sites match these filters.'} />
    </div>
  );
}
