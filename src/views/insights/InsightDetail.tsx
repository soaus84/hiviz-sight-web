import { colors, type Tone } from '@/tokens';
import { Card, Badge, Btn, Dot, Avatar, Icon, ListRow } from '@/components';
import { OBSERVATIONS, SIGNAL_DISPLAY, energyLabel } from '@/data/observations';
import { INSIGHT_KIND_LABEL } from '@/data/insights';
import type { Insight, InsightStatus, Observation } from '@/types';

const STATUS: Record<InsightStatus, [string, Tone]> = {
  review: ['Awaiting support', 'warning'],
  action: ['In action', 'primary'],
  closed: ['Closed', 'success'],
};

/** "Same site" mock stand-in for insights with no explicitly linked
 * observations yet — round-robins across the insight's sites (one from each
 * before taking a second from any) so a cross-site pattern's evidence
 * actually looks cross-site, instead of 3 examples that happen to share
 * whichever site sorts first in the data. */
function fallbackSourceObs(i: Insight): Observation[] {
  const bySite = i.siteNames.map((s) => OBSERVATIONS.filter((o) => o.siteName === s));
  const result: Observation[] = [];
  for (let round = 0; result.length < 3; round++) {
    const before = result.length;
    for (const group of bySite) {
      if (group[round]) result.push(group[round]);
      if (result.length === 3) break;
    }
    if (result.length === before) break;
  }
  return result;
}

export function InsightDetail({ i, onOpenObservation }: { i: Insight; onOpenObservation: (obsId: string) => void }) {
  const hasDetail = !!i.suggested;
  // Prefer observations explicitly linked to this insight; only a handful of
  // insights have that authored yet, so fall back to "same site" as a mock
  // stand-in for the rest rather than showing nothing.
  const linkedObs = OBSERVATIONS.filter((o) => o.linkedInsightId === i.id);
  const srcObs = linkedObs.length > 0 ? linkedObs : fallbackSourceObs(i);
  const [sl, sh] = STATUS[i.status];
  const [kindLabel, kindTone] = INSIGHT_KIND_LABEL[i.kind];

  return (
    <Card pad={24}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <Badge tone={sh}>{sl}</Badge>
        <Badge tone={kindTone} outline>{kindLabel}</Badge>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, color: colors.inkSoft }}>{i.id}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {i.status === 'review' && <Btn variant="primary" size="sm" icon="check">Support for action</Btn>}
          {i.status === 'action' && <Btn variant="ghost" size="sm" icon="person_add">Assign owner</Btn>}
        </div>
      </div>
      <h2 style={{ fontFamily: 'var(--font-sans)', margin: 0, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2 }}>{i.title}</h2>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
        {i.siteNames.map((s, k) => <Badge key={k} tone="primary" outline icon="place">{s}</Badge>)}
      </div>

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
        {i.energyTypes.map((e, k) => <Badge key={k} tone={e === 'none' ? 'warning' : 'error'} outline>{energyLabel(e)}</Badge>)}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 10px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Source observations</span><span style={{ color: colors.inkMuted }}>{srcObs.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {srcObs.map((o) => {
          const s = SIGNAL_DISPLAY[o.signal_type];
          return (
            <div
              key={o.id}
              className="a-card-int"
              onClick={() => onOpenObservation(o.id)}
              style={{ border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10 }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, lineHeight: 1.4 }}>“{o.summary}”</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{o.siteName} · {o.when}</span>
                  <Badge tone={s.tone}>{s.label}</Badge>
                </div>
              </div>
              <Icon name="chevron_right" size={18} color={colors.inkMuted} style={{ marginTop: 2, flexShrink: 0 }} />
            </div>
          );
        })}
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
          <ListRow key={k} last={k === arr.length - 1} padding="12px 0">
            <Avatar name={e.name} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700 }}>{e.name}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkSoft, marginTop: 2, lineHeight: 1.45, fontWeight: 500 }}>{e.note}</div>
            </div>
          </ListRow>
        ))}
      </div>
    </Card>
  );
}
