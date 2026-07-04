import { colors, softTone } from '@/tokens';
import { Icon } from '@/components';

export interface AttnRowProps {
  icon: string;
  hue: string;
  title: string;
  meta: string;
  onClick?: () => void;
  last?: boolean;
}

export function AttnRow({ icon, hue, title, meta, onClick, last }: AttnRowProps) {
  return (
    <div className="a-row" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderBottom: last ? 'none' : `1px solid ${colors.ruleSoft}`, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: softTone(hue), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={17} color={hue} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, color: colors.ink, lineHeight: 1.35 }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 2, fontWeight: 500 }}>{meta}</div>
      </div>
      <Icon name="chevron_right" size={18} color={colors.inkMuted} />
    </div>
  );
}
