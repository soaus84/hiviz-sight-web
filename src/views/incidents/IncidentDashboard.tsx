import { useNavigate, useSearchParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Stat, Badge, LinkBtn, Drawer } from '@/components';
import { SITES } from '@/data/sites';
import { INCIDENTS, incidentInRegion } from '@/data/incidents';
import { INVESTIGATIONS, investigationInRegion } from '@/data/investigations';
import { inPurview, purviewLabel, purviewPhrase } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';
import { AttnRow } from '@/views/shared/AttnRow';
import { Section } from '@/views/shared/SectionHeading';
import { IncidentDetail } from './IncidentDetail';
import { INCIDENT_TYPE_LABEL } from './incidentDisplay';

// Same fixed narrative "now" the rest of the mock data uses.
const MOCK_NOW = new Date('2025-05-07T10:00:00');

export function IncidentDashboard() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { region, division } = usePurviewScope();
  const purview = { region, division };

  const sites = SITES.filter((s) => inPurview(s, purview));
  const incidents = INCIDENTS.filter((i) => incidentInRegion(i, purview));
  const investigations = INVESTIGATIONS.filter((v) => investigationInRegion(v, purview));

  const severe = incidents.filter((i) => i.status === 'severe');
  const openIncidents = incidents.filter((i) => i.status === 'reported' || i.status === 'severe');
  const activeInvestigations = investigations.filter((v) => v.status !== 'closed');
  const incidentsLast7d = incidents.filter((i) => MOCK_NOW.getTime() - new Date(i.occurredAt).getTime() <= 7 * 24 * 60 * 60 * 1000);
  const recent = [...incidents].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()).slice(0, 5);

  const selId = params.get('inc');
  const sel = INCIDENTS.find((i) => i.id === selId) || null;
  const openIncidentDrawer = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('inc', id);
    setParams(next);
  };
  const closeIncidentDrawer = () => {
    const next = new URLSearchParams(params);
    next.delete('inc');
    setParams(next);
  };

  return (
    <div>
      <PageHead
        title="Incident overview"
        sub={`${purviewLabel(region, division)} · ${sites.length} worksite${sites.length === 1 ? '' : 's'}. ${severe.length} incident${severe.length === 1 ? '' : 's'} waiting on your review.`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Stat label="Open incidents" value={openIncidents.length} sub={`${severe.length} severe · pending review`} icon="report" />
        <Stat label="Severe pending review" value={severe.length} icon="warning" />
        <Stat label="Active investigations" value={activeInvestigations.length} sub={`${investigations.filter((v) => v.status === 'closed').length} closed`} icon="search" />
        <Stat label="Incidents · 7d" value={incidentsLast7d.length} icon="calendar_today" />
      </div>

      <Section
        title="Needs your review"
        subtitle="Severe incidents waiting on acknowledgement or investigation."
        action={<LinkBtn onClick={() => navigate('/incidents?status=severe')}>View all</LinkBtn>}
      >
        {severe.map((i) => (
          <AttnRow key={i.id} label={INCIDENT_TYPE_LABEL[i.incidentType]} tone="warning" title={i.description} meta={`${i.siteName} · ${i.when}`} onClick={() => openIncidentDrawer(i.id)} last={i.id === severe[severe.length - 1]?.id} />
        ))}
        {severe.length === 0 && (
          <div style={{ padding: '20px 4px', textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>Nothing needs review in {purviewPhrase(region, division)} right now.</div>
        )}
      </Section>

      <Section
        title="Latest incidents"
        subtitle="The five most recently reported incidents in your purview."
        action={<LinkBtn onClick={() => navigate('/incidents')}>All incidents</LinkBtn>}
        pad={0}
      >
        {recent.map((i, k) => (
          <div key={i.id} onClick={() => openIncidentDrawer(i.id)} className="a-card-int" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: k === recent.length - 1 ? undefined : `1px solid ${colors.ruleSoft}`, cursor: 'pointer' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600 }}>{i.description}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 2, fontWeight: 500 }}>{i.siteName} · {i.when}</div>
            </div>
            <Badge tone="primary" outline>{INCIDENT_TYPE_LABEL[i.incidentType]}</Badge>
          </div>
        ))}
        {recent.length === 0 && (
          <div style={{ padding: '20px 18px', textAlign: 'center', color: colors.inkMuted, fontSize: 13.5, fontWeight: 500 }}>No incidents captured in {purviewPhrase(region, division)} yet.</div>
        )}
      </Section>

      <Drawer open={!!sel} onClose={closeIncidentDrawer}>
        {sel && <IncidentDetail i={sel} onClose={closeIncidentDrawer} />}
      </Drawer>
    </div>
  );
}
