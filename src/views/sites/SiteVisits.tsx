import { useParams, useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { Eyebrow, Avatar, Badge, DataTable, SignalMix, type Column } from '@/components';
import { SiteHeader } from './SiteHeader';
import { SITES } from '@/data/sites';
import { VISITS } from '@/data/visits';
import type { Visit } from '@/types';

export function SiteVisits() {
  const { id } = useParams();
  const navigate = useNavigate();
  const s = SITES.find((x) => x.id === id) || SITES[0];
  const visits = VISITS.filter((v) => v.siteName === s.name);
  const upcoming = visits.filter((v) => v.state === 'upcoming');
  const past = visits.filter((v) => v.state === 'past');

  const upcomingCols: Column<Visit>[] = [
    { key: 'visitor', label: 'Visitor', w: 180, render: (r) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Avatar name={r.visitor} size={24} /> {r.visitor}</span> },
    { key: 'when', label: 'When', w: 180, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.when}</span> },
    { key: 'briefing', label: 'Briefing', w: 120, render: (r) => r.briefing === 'ready' ? <Badge tone="success" icon="check">Ready</Badge> : <Badge tone="warning">Pending</Badge> },
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
      <Eyebrow>Upcoming · {upcoming.length}</Eyebrow>
      <div style={{ marginBottom: 24 }}>
        <DataTable columns={upcomingCols} rows={upcoming} rowKey="id" onRow={(r) => navigate(`/visits/${r.id}`)} empty="No upcoming visits scheduled at this site." />
      </div>
      <Eyebrow>Past · {past.length}</Eyebrow>
      <DataTable columns={pastCols} rows={past} rowKey="id" onRow={(r) => navigate(`/visits/${r.id}`)} empty="No past visits recorded at this site." />
    </div>
  );
}
