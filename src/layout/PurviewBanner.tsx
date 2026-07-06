import { colors } from '@/tokens';
import { Icon, LinkBtn } from '@/components';
import { purviewLabel } from '@/data/purview';
import { usePurviewScope } from '@/state/PurviewScope';

export function PurviewBanner() {
  const { region, division, homeRegion, homeDivision, isHome, goHome } = usePurviewScope();
  if (isHome) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 28px', background: colors.hi, flexShrink: 0 }}>
      <Icon name="visibility" size={16} color={colors.hiInk} />
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 700, color: colors.hiInk }}>
        Viewing {purviewLabel(region, division)} — outside your purview ({purviewLabel(homeRegion, homeDivision)})
      </span>
      <div style={{ flex: 1 }} />
      <LinkBtn size="xs" onClick={goHome} style={{ color: colors.hiInk }}>Back to my purview</LinkBtn>
    </div>
  );
}
