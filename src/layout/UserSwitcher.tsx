import { useState } from 'react';
import { colors } from '@/tokens';
import { Avatar, Icon } from '@/components';
import { useActiveUser } from '@/state/ActiveUser';

export function UserSwitcher() {
  const [open, setOpen] = useState(false);
  const { user, users, setUser } = useActiveUser();

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen((v) => !v)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
        <Avatar name={user.name} size={38} tone={colors.hi} />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
          <div
            className="a-pop"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 6,
              width: 260,
              background: colors.panel,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-popover)',
              zIndex: 70,
              overflow: 'hidden',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.inkMuted, padding: '10px 14px 6px' }}>
              Preview as
            </div>
            {users.map((u) => {
              const on = u.name === user.name;
              const purviewBits = [u.region, u.division].filter(Boolean).join(' · ');
              return (
                <button
                  key={u.name}
                  onClick={() => { setUser(u); setOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', background: on ? colors.fill : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <Avatar name={u.name} size={32} tone={on ? colors.hi : undefined} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, color: colors.ink }}>{u.name}</div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: colors.inkSoft, marginTop: 1 }}>{u.role}{purviewBits ? ` · ${purviewBits}` : ''}</div>
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
