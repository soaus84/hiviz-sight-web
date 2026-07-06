import { useNavigate } from 'react-router-dom';
import { colors, type Tone } from '@/tokens';
import { IconBtn, Badge, AINote, Card, Btn, Fact } from '@/components';
import { SIGNAL_DISPLAY, energyLabel } from '@/data/observations';
import type { Observation } from '@/types';

const STATUS_LABEL: Record<Observation['status'], [string, Tone]> = {
  enriched: ['Enriched', 'primary'],
  classified: ['Classified', 'success'],
  linked: ['Linked to insight', 'info'],
};

export function ObsDetail({ o, onClose }: { o: Observation; onClose: () => void }) {
  const navigate = useNavigate();
  const s = SIGNAL_DISPLAY[o.signal_type];
  const [statusLabel] = STATUS_LABEL[o.status];

  const classificationNote =
    o.signal_type === 'barrier_failure'
      ? 'A live barrier failure — high confidence. This is checked against other sites the moment it’s submitted.'
      : o.signal_type === 'positive_performance'
      ? 'A control working as designed — captured as a positive to reinforce.'
      : 'An early signal worth watching — flagged for pattern matching across the region.';

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${colors.rule}` }}>
        <Badge tone={s.tone}>{s.label}</Badge>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: colors.inkSoft, flex: 1 }}>{o.id}</span>
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.3 }}>{o.summary}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkSoft, marginTop: 8, fontWeight: 500 }}>{o.siteName} · {o.when}</div>

        <div style={{ marginTop: 18 }}>
          <AINote title="Hiviz classification">
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 9 }}>
              <Badge tone="primary" outline>{energyLabel(o.energy_type)}</Badge>
              <Badge tone={s.tone} outline>{o.signal_type}</Badge>
            </div>
            {classificationNote}
          </AINote>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkSoft, margin: '22px 0 8px' }}>Detail</div>
        <Card pad={16}>
          <Fact k="Reported by" v={o.observerName} />
          <Fact k="Site" v={o.siteName} />
          <Fact k="When" v={o.when} />
          <Fact k="Energy" v={energyLabel(o.energy_type)} />
          <Fact k="Status" v={statusLabel} last />
        </Card>

        {o.status === 'linked' && o.linkedInsightId && (
          <div style={{ marginTop: 16 }}>
            <Btn variant="ghost" full onClick={() => { onClose(); navigate(`/insights/${o.linkedInsightId}`); }}>
              View the linked insight
            </Btn>
          </div>
        )}
      </div>
    </>
  );
}
