import { useLocation, useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { Icon, Avatar } from '@/components';
import { CURRENT_USER } from '@/data/currentUser';

const NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { path: '/visits', label: 'Visits', icon: 'event' },
  { path: '/sites', label: 'Sites', icon: 'location_on' },
  { path: '/observations', label: 'Observations', icon: 'visibility' },
  { path: '/insights', label: 'Insights', icon: 'auto_awesome' },
  { path: '/communities', label: 'Communities', icon: 'groups' },
];

export interface SidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ collapsed, onNavigate }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeSection = '/' + location.pathname.split('/')[1];
  const onSettings = activeSection === '/settings';

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <div
      style={{
        width: collapsed ? 72 : 244,
        flexShrink: 0,
        background: colors.side,
        color: colors.sideText,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ padding: collapsed ? '22px 0 18px' : '22px 20px 18px', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: colors.hi, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ width: 11, height: 11, background: colors.hiInk, borderRadius: 2 }} />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700, letterSpacing: -0.3, color: '#fff' }}>Hiviz Sight</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.sideMuted, marginTop: 1 }}>
              Web Console
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: collapsed ? '6px 8px' : '6px 12px', flex: 1, overflowY: 'auto' }}>
        {!collapsed && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.sideMuted, padding: '12px 12px 8px' }}>
            Workspace
          </div>
        )}
        {NAV.map((n) => {
          const on = n.path === activeSection;
          return (
            <button
              key={n.path}
              className="a-nav"
              onClick={() => go(n.path)}
              title={collapsed ? n.label : undefined}
              style={{
                width: '100%',
                minHeight: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 12,
                padding: collapsed ? '10px 0' : '10px 12px',
                marginBottom: 2,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                background: on ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: on ? '#fff' : colors.sideMuted,
                position: 'relative',
              }}
            >
              {on && !collapsed && <span style={{ position: 'absolute', left: -12, top: 8, bottom: 8, width: 3, borderRadius: 99, background: colors.hi }} />}
              <Icon name={n.icon} size={20} weight={on ? 600 : 400} color={on ? colors.hi : colors.sideMuted} fill={on ? 1 : 0} />
              {!collapsed && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: on ? 700 : 600 }}>{n.label}</span>}
            </button>
          );
        })}
      </div>

      <div style={{ padding: collapsed ? '12px 8px' : 12, borderTop: `1px solid ${colors.sideRule}` }}>
        <button
          className="a-nav"
          onClick={() => go('/settings')}
          style={{
            width: '100%',
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 12,
            padding: collapsed ? '9px 0' : '9px 12px',
            marginBottom: 4,
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            background: onSettings ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: onSettings ? '#fff' : colors.sideMuted,
          }}
        >
          <Icon name="settings" size={20} color={onSettings ? colors.hi : colors.sideMuted} fill={onSettings ? 1 : 0} />
          {!collapsed && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600 }}>Settings</span>}
        </button>
        <button
          className="a-nav"
          onClick={() => go('/settings')}
          style={{ width: '100%', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 11, padding: collapsed ? '8px 0' : '8px 10px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', textAlign: 'left', background: 'transparent' }}
        >
          <Avatar name={CURRENT_USER.name} size={34} tone={colors.hi} />
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {CURRENT_USER.name}
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.sideMuted, marginTop: 1 }}>{CURRENT_USER.role}</div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
