import { useNavigate } from 'react-router-dom';
import { colors, softTone } from '@/tokens';
import { Icon, Dot } from '@/components';
import { NOTIFS } from '@/data/notifications';
import type { Notification } from '@/types';

export interface NotifMenuProps {
  onClose: () => void;
}

const ROUTE: Record<Notification['to'], string> = {
  insights: '/insights',
  visits: '/visits',
  sites: '/sites',
  communities: '/communities',
};

export function NotifMenu({ onClose }: NotifMenuProps) {
  const navigate = useNavigate();
  const open = (n: Notification) => {
    onClose();
    navigate(ROUTE[n.to]);
  };

  const Row = ({ n, last }: { n: Notification; last: boolean }) => (
    <div
      className="a-row"
      onClick={() => open(n)}
      style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '12px 16px', borderBottom: last ? 'none' : `1px solid ${colors.ruleSoft}`, cursor: 'pointer' }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 99, flexShrink: 0, background: n.chip === 'hi' ? colors.hi : softTone(n.tone), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={n.icon} size={16} color={n.chip === 'hi' ? colors.hiInk : n.tone} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.4, fontWeight: 500 }}>
          <span style={{ fontWeight: 700 }}>{n.subject}</span> {n.verb}
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 2, lineHeight: 1.4, fontWeight: 500 }}>{n.detail}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: colors.inkMuted, fontWeight: 600 }}>{n.when}</span>
        {n.unread && <Dot tone={colors.hi} size={8} />}
      </div>
    </div>
  );

  return (
    <div className="a-pop" style={{ position: 'absolute', top: 48, right: 0, width: 380, maxWidth: '90vw', background: colors.panel, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-popover)', zIndex: 70, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${colors.rule}` }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700 }}>Notifications</span>
        <button className="a-link" style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, color: colors.inkSoft, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Mark all read
        </button>
      </div>
      <div className="a-scroll" style={{ maxHeight: 460, overflowY: 'auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.inkMuted, padding: '11px 16px 5px' }}>Today</div>
        {NOTIFS.today.map((n, i) => <Row key={n.id} n={n} last={i === NOTIFS.today.length - 1} />)}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.inkMuted, padding: '11px 16px 5px', borderTop: `1px solid ${colors.ruleSoft}` }}>
          Earlier this week
        </div>
        {NOTIFS.earlier.map((n, i) => <Row key={n.id} n={n} last={i === NOTIFS.earlier.length - 1} />)}
      </div>
    </div>
  );
}
