import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { Pills, Search, DataTable, Badge, Drawer, type Column } from '@/components';
import { SiteHeader } from './SiteHeader';
import { SITES } from '@/data/sites';
import { OBSERVATIONS, SIGNAL_DISPLAY, energyLabel } from '@/data/observations';
import { ObsDetail } from '@/views/observations/ObsDetail';
import type { Observation, SignalType } from '@/types';

export function SiteObservations() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const s = SITES.find((x) => x.id === id) || SITES[0];

  const signal = (params.get('signal') as SignalType | 'all') || 'all';
  const query = params.get('q') || '';
  const selId = params.get('obs');
  const sel = OBSERVATIONS.find((o) => o.id === selId) || null;

  const setSignal = (k: string) => {
    const next = new URLSearchParams(params);
    if (k === 'all') next.delete('signal'); else next.set('signal', k);
    setParams(next, { replace: true });
  };
  const setQuery = (v: string) => {
    const next = new URLSearchParams(params);
    if (!v) next.delete('q'); else next.set('q', v);
    setParams(next, { replace: true });
  };
  const openObs = (obsId: string) => {
    const next = new URLSearchParams(params);
    next.set('obs', obsId);
    setParams(next);
  };
  const closeObs = () => {
    const next = new URLSearchParams(params);
    next.delete('obs');
    setParams(next);
  };

  const rows = useMemo(
    () => OBSERVATIONS
      .filter((o) => o.siteId === s.id)
      .filter((o) => signal === 'all' || o.signal_type === signal)
      .filter((o) => !query || o.summary.toLowerCase().includes(query.toLowerCase())),
    [s.id, signal, query],
  );

  const cols: Column<Observation>[] = [
    { key: 'id', label: 'ID', w: 96, mono: true, render: (r) => <span style={{ color: colors.inkSoft, fontWeight: 700 }}>{r.id}</span> },
    { key: 'when', label: 'When', w: 110, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.when}</span> },
    { key: 'summary', label: 'Observation', render: (r) => <span style={{ display: 'block', maxWidth: 460, lineHeight: 1.4, fontWeight: 500 }}>{r.summary}</span> },
    { key: 'signal_type', label: 'Signal', w: 160, render: (r) => { const d = SIGNAL_DISPLAY[r.signal_type]; return <Badge tone={d.tone}>{d.label}</Badge>; } },
    { key: 'energy_type', label: 'Energy', w: 110, mono: true, render: (r) => <span style={{ color: colors.inkSoft, fontSize: 12 }}>{energyLabel(r.energy_type)}</span> },
  ];

  return (
    <div>
      <SiteHeader s={s} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <Pills
          value={signal}
          onChange={setSignal}
          items={[
            { k: 'all', label: 'All signals' },
            { k: 'barrier_failure', label: 'Barriers' },
            { k: 'weak_signal', label: 'Weak' },
            { k: 'positive_performance', label: 'Positive' },
          ]}
        />
        <Search placeholder="Search observations" width={260} value={query} onChange={setQuery} />
      </div>
      <DataTable columns={cols} rows={rows} rowKey="id" onRow={(r) => openObs(r.id)} empty="No observations match these filters." />

      <Drawer open={!!sel} onClose={closeObs}>
        {sel && <ObsDetail o={sel} onClose={closeObs} />}
      </Drawer>
    </div>
  );
}
