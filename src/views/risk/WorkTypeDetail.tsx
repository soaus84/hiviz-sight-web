import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { colors } from '@/tokens';
import { PageHead, Btn, LinkBtn, Stat, Badge, DataTable, Icon, InfoTip, type Column } from '@/components';
import { HAZARDS, CRITICAL_CONTROLS, WORKSITE_CONTROLS, workTypeIdForBarrierFailure, computeWorkTypeRisk } from '@/data/risk';
import { BARRIER_FAILURES } from '@/data/barrierFailures';
import { SITES } from '@/data/sites';
import { HIGH_RISK_WORK } from '@/data/admin/taxonomies';
import { SEVERITY_DISPLAY, LIKELIHOOD_DISPLAY } from './riskDisplay';
import { RiskRatingInfo } from './RiskRatingInfo';
import { HazardEditDrawer } from './HazardDetail';
import { Section } from '@/views/shared/SectionHeading';
import type { Hazard } from '@/types';

export function WorkTypeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const workType = HIGH_RISK_WORK.find((t) => t.id === id) ?? HIGH_RISK_WORK[0];

  const [, forceRender] = useState(0);
  const [adding, setAdding] = useState(false);

  const hazards = HAZARDS.filter((h) => h.workTypeId === workType.id);
  const hazardIds = new Set(hazards.map((h) => h.id));
  const controls = CRITICAL_CONTROLS.filter((c) => hazardIds.has(c.hazardId));
  const controlIds = new Set(controls.map((c) => c.id));
  const instances = WORKSITE_CONTROLS.filter((wc) => controlIds.has(wc.criticalControlId));
  const activeCount = instances.filter((wc) => wc.status === 'active').length;
  const coverage = instances.length === 0 ? null : Math.round((activeCount / instances.length) * 100);
  const sitesDoingWork = SITES.filter((s) => s.workTypeIds.includes(workType.id));
  const openFailures = BARRIER_FAILURES.filter((b) => b.status !== 'resolved' && workTypeIdForBarrierFailure(b) === workType.id);
  const risk = computeWorkTypeRisk(workType.id);

  const cols: Column<Hazard>[] = [
    { key: 'name', label: 'Hazard', render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="hub" size={17} color={colors.inkSoft} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</span>
      </div>
    ) },
    { key: 'severityClass', label: 'Severity', w: 110, render: (r) => { const s = SEVERITY_DISPLAY[r.severityClass]; return <Badge tone={s.tone}>{s.label}</Badge>; } },
    { key: 'prevention', label: 'Prevention', w: 110, align: 'left', mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{CRITICAL_CONTROLS.filter((c) => c.hazardId === r.id && c.controlType === 'prevention').length}</span> },
    { key: 'mitigation', label: 'Mitigation', w: 110, align: 'left', mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{CRITICAL_CONTROLS.filter((c) => c.hazardId === r.id && c.controlType === 'mitigation').length}</span> },
    { key: 'go', label: '', w: 44, align: 'right', render: () => <Icon name="chevron_right" size={18} color={colors.inkMuted} /> },
  ];

  return (
    <div>
      <LinkBtn icon="arrow_back" size="md" onClick={() => navigate('/risk/work-types')} style={{ marginBottom: 16 }}>All work types</LinkBtn>
      <PageHead
        title={workType.name}
        sub={workType.description}
        actions={<Btn variant="accent" icon="add" onClick={() => setAdding(true)}>Add hazard</Btn>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Stat label="Hazards" value={hazards.length} icon="hub" />
        <Stat label="Sites doing this work" value={sitesDoingWork.length} icon="location_on" />
        <Stat label="Open barrier failures" value={openFailures.length} icon="gpp_bad" />
        <Stat label="Control coverage" value={coverage === null ? '—' : `${coverage}%`} sub={instances.length === 0 ? 'No controls pushed yet' : `${activeCount} of ${instances.length} active`} icon="verified" />
      </div>

      {risk.severity && (
        <Section
          title="Risk rating"
          subtitle="Combined severity and recent-event likelihood for this work type."
          action={<InfoTip><RiskRatingInfo /></InfoTip>}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: 6 }}>Severity</div>
              <Badge tone={SEVERITY_DISPLAY[risk.severity].tone}>{SEVERITY_DISPLAY[risk.severity].label}</Badge>
            </div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 18, color: colors.inkMuted }}>×</span>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: 6 }}>Likelihood</div>
              <Badge tone={LIKELIHOOD_DISPLAY[risk.likelihood].tone}>{LIKELIHOOD_DISPLAY[risk.likelihood].label}</Badge>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.inkSoft, marginTop: 5 }}>{risk.eventCount} event{risk.eventCount === 1 ? '' : 's'} in the last 90 days</div>
            </div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 18, color: colors.inkMuted }}>=</span>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: 6 }}>Risk rating</div>
              <Badge tone={SEVERITY_DISPLAY[risk.rating!].tone}>{SEVERITY_DISPLAY[risk.rating!].label}</Badge>
            </div>
          </div>
        </Section>
      )}

      {sitesDoingWork.length > 0 && (
        <Section title="Sites doing this work" subtitle="Every site currently carrying out this work type.">
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {sitesDoingWork.map((s) => (
              <Badge key={s.id} tone="primary" outline icon="place" onClick={() => navigate(`/sites/${s.id}`)}>{s.name}</Badge>
            ))}
          </div>
        </Section>
      )}

      <Section
        title="Hazards"
        subtitle="Hazards identified for this work type, with control counts."
        action={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700, color: colors.inkMuted }}>{hazards.length}</span>}
        pad={hazards.length === 0 ? 28 : 0}
      >
        {hazards.length === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <Icon name="hub" size={26} color={colors.inkMuted} />
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 700, marginTop: 10 }}>No hazards defined yet</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkSoft, lineHeight: 1.5, maxWidth: 380, margin: '6px auto 16px' }}>
              This work is happening at {sitesDoingWork.length} site{sitesDoingWork.length === 1 ? '' : 's'} with no bowtie defined yet.
            </div>
            <Btn variant="primary" size="sm" icon="add" onClick={() => setAdding(true)}>Add the first hazard</Btn>
          </div>
        ) : (
          <DataTable columns={cols} rows={hazards} rowKey="id" onRow={(r) => navigate(`/risk/register/${r.id}`)} empty="No hazards yet." />
        )}
      </Section>

      {adding && (
        <HazardEditDrawer
          hazard={null}
          defaultWorkTypeId={workType.id}
          onClose={() => setAdding(false)}
          onSaved={(hazard) => { setAdding(false); navigate(`/risk/register/${hazard.id}`); }}
          onDeleted={() => { setAdding(false); forceRender((v) => v + 1); }}
        />
      )}
    </div>
  );
}
