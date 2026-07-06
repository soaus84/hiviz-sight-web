import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { Icon, Avatar } from '@/components';
import { useActiveUser } from '@/state/ActiveUser';
import { FEED_VISITED_EVENT } from '@/views/communities/unread';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { DrilldownHeader } from './DrilldownHeader';
import { workspaceForPath, activeNavPath } from './workspaces';
import { getDrilldown } from './drilldowns';

export interface SidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ collapsed, onNavigate }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useActiveUser();
  const activeSection = '/' + location.pathname.split('/')[1];
  const onSettings = activeSection === '/settings';
  const workspace = workspaceForPath(location.pathname);
  const drilldown = getDrilldown(location.pathname);
  const nav = drilldown ? drilldown.nav : workspace.nav;
  const activePath = activeNavPath(location.pathname, nav);

  // Nav badges (e.g. Feed's unseen count) read localStorage directly rather
  // than props/context, so this just needs a reason to re-render after a
  // visit is recorded elsewhere in the tree.
  const [, bumpBadges] = useState(0);
  useEffect(() => {
    const onVisited = () => bumpBadges((v) => v + 1);
    window.addEventListener(FEED_VISITED_EVENT, onVisited);
    return () => window.removeEventListener(FEED_VISITED_EVENT, onVisited);
  }, []);

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
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700, letterSpacing: -0.3, color: '#fff' }}>Hiviz</div>
        )}
      </div>

      {drilldown ? (
        <DrilldownHeader icon={drilldown.icon} title={drilldown.title} collapsed={collapsed} />
      ) : (
        <WorkspaceSwitcher active={workspace} collapsed={collapsed} onNavigate={onNavigate} />
      )}

      <div style={{ padding: collapsed ? '6px 8px' : '6px 12px', flex: 1, overflowY: 'auto' }}>
        {nav.map((n) => {
          const on = n.path === activePath;
          const badge = n.badge?.();
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
              <span style={{ position: 'relative', display: 'flex' }}>
                <Icon name={n.icon} size={20} weight={on ? 600 : 400} color={on ? colors.hi : colors.sideMuted} fill={on ? 1 : 0} />
                {collapsed && !!badge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -7,
                      right: -9,
                      minWidth: 15,
                      height: 15,
                      padding: '0 3px',
                      borderRadius: 99,
                      background: colors.hi,
                      color: colors.hiInk,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${colors.side}`,
                    }}
                  >
                    {badge}
                  </span>
                )}
              </span>
              {!collapsed && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: on ? 700 : 600 }}>{n.label}</span>}
              {!collapsed && !!badge && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: 'var(--radius-sm)',
                    background: colors.hi,
                    color: colors.hiInk,
                  }}
                >
                  {badge}
                </span>
              )}
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
          <Avatar name={user.name} size={34} tone={colors.hi} />
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.sideMuted, marginTop: 1 }}>{user.role}</div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
