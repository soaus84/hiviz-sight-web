import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/tokens';
import { Icon, IconBtn, Search, Avatar } from '@/components';
import { CURRENT_USER } from '@/data/currentUser';
import { NOTIF_UNREAD } from '@/data/notifications';
import { NotifMenu } from './NotifMenu';
import type { Breakpoint } from '@/hooks/useBreakpoint';

export interface TopbarProps {
  breakpoint: Breakpoint;
  onMenuClick?: () => void;
}

export function Topbar({ breakpoint, onMenuClick }: TopbarProps) {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const isMobile = breakpoint === 'mobile';

  return (
    <div
      style={{
        height: 64,
        flexShrink: 0,
        background: colors.panel,
        borderBottom: `1px solid ${colors.rule}`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: isMobile ? '0 12px' : '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {isMobile && (
        <IconBtn name="menu" onClick={onMenuClick} />
      )}

      {isMobile && mobileSearchOpen ? (
        <>
          <Search placeholder="Search…" width="100%" />
          <IconBtn name="close" onClick={() => setMobileSearchOpen(false)} />
        </>
      ) : (
        <>
          {!isMobile && (
            <button className="a-ws" style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 'var(--radius-md)' }}>
              <Icon name="public" size={18} color={colors.inkSoft} />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700, color: colors.ink }}>Pilbara region</span>
              <Icon name="expand_more" size={18} color={colors.inkMuted} />
            </button>
          )}
          <div style={{ flex: 1 }} />
          {isMobile ? (
            <IconBtn name="search" onClick={() => setMobileSearchOpen(true)} />
          ) : (
            <Search placeholder="Search sites, observations, people…" width={340} />
          )}
          <div style={{ position: 'relative' }}>
            <IconBtn name="notifications" badge={NOTIF_UNREAD} active={notifOpen} onClick={() => setNotifOpen((v) => !v)} />
            {notifOpen && (
              <>
                <div onClick={() => setNotifOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
                <NotifMenu onClose={() => setNotifOpen(false)} />
              </>
            )}
          </div>
          <button onClick={() => navigate('/settings')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Avatar name={CURRENT_USER.name} size={38} tone={colors.hi} />
          </button>
        </>
      )}
    </div>
  );
}
