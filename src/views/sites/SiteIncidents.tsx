import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { Pills, Search, DataTable, Badge, Drawer, type Column } from '@/components';
import { SiteHeader } from './SiteHeader';
import { SITES } from '@/data/sites';
import { INCIDENTS } from '@/data/incidents';
import { IncidentDetail } from '@/views/incidents/IncidentDetail';
import { INCIDENT_STATUS_DISPLAY, INCIDENT_TYPE_LABEL, SEVERITY_DISPLAY } from '@/views/incidents/incidentDisplay';
import type { Incident, IncidentStatus } from '@/types';

export function SiteIncidents() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const s = SITES.find((x) => x.id === id) || SITES[0];

  const status = (params.get('status') as IncidentStatus | 'all') || 'all';
  const query = params.get('q') || '';
  const selId = params.get('inc');
  const sel = INCIDENTS.find((i) => i.id === selId) || null;

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
  const openIncident = (incId: string) => {
    const next = new URLSearchParams(params);
    next.set('inc', incId);
    setParams(next);
  };
  const closeIncident = () => {
    const next = new URLSearchParams(params);
    next.delete('inc');
    setParams(next);
  };

  const rows = useMemo(
    () => INCIDENTS
      .filter((i) => i.siteId === s.id)
      .filter((i) => status === 'all' || i.status === status)
      .filter((i) => !query || i.description.toLowerCase().includes(query.toLowerCase())),
    [s.id, status, query],
  );

  const cols: Column<Incident>[] = [
    { key: 'id', label: 'ID', w: 96, mono: true, render: (r) => <span style={{ color: colors.inkSoft, fontWeight: 700 }}>{r.id}</span> },
    { key: 'when', label: 'When', w: 110, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.when}</span> },
    { key: 'description', label: 'Incident', render: (r) => <span style={{ display: 'block', maxWidth: 460, lineHeight: 1.4, fontWeight: 500 }}>{r.description}</span> },
    { key: 'incidentType', label: 'Type', w: 140, render: (r) => <Badge tone="primary" outline>{INCIDENT_TYPE_LABEL[r.incidentType]}</Badge> },
    { key: 'severityClass', label: 'Severity', w: 110, render: (r) => { const d = SEVERITY_DISPLAY[r.severityClass]; return <Badge tone={d.tone}>{d.label}</Badge>; } },
    { key: 'status', label: 'Status', w: 190, render: (r) => { const d = INCIDENT_STATUS_DISPLAY[r.status]; return <Badge tone={d.tone} outline>{d.label}</Badge>; } },
  ];

  return (
    <div>
      <SiteHeader s={s} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <Pills
          value={status}
          onChange={setStatus}
          items={[
            { k: 'all', label: 'All' },
            { k: 'severe', label: 'Severe' },
            { k: 'reported', label: 'Reported' },
            { k: 'linked', label: 'Linked' },
            { k: 'acknowledged', label: 'Acknowledged' },
          ]}
        />
        <Search placeholder="Search incidents" width={260} value={query} onChange={setQuery} />
      </div>
      <DataTable columns={cols} rows={rows} rowKey="id" onRow={(r) => openIncident(r.id)} empty="No incidents match these filters." />

      <Drawer open={!!sel} onClose={closeIncident}>
        {sel && <IncidentDetail i={sel} onClose={closeIncident} />}
      </Drawer>
    </div>
  );
}
