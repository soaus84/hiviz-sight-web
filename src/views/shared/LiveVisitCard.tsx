import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { Dot, Icon, SignalMix } from '@/components';
import type { Visit } from '@/types';

export function LiveVisitCard({ v }: { v: Visit }) {
  const navigate = useNavigate();
  return (
    <div style={{ background: colors.ink, borderRadius: 'var(--radius-xl)', padding: 20, color: '#fff', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Dot tone={colors.green} size={8} pulse />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.green }}>Live on site</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', marginLeft: 'auto' }}>{v.elapsed}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>{v.siteName}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 3, fontWeight: 500 }}>{v.visitor} · {v.region}</div>
      <div style={{ display: 'flex', gap: 26, marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700 }}>{v.observationCount}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>Observations</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginTop: 2 }}><SignalMix s={v.signals} /></div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: 7 }}>Signal mix</div>
        </div>
        <button
          onClick={() => navigate('/visits')}
          className="a-btn"
          style={{ fontFamily: 'var(--font-sans)', alignSelf: 'center', height: 38, padding: '0 16px', borderRadius: 'var(--radius-md)', background: colors.hi, color: colors.hiInk, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          Open visit <Icon name="arrow_forward" size={16} />
        </button>
      </div>
    </div>
  );
}
