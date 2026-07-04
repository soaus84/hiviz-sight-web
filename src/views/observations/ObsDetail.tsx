import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { IconBtn, SChip, AINote, Card } from '@/components';
import { SIGNAL_DISPLAY, energyLabel } from '@/data/observations';
import { Fact } from './Fact';
import type { Observation } from '@/types';

const STATUS_LABEL: Record<Observation['status'], [string, string]> = {
  enriched: ['Enriched', colors.hiInk],
  classified: ['Classified', colors.green],
  linked: ['Linked to insight', colors.blue],
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
        <SChip hue={s.hue}>{s.label}</SChip>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: colors.inkSoft }}>{o.id}</span>
        <IconBtn name="close" onClick={onClose} />
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.3 }}>{o.summary}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: colors.inkSoft, marginTop: 8, fontWeight: 500 }}>{o.siteName} · {o.when}</div>

        <div style={{ marginTop: 18 }}>
          <AINote title="Hiviz classification">
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 9 }}>
              <SChip hue={colors.ink}>{energyLabel(o.energy_type)}</SChip>
              <SChip hue={s.hue}>{o.signal_type}</SChip>
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
            <button
              onClick={() => { onClose(); navigate(`/insights/${o.linkedInsightId}`); }}
              className="a-btn a-btn-ghost"
              style={{ fontFamily: 'var(--font-sans)', width: '100%', height: 38, borderRadius: 'var(--radius-md)', background: 'transparent', color: colors.ink, border: `1px solid ${colors.rule}`, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
            >
              View the linked insight
            </button>
          </div>
        )}
      </div>
    </>
  );
}
