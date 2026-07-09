import { useNavigate, useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Tabs, Btn, Avatar, Badge, DataTable, Drawer, SignalMix, Dot, type Column } from '@/components';
import { VISITS } from '@/data/visits';
import { inPurview, purviewPhrase } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';
import { VisitDrawerPanel } from './VisitDrawerPanel';
import type { Visit } from '@/types';

type VisitTab = 'upcoming' | 'past';
const VALID_TABS: VisitTab[] = ['upcoming', 'past'];

export function Visits() {
  const navigate = useNavigate();
  const { region, division, isAllRegions, isAllDivisions } = usePurviewScope();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab');
  const tab = (VALID_TABS as string[]).includes(tabParam || '') ? (tabParam as VisitTab) : 'upcoming';
  const setTab = (k: string) => setParams(k === 'upcoming' ? {} : { tab: k });

  const selId = params.get('visit');
  const openVisit = (visitId: string) => {
    const next = new URLSearchParams(params);
    next.set('visit', visitId);
    setParams(next);
  };
  const closeVisit = () => {
    const next = new URLSearchParams(params);
    next.delete('visit');
    setParams(next);
  };

  const inRegion = VISITS.filter((v) => inPurview(v, { region, division }));
  const counts = {
    upcoming: inRegion.filter((v) => v.state === 'live' || v.state === 'upcoming').length,
    past: inRegion.filter((v) => v.state === 'past').length,
  };
  // Live sorts first so it stays the most visible row without needing its
  // own bespoke layout above the table (see the Status column below, which
  // already renders a pulsing "Live" badge for it).
  const upcoming = [...inRegion.filter((v) => v.state === 'live'), ...inRegion.filter((v) => v.state === 'upcoming')];
  const past = inRegion.filter((v) => v.state === 'past');
  const sel = inRegion.find((v) => v.id === selId) || null;

  const scopeCols: Column<Visit>[] = [
    ...(isAllRegions ? [{ key: 'region', label: 'Region', w: 100, render: (r: Visit) => <span style={{ color: colors.inkSoft }}>{r.region}</span> }] : []),
    ...(isAllDivisions ? [{ key: 'division', label: 'Division', w: 100, render: (r: Visit) => <span style={{ color: colors.inkSoft }}>{r.division}</span> }] : []),
  ];

  const upcomingCols: Column<Visit>[] = [
    { key: 'siteName', label: 'Site', render: (r) => <span style={{ fontWeight: 600 }}>{r.siteName}</span> },
    ...scopeCols,
    { key: 'visitor', label: 'Visitor', w: 160, render: (r) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Avatar name={r.visitor} size={24} /> {r.visitor}</span> },
    { key: 'when', label: 'When', w: 180, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.when}</span> },
    {
      key: 'briefing',
      label: 'Status',
      w: 140,
      render: (r) => r.state === 'live'
        ? <Badge tone="success" outline><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Dot tone={colors.green} size={6} pulse />Live</span></Badge>
        : r.briefing === 'ready' ? <Badge tone="success" icon="check">Ready</Badge> : <Badge tone="warning">Pending</Badge>,
    },
  ];
  const pastCols: Column<Visit>[] = [
    { key: 'siteName', label: 'Site', render: (r) => <span style={{ fontWeight: 600 }}>{r.siteName}</span> },
    ...scopeCols,
    { key: 'visitor', label: 'Visitor', w: 160, render: (r) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Avatar name={r.visitor} size={24} /> {r.visitor}</span> },
    { key: 'when', label: 'When', w: 130, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.when}</span> },
    { key: 'observationCount', label: 'Obs', w: 70, mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{r.observationCount}</span> },
    { key: 'signals', label: 'Signal mix', w: 150, render: (r) => <SignalMix s={r.signals} /> },
    { key: 'outcome', label: '', w: 150, render: (r) => r.ledToInsight ? <Badge tone="primary" outline icon="lightbulb">Led to insight</Badge> : null },
  ];

  return (
    <div>
      <PageHead title="Visits" sub={`Plan, brief and review site visits across ${purviewPhrase(region, division)}.`} actions={<><Btn variant="ghost" icon="download">Export</Btn><Btn variant="accent" icon="add" onClick={() => navigate('/visits/new')}>Plan a visit</Btn></>} />
      <Tabs value={tab} onChange={setTab} items={[{ k: 'upcoming', label: 'Upcoming', n: counts.upcoming }, { k: 'past', label: 'Past', n: counts.past }]} />

      {tab === 'upcoming' && (
        <DataTable columns={upcomingCols} rows={upcoming} rowKey="id" onRow={(r) => openVisit(r.id)} empty={`No upcoming visits in ${purviewPhrase(region, division)}.`} />
      )}
      {tab === 'past' && <DataTable columns={pastCols} rows={past} rowKey="id" onRow={(r) => openVisit(r.id)} empty={`No past visits in ${purviewPhrase(region, division)}.`} />}

      <Drawer open={!!sel} onClose={closeVisit}>
        {sel && <VisitDrawerPanel v={sel} onClose={closeVisit} />}
      </Drawer>
    </div>
  );
}
