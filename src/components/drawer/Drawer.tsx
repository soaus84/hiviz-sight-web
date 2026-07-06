import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import type { MouseEvent, ReactNode } from 'react';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  /** Detail panels should go fullscreen on mobile (no room for a narrow side
   * panel), but an off-canvas nav menu needs the opposite — a narrower panel
   * that leaves dead space to tap and dismiss. */
  fullScreenOnMobile?: boolean;
  /** Content/detail panels slide in from the right; nav menus conventionally
   * open from the left. */
  side?: 'left' | 'right';
}

export function Drawer({ open, onClose, children, width = 460, fullScreenOnMobile = true, side = 'right' }: DrawerProps) {
  const breakpoint = useBreakpoint();
  if (!open) return null;
  const fullScreen = breakpoint === 'mobile' && fullScreenOnMobile;

  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.34)', zIndex: 60, display: 'flex', justifyContent: fullScreen ? 'stretch' : side === 'left' ? 'flex-start' : 'flex-end' }}
    >
      <div
        onClick={stop}
        className={fullScreen ? 'a-drawer-full' : 'a-drawer'}
        style={{
          width: fullScreen ? '100%' : width,
          maxWidth: fullScreen ? '100%' : '92vw',
          height: '100%',
          background: colors.panel,
          boxShadow: 'var(--shadow-popover)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </div>
  );
}
