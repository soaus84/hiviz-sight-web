import { colors } from '@/tokens';
import { Card, SChip, Btn, Dot, AINote, Avatar, Icon } from '@/components';
import { OBSERVATIONS } from '@/data/observations';
import { energyLabel } from '@/data/observations';
import type { Insight, InsightStatus } from '@/types';

const STATUS: Record<InsightStatus, [string, string]> = {
  review: ['Awaiting support', colors.amber],
  action: ['In action', colors.hiInk],
  closed: ['Closed', colors.green],
};

export function InsightDetail({ i }: { i: Insight }) {
  const hasDetail = !!i.suggested;
  const srcObs = hasDetail
    ? i.sourceObservations!
    : OBSERVATIONS.filter((o) => i.siteNames.includes(o.siteName)).slice(0, 3).map((o) => ({ quote: o.summary, siteName: o.siteName, ago: o.when }));
  const [sl, sh] = STATUS[i.status];

  return (
    <Card pad={24}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <SChip hue={sh}>{sl}</SChip>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, color: colors.inkSoft }}>{i.id}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          · {i.siteNames.length > 1 ? 'Cross-site pattern' : 'Site pattern'}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {i.status === 'review' && <Btn variant="primary" size="sm" icon="check">Support for action</Btn>}
          {i.status === 'action' && <Btn variant="ghost" size="sm" icon="person_add">Assign owner</Btn>}
        </div>
      </div>
      <h2 style={{ fontFamily: 'var(--font-sans)', margin: 0, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2 }}>{i.title}</h2>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
        {i.siteNames.map((s, k) => <SChip key={k} hue={colors.inkSoft} icon="place">{s}</SChip>)}
      </div>

      {i.routed && (
        <div style={{ marginTop: 18 }}>
          <AINote title="Hiviz routed to pipeline">
            Routed automatically — {i.observationCount} unwanted energy events across {i.siteNames.length} sites in 14 days. Barrier assessment flagged degradation on most observations.
          </AINote>
        </div>
      )}

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px' }}>Pattern summary</div>
      <Card pad={16} style={{ boxShadow: 'none', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
          <Dot tone={colors.hi} size={6} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.9, textTransform: 'uppercase', color: colors.inkSoft }}>AI has suggested</span>
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.55, fontWeight: 500 }}>{i.suggested || i.summary}</div>
        {i.suggestedBasis && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${colors.ruleSoft}`, fontFamily: 'var(--font-sans)', fontSize: 12.5, fontStyle: 'italic', color: colors.inkSoft, lineHeight: 1.45 }}>
            {i.suggestedBasis}
          </div>
        )}
      </Card>
      {i.cause && (
        <Card pad={16} style={{ boxShadow: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <Dot tone={colors.hi} size={6} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.9, textTransform: 'uppercase', color: colors.inkSoft }}>Likely systemic cause</span>
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.55, fontWeight: 500 }}>{i.cause}</div>
          {i.causeBasis && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${colors.ruleSoft}`, fontFamily: 'var(--font-sans)', fontSize: 12.5, fontStyle: 'italic', color: colors.inkSoft, lineHeight: 1.45 }}>
              {i.causeBasis}
            </div>
          )}
        </Card>
      )}

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px' }}>Energy classification</div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {i.energyTypes.map((e, k) => <SChip key={k} hue={e === 'none' ? colors.amber : colors.red}>{energyLabel(e)}</SChip>)}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Source observations</span><span style={{ color: colors.inkMuted }}>{srcObs.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {srcObs.map((o, k) => (
          <div key={k} style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '12px 14px' }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, lineHeight: 1.4 }}>“{o.quote}”</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkSoft, marginTop: 7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{o.siteName} · {o.ago}</div>
          </div>
        ))}
      </div>

      {hasDetail && (
        <>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px' }}>Forge Works Map® classification</div>
          {i.fwClassifications!.map((f, k) => (
            <div key={k} style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '12px 14px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700 }}>{f.factor}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, color: colors.inkMuted, textTransform: 'uppercase' }}>{f.domain}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, color: colors.green, marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="check" size={13} color={colors.green} />{f.confidence.toFixed(2)}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontStyle: 'italic', color: colors.inkSoft, lineHeight: 1.45 }}>{f.rationale}</div>
            </div>
          ))}
        </>
      )}

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px' }}>Support for action</div>
      <div style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '4px 14px' }}>
        {(hasDetail ? i.endorsements! : i.supporterInitials.map((s) => ({ name: s, note: 'Backing this for action.' }))).map((e, k, arr) => (
          <div key={k} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: k === arr.length - 1 ? 'none' : `1px solid ${colors.ruleSoft}` }}>
            <Avatar name={e.name} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{e.name}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, marginTop: 2, lineHeight: 1.45, fontWeight: 500 }}>{e.note}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
