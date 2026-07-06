import { colors, type Tone } from '@/tokens';
import { Badge, Icon, ListRow } from '@/components';

export interface AttnRowProps {
  label: string;
  tone: Tone;
  title: string;
  meta: string;
  onClick?: () => void;
  last?: boolean;
}

export function AttnRow({ label, tone, title, meta, onClick, last }: AttnRowProps) {
  return (
    <ListRow last={last} gap={13} padding="13px 0" onClick={onClick}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Badge tone={tone} outline>{label}</Badge>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, color: colors.ink, lineHeight: 1.35, marginTop: 7 }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 2, fontWeight: 500 }}>{meta}</div>
      </div>
      <Icon name="chevron_right" size={18} color={colors.inkMuted} />
    </ListRow>
  );
}
