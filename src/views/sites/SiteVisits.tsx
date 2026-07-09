import { useParams, useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { Tabs, Avatar, Badge, DataTable, Drawer, SignalMix, Dot, type Column } from '@/components';
import { SiteHeader } from './SiteHeader';
import { SITES } from '@/data/sites';
import { VISITS } from '@/data/visits';
import { VisitDrawerPanel } from '@/views/visits/VisitDrawerPanel';
import type { Visit } from '@/types';

type VisitTab = 'upcoming' | 'past';
const VALID_TABS: VisitTab[] = ['upcoming', 'past'];

/** The site-scoped twin of Visits.tsx — same Tabs/live-sorting/Status-column
 * pattern (see that file's comment on the same reasoning for SiteInsights)
 * so the two stay in sync; filtered by site membership instead of purview,
 * with the Site column dropped since it's redundant here. */
export function SiteVisits() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const s = SITES.find((x) => x.id === id) || SITES[0];
  const tabParam = params.get('tab');
  const tab = (VALID_TABS as string[]).includes(tabParam || '') ? (tabParam as VisitTab) : 'upcoming';
  const setTab = (k: string) => setParams(k === 'upcoming' ? {} : { tab: k });

  const visits = VISITS.filter((v) => v.siteName === s.name);
  const counts = {
    upcoming: visits.filter((v) => v.state === 'live' || v.state === 'upcoming').length,
    past: visits.filter((v) => v.state === 'past').length,
  };
  // Live sorts first — see Visits.tsx.
  const upcoming = [...visits.filter((v) => v.state === 'live'), ...visits.filter((v) => v.state === 'upcoming')];
  const past = visits.filter((v) => v.state === 'past');

  const selId = params.get('visit');
  const sel = visits.find((v) => v.id === selId) || null;
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

  const upcomingCols: Column<Visit>[] = [
    { key: 'visitor', label: 'Visitor', w: 180, render: (r) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Avatar name={r.visitor} size={24} /> {r.visitor}</span> },
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
    { key: 'visitor', label: 'Visitor', w: 180, render: (r) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Avatar name={r.visitor} size={24} /> {r.visitor}</span> },
    { key: 'when', label: 'When', w: 140, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.when}</span> },
    { key: 'observationCount', label: 'Obs', w: 70, mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{r.observationCount}</span> },
    { key: 'signals', label: 'Signal mix', w: 150, render: (r) => <SignalMix s={r.signals} /> },
    { key: 'outcome', label: '', w: 150, render: (r) => r.ledToInsight ? <Badge tone="primary" outline icon="lightbulb">Led to insight</Badge> : null },
  ];

  return (
    <div>
      <SiteHeader s={s} />
      <Tabs value={tab} onChange={setTab} items={[{ k: 'upcoming', label: 'Upcoming', n: counts.upcoming }, { k: 'past', label: 'Past', n: counts.past }]} />

      {tab === 'upcoming' && (
        <DataTable columns={upcomingCols} rows={upcoming} rowKey="id" onRow={(r) => openVisit(r.id)} empty="No upcoming visits scheduled at this site." />
      )}
      {tab === 'past' && <DataTable columns={pastCols} rows={past} rowKey="id" onRow={(r) => openVisit(r.id)} empty="No past visits recorded at this site." />}

      <Drawer open={!!sel} onClose={closeVisit}>
        {sel && <VisitDrawerPanel v={sel} onClose={closeVisit} />}
      </Drawer>
    </div>
  );
}
