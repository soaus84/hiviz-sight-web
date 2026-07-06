import { useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { colors } from '@/tokens';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Drawer } from '@/components';
import { ActiveUserProvider } from '@/state/ActiveUser';
import { PurviewScopeProvider } from '@/state/PurviewScope';
import { insightsFitToHeight, type InsightsView } from '@/views/insights/insightsLayout';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { PurviewBanner } from './PurviewBanner';

export function AppShell() {
  const breakpoint = useBreakpoint();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Only Insights' desktop List view uses a fixed-height, internally-
  // scrolling master-detail layout. Forcing height:100% regardless of
  // breakpoint/view made .a-scroll's bottom padding get overlapped by
  // overflowing content instead of appearing after it — so this mirrors
  // Insights.tsx's own fitToHeight condition exactly (shared helper so the
  // two can't drift apart again).
  const insightsView: InsightsView = new URLSearchParams(location.search).get('view') === 'board' ? 'board' : 'list';
  const fitToHeight = location.pathname.startsWith('/insights') && insightsFitToHeight(insightsView, breakpoint);

  return (
    <ActiveUserProvider>
      <PurviewScopeProvider>
        <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: colors.bg }}>
          {breakpoint !== 'mobile' && <Sidebar collapsed={breakpoint === 'tablet'} />}
          {breakpoint === 'mobile' && (
            <Drawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} width={244} fullScreenOnMobile={false} side="left">
              <Sidebar onNavigate={() => setMobileNavOpen(false)} />
            </Drawer>
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
            <Topbar breakpoint={breakpoint} onMenuClick={() => setMobileNavOpen(true)} />
            <PurviewBanner />
            <div ref={scrollRef} className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: breakpoint === 'mobile' ? '18px 16px 40px' : '28px 32px 56px' }}>
              <div style={{ maxWidth: 1280, margin: '0 auto', height: fitToHeight ? '100%' : undefined }}>
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </PurviewScopeProvider>
    </ActiveUserProvider>
  );
}
