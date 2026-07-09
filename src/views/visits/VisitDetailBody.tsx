import { useNavigate, useSearchParams } from 'react-router-dom';
import { colors, type Tone } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Stat, Badge, Drawer, SignalMix, Dot, DataTable, Card, Eyebrow, type Column } from '@/components';
import { INSIGHTS_BY_ID, INSIGHT_KIND_LABEL } from '@/data/insights';
import { OBSERVATIONS, SIGNAL_DISPLAY, energyLabel } from '@/data/observations';
import { ObsDetail } from '@/views/observations/ObsDetail';
import type { Observation, Visit } from '@/types';

const STATUS_LABEL: Record<Observation['status'], [string, Tone]> = {
  enriched: ['Enriched', 'primary'],
  classified: ['Classified', 'success'],
  linked: ['Linked to insight', 'info'],
};

/** The stat grid, briefing, signal mix and observations table shared by
 * both VisitDetail (the full /visits/:id page) and VisitDrawerPanel (the
 * same content opened in a Drawer straight from the Visits list) — only
 * the header/chrome around this differs between the two.
 *
 * `nestedInDrawer` forces the observations table into its stacked-card
 * layout — the Drawer's ~460px width has no room for real columns, but
 * useBreakpoint() still reads "desktop" since the browser window is wide. */
export function VisitDetailBody({ v, nestedInDrawer }: { v: Visit; nestedInDrawer?: boolean }) {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const [params, setParams] = useSearchParams();

  const observations = OBSERVATIONS.filter((o) => o.visitId === v.id);
  const selId = params.get('obs');
  const sel = observations.find((o) => o.id === selId) || null;

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

  const statCols = breakpoint === 'mobile' ? '1fr' : 'repeat(2, 1fr)';

  const cols: Column<Observation>[] = [
    { key: 'id', label: 'ID', w: 96, mono: true, render: (r) => <span style={{ color: colors.inkSoft, fontWeight: 700 }}>{r.id}</span> },
    { key: 'when', label: 'When', w: 110, mono: true, render: (r) => <span style={{ color: colors.inkSoft }}>{r.when}</span> },
    { key: 'summary', label: 'Observation', render: (r) => <span style={{ display: 'block', maxWidth: 460, lineHeight: 1.4, fontWeight: 500 }}>{r.summary}</span> },
    { key: 'signal_type', label: 'Signal', w: 160, render: (r) => { const s = SIGNAL_DISPLAY[r.signal_type]; return <Badge tone={s.tone}>{s.label}</Badge>; } },
    { key: 'energy_type', label: 'Energy', w: 110, mono: true, render: (r) => <span style={{ color: colors.inkSoft, fontSize: 12 }}>{energyLabel(r.energy_type)}</span> },
    { key: 'status', label: 'Status', w: 150, render: (r) => { const [l, t] = STATUS_LABEL[r.status]; return <Badge tone={t} outline>{l}</Badge>; } },
  ];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        {v.state === 'live' && (
          <Badge tone="success" outline>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Dot tone={colors.green} size={6} pulse />Live on site</span>
          </Badge>
        )}
        {v.state === 'upcoming' && (v.briefing === 'ready' ? <Badge tone="success" icon="check">Briefing ready</Badge> : <Badge tone="warning">Briefing pending</Badge>)}
        {v.ledToInsight && <Badge tone="primary" outline icon="lightbulb">Led to insight</Badge>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: statCols, gap: 16, marginBottom: 24, maxWidth: 560 }}>
        <Stat label={v.state === 'live' ? 'Elapsed' : 'Visit date'} value={v.state === 'live' ? (v.elapsed ?? '—') : v.when} icon="schedule" />
        <Stat label="Observations" value={observations.length} icon="visibility" />
      </div>

      {v.state === 'upcoming' && (v.focusNotes || v.relatedInsightIds?.length) && (
        <Card pad={20} style={{ marginBottom: 24 }}>
          <Eyebrow>Briefing</Eyebrow>
          {v.focusNotes && (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: colors.ink, lineHeight: 1.55, fontWeight: 500 }}>{v.focusNotes}</div>
          )}
          {!!v.relatedInsightIds?.length && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: v.focusNotes ? 14 : 0 }}>
              {v.relatedInsightIds.map((id) => {
                const insight = INSIGHTS_BY_ID[id];
                if (!insight) return null;
                const [label, tone] = INSIGHT_KIND_LABEL[insight.kind];
                return (
                  <Badge key={id} tone={tone} outline onClick={() => navigate(`/insights/${id}`)}>
                    {label} · {insight.title}
                  </Badge>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {v.signals && (
        <div style={{ marginBottom: 24 }}>
          <SignalMix s={v.signals} />
        </div>
      )}

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '0 0 12px' }}>
        Observations from this visit · {observations.length}
      </div>
      <DataTable columns={cols} rows={observations} rowKey="id" onRow={(r) => openObs(r.id)} empty="No observations logged yet for this visit." forceCards={nestedInDrawer} />

      <Drawer open={!!sel} onClose={closeObs}>
        {sel && <ObsDetail o={sel} onClose={closeObs} />}
      </Drawer>
    </>
  );
}
