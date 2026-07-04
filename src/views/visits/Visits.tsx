import { useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { PageHead, Tabs, Btn, Card, Eyebrow, Avatar, SChip, DataTable, SignalMix, type Column } from '@/components';
import { LiveVisitCard } from '@/views/shared/LiveVisitCard';
import { VISITS } from '@/data/visits';
import type { Visit } from '@/types';

type VisitTab = 'active' | 'upcoming' | 'past';
const VALID_TABS: VisitTab[] = ['active', 'upcoming', 'past'];

export function Visits() {
  const [params, setParams] = useSearchParams();
  const breakpoint = useBreakpoint();
  const tabParam = params.get('tab');
  const tab = (VALID_TABS as string[]).includes(tabParam || '') ? (tabParam as VisitTab) : 'active';
  const setTab = (k: string) => setParams(k === 'active' ? {} : { tab: k });

  const counts = {
    active: VISITS.filter((v) => v.state === 'live').length,
    upcoming: VISITS.filter((v) => v.state === 'upcoming').length,
    past: VISITS.filter((v) => v.state === 'past').length,
  };
  const live = VISITS.find((v) => v.state === 'live');
  const upcoming = VISITS.filter((v) => v.state === 'upcoming');
  const past = VISITS.filter((v) => v.state === 'past');

  const upcomingCols: Column<Visit>[] = [
    { key: 'siteName', label: 'Site', render: (r) => <span style={{ fontWeight: 600 }}>{r.siteName}</span> },
    { key: 'region', label: 'Region', w: 150, render: (r) => <span style={{ color: colors.inkSoft }}>{r.region}</span> },
    { key: 'visitor', label: 'Visitor', w: 160, render: (r) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Avatar name={r.visitor} size={24} /> {r.visitor}</span> },
    { key: 'when', label: 'When', w: 180, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.when}</span> },
    { key: 'briefing', label: 'Briefing', w: 120, render: (r) => r.briefing === 'ready' ? <SChip hue={colors.green} icon="check">Ready</SChip> : <SChip hue={colors.amber}>Pending</SChip> },
  ];
  const pastCols: Column<Visit>[] = [
    { key: 'siteName', label: 'Site', render: (r) => <span style={{ fontWeight: 600 }}>{r.siteName}</span> },
    { key: 'visitor', label: 'Visitor', w: 160, render: (r) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Avatar name={r.visitor} size={24} /> {r.visitor}</span> },
    { key: 'when', label: 'When', w: 130, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.when}</span> },
    { key: 'observationCount', label: 'Obs', w: 70, mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{r.observationCount}</span> },
    { key: 'signals', label: 'Signal mix', w: 150, render: (r) => <SignalMix s={r.signals} /> },
    { key: 'outcome', label: '', w: 150, render: (r) => r.ledToInsight ? <SChip hue={colors.hiInk} icon="auto_awesome">Led to insight</SChip> : null },
  ];

  return (
    <div>
      <PageHead title="Visits" sub="Plan, brief and review site visits across the region." actions={<><Btn variant="ghost" icon="download">Export</Btn><Btn variant="accent" icon="add">Plan a visit</Btn></>} />
      <Tabs value={tab} onChange={setTab} items={[{ k: 'active', label: 'Active', n: counts.active }, { k: 'upcoming', label: 'Upcoming', n: counts.upcoming }, { k: 'past', label: 'Past', n: counts.past }]} />

      {tab === 'active' && (
        <div style={{ display: 'grid', gridTemplateColumns: breakpoint === 'desktop' ? '1fr 1fr' : '1fr', gap: 16 }}>
          {live && <LiveVisitCard v={live} />}
          {upcoming[0] && (
            <Card pad={20} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Eyebrow>Next up</Eyebrow>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 700 }}>{upcoming[0].siteName}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkSoft, marginTop: 3, fontWeight: 500 }}>{upcoming[0].when} · {upcoming[0].region}</div>
              <div style={{ marginTop: 14 }}><Btn variant="ghost" size="sm" iconRight="arrow_forward">Review briefing</Btn></div>
            </Card>
          )}
        </div>
      )}
      {tab === 'upcoming' && <DataTable columns={upcomingCols} rows={upcoming} rowKey="id" />}
      {tab === 'past' && <DataTable columns={pastCols} rows={past} rowKey="id" />}
    </div>
  );
}
