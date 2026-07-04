import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import type { MouseEvent, ReactNode } from 'react';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

export function Drawer({ open, onClose, children, width = 460 }: DrawerProps) {
  const breakpoint = useBreakpoint();
  if (!open) return null;
  const fullScreen = breakpoint === 'mobile';

  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.34)', zIndex: 60, display: 'flex', justifyContent: fullScreen ? 'stretch' : 'flex-end' }}
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
