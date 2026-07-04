import { useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Drawer } from '@/components';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  const breakpoint = useBreakpoint();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: colors.bg }}>
      {breakpoint !== 'mobile' && <Sidebar collapsed={breakpoint === 'tablet'} />}
      {breakpoint === 'mobile' && (
        <Drawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} width={244}>
          <Sidebar onNavigate={() => setMobileNavOpen(false)} />
        </Drawer>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        <Topbar breakpoint={breakpoint} onMenuClick={() => setMobileNavOpen(true)} />
        <div ref={scrollRef} className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: breakpoint === 'mobile' ? '18px 16px 40px' : '28px 32px 56px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
