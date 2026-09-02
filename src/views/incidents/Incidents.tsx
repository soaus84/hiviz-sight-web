import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Btn, Pills, Search, DataTable, Badge, Drawer, type Column } from '@/components';
import { INCIDENTS, incidentInRegion } from '@/data/incidents';
import { purviewPhrase } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';
import { IncidentDetail } from './IncidentDetail';
import { INCIDENT_STATUS_DISPLAY, INCIDENT_TYPE_LABEL, SEVERITY_DISPLAY } from './incidentDisplay';
import type { Incident, IncidentStatus } from '@/types';

export function Incidents() {
  const { region, division } = usePurviewScope();
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') as IncidentStatus | 'all') || 'all';
  const query = params.get('q') || '';
  const selId = params.get('id');
  // Not memoized — INCIDENTS is a plain mutable array (status transitions
  // replace elements in place, see data/incidents.ts), same reasoning as
  // Insights.tsx. Cheap at this scale.
  const sel = INCIDENTS.find((i) => i.id === selId) || null;
  const [, bump] = useState(0);

  const setStatus = (k: string) => {
    const next = new URLSearchParams(params);
    if (k === 'all') next.delete('status'); else next.set('status', k);
    setParams(next, { replace: true });
  };
  const setQuery = (v: string) => {
    const next = new URLSearchParams(params);
    if (!v) next.delete('q'); else next.set('q', v);
    setParams(next, { replace: true });
  };
  const openIncident = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('id', id);
    setParams(next);
  };
  const closeIncident = () => {
    const next = new URLSearchParams(params);
    next.delete('id');
    setParams(next);
  };

  const inRegion = INCIDENTS.filter((i) => incidentInRegion(i, { region, division }));
  const rows = inRegion
    .filter((i) => status === 'all' || i.status === status)
    .filter((i) => !query || i.description.toLowerCase().includes(query.toLowerCase()) || i.siteName.toLowerCase().includes(query.toLowerCase()));

  const cols: Column<Incident>[] = [
    { key: 'id', label: 'ID', w: 96, mono: true, render: (r) => <span style={{ color: colors.inkSoft, fontWeight: 700 }}>{r.id}</span> },
    { key: 'when', label: 'When', w: 104, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.when}</span> },
    { key: 'siteName', label: 'Site', w: 170, render: (r) => <span style={{ fontWeight: 600 }}>{r.siteName}</span> },
    { key: 'description', label: 'Incident', render: (r) => <span style={{ display: 'block', maxWidth: 400, lineHeight: 1.4, fontWeight: 500 }}>{r.description}</span> },
    { key: 'incidentType', label: 'Type', w: 140, render: (r) => <Badge tone="primary" outline>{INCIDENT_TYPE_LABEL[r.incidentType]}</Badge> },
    { key: 'severityClass', label: 'Severity', w: 110, render: (r) => { const s = SEVERITY_DISPLAY[r.severityClass]; return <Badge tone={s.tone}>{s.label}</Badge>; } },
    { key: 'status', label: 'Status', w: 190, render: (r) => { const s = INCIDENT_STATUS_DISPLAY[r.status]; return <Badge tone={s.tone} outline>{s.label}</Badge>; } },
  ];

  return (
    <div>
      <PageHead title="Incidents" sub={`The full stream of field-reported incidents across every site in ${purviewPhrase(region, division)}. Filter, review and route the severe ones to investigation.`} actions={<Btn variant="ghost" icon="download">Export CSV</Btn>} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <Pills
          value={status}
          onChange={setStatus}
          items={[
            { k: 'all', label: 'All', n: inRegion.length },
            { k: 'severe', label: 'Severe', n: inRegion.filter((i) => i.status === 'severe').length },
            { k: 'reported', label: 'Reported', n: inRegion.filter((i) => i.status === 'reported').length },
            { k: 'linked', label: 'Linked', n: inRegion.filter((i) => i.status === 'linked').length },
            { k: 'acknowledged', label: 'Acknowledged', n: inRegion.filter((i) => i.status === 'acknowledged').length },
          ]}
        />
        <Search placeholder="Search incidents" width={260} value={query} onChange={setQuery} />
      </div>
      <DataTable columns={cols} rows={rows} rowKey="id" onRow={(r) => openIncident(r.id)} empty={`No incidents in ${purviewPhrase(region, division)} match these filters.`} />

      <Drawer open={!!sel} onClose={closeIncident}>
        {sel && <IncidentDetail i={sel} onClose={closeIncident} onChanged={() => bump((v) => v + 1)} />}
      </Drawer>
    </div>
  );
}
