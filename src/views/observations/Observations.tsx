import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { colors, type Tone } from '@/tokens';
import { PageHead, Btn, Pills, Search, DataTable, Badge, Drawer, type Column } from '@/components';
import { OBSERVATIONS, SIGNAL_DISPLAY, energyLabel } from '@/data/observations';
import { SITES_BY_ID } from '@/data/sites';
import { inPurview, purviewPhrase } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';
import { ObsDetail } from './ObsDetail';
import type { Observation, SignalType } from '@/types';

const STATUS_LABEL: Record<Observation['status'], [string, Tone]> = {
  enriched: ['Enriched', 'primary'],
  classified: ['Classified', 'success'],
  linked: ['Linked to insight', 'info'],
};

export function Observations() {
  const { region, division, isAllRegions, isAllDivisions } = usePurviewScope();
  const [params, setParams] = useSearchParams();
  const signal = (params.get('signal') as SignalType | 'all') || 'all';
  const query = params.get('q') || '';
  const selId = params.get('id');
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
  const openObs = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('id', id);
    setParams(next);
  };
  const closeObs = () => {
    const next = new URLSearchParams(params);
    next.delete('id');
    setParams(next);
  };

  const rows = useMemo(
    () => OBSERVATIONS
      .filter((o) => { const site = SITES_BY_ID[o.siteId]; return !!site && inPurview(site, { region, division }); })
      .filter((o) => signal === 'all' || o.signal_type === signal)
      .filter((o) => !query || o.summary.toLowerCase().includes(query.toLowerCase()) || o.siteName.toLowerCase().includes(query.toLowerCase())),
    [region, division, signal, query],
  );

  const showScopeTag = isAllRegions || isAllDivisions;

  const cols: Column<Observation>[] = [
    { key: 'id', label: 'ID', w: 96, mono: true, render: (r) => <span style={{ color: colors.inkSoft, fontWeight: 700 }}>{r.id}</span> },
    { key: 'when', label: 'When', w: 104, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.when}</span> },
    { key: 'siteName', label: 'Site', w: 170, render: (r) => (
      <div>
        <div style={{ fontWeight: 600 }}>{r.siteName}</div>
        {showScopeTag && (
          <div style={{ fontSize: 11, color: colors.inkMuted, marginTop: 1 }}>
            {[isAllRegions ? SITES_BY_ID[r.siteId]?.region : null, isAllDivisions ? SITES_BY_ID[r.siteId]?.division : null].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>
    ) },
    { key: 'summary', label: 'Observation', render: (r) => <span style={{ display: 'block', maxWidth: 420, lineHeight: 1.4, fontWeight: 500 }}>{r.summary}</span> },
    { key: 'signal_type', label: 'Signal', w: 160, render: (r) => { const s = SIGNAL_DISPLAY[r.signal_type]; return <Badge tone={s.tone}>{s.label}</Badge>; } },
    { key: 'energy_type', label: 'Energy', w: 110, mono: true, render: (r) => <span style={{ color: colors.inkSoft, fontSize: 12 }}>{energyLabel(r.energy_type)}</span> },
    { key: 'status', label: 'Status', w: 150, render: (r) => { const [l, t] = STATUS_LABEL[r.status]; return <Badge tone={t} outline>{l}</Badge>; } },
  ];

  return (
    <div>
      <PageHead title="Observations" sub={`The full stream of field captures across every site in ${purviewPhrase(region, division)}. Filter, review and follow the ones that connect into a pattern.`} actions={<Btn variant="ghost" icon="download">Export CSV</Btn>} />
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
      <DataTable columns={cols} rows={rows} rowKey="id" onRow={(r) => openObs(r.id)} empty={`No observations in ${purviewPhrase(region, division)} match these filters.`} />

      <Drawer open={!!sel} onClose={closeObs}>
        {sel && <ObsDetail o={sel} onClose={closeObs} />}
      </Drawer>
    </div>
  );
}
