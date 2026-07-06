import { useState } from 'react';
import { colors } from '@/tokens';
import { IconBtn } from '@/components';
import { NOTIF_UNREAD } from '@/data/notifications';
import { NotifMenu } from './NotifMenu';
import { PurviewSwitcher } from './PurviewSwitcher';
import { UserSwitcher } from './UserSwitcher';
import type { Breakpoint } from '@/hooks/useBreakpoint';

export interface TopbarProps {
  breakpoint: Breakpoint;
  onMenuClick?: () => void;
}

export function Topbar({ breakpoint, onMenuClick }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
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

      <PurviewSwitcher />
      <div style={{ flex: 1 }} />
      <div style={{ position: 'relative' }}>
        <IconBtn name="notifications" badge={NOTIF_UNREAD} active={notifOpen} onClick={() => setNotifOpen((v) => !v)} />
        {notifOpen && (
          <>
            <div onClick={() => setNotifOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
            <NotifMenu onClose={() => setNotifOpen(false)} />
          </>
        )}
      </div>
      <UserSwitcher />
    </div>
  );
}
