import { breakpoints } from '@/tokens';
import { useMediaQuery } from './useMediaQuery';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/** mobile: <840px · tablet: 840-1279px (narrow desktop) · desktop: >=1280px */
export function useBreakpoint(): Breakpoint {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.mobile - 1}px)`);
  const isTablet = useMediaQuery(`(min-width: ${breakpoints.mobile}px) and (max-width: ${breakpoints.tablet - 1}px)`);
  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}
