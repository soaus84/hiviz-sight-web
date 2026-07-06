import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { Icon } from '@/components';
import { WORKSPACES, type Workspace } from './workspaces';

export interface WorkspaceSwitcherProps {
  active: Workspace;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function WorkspaceSwitcher({ active, collapsed, onNavigate }: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const select = (w: Workspace) => {
    setOpen(false);
    navigate(w.home);
    onNavigate?.();
  };

  return (
    <div style={{ position: 'relative', padding: collapsed ? '0 8px 14px' : '0 12px 14px' }}>
      <button
        className="a-nav"
        onClick={() => setOpen((v) => !v)}
        title={collapsed ? `Workspace: ${active.label}` : undefined}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 9,
          padding: collapsed ? '9px 0' : '9px 10px',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${colors.sideRule}`,
          background: 'rgba(255,255,255,0.04)',
          cursor: 'pointer',
        }}
      >
        <Icon name={active.icon} size={17} color={colors.hi} fill={1} />
        {!collapsed && (
          <>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700, color: '#fff', flex: 1, textAlign: 'left' }}>{active.label}</span>
            <Icon name="unfold_more" size={16} color={colors.sideMuted} />
          </>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
          <div
            className="a-pop"
            style={{
              position: 'absolute',
              top: '100%',
              left: collapsed ? 8 : 12,
              marginTop: 6,
              width: 240,
              background: colors.panel,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-popover)',
              zIndex: 70,
              overflow: 'hidden',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.inkMuted, padding: '10px 14px 6px' }}>
              Switch workspace
            </div>
            {WORKSPACES.map((w) => {
              const on = w.id === active.id;
              return (
                <button
                  key={w.id}
                  onClick={() => select(w)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', background: on ? colors.fill : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: on ? colors.hi : colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={w.icon} size={17} color={on ? colors.hiInk : colors.inkSoft} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, color: colors.ink }}>{w.label}</div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.inkSoft, marginTop: 1 }}>{w.description}</div>
                  </div>
                  {on && <Icon name="check" size={16} color={colors.ink} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
