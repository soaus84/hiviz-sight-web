import { colors, type Tone } from '@/tokens';
import { Badge, Icon, ListRow } from '@/components';

export interface AttnRowProps {
  label: string;
  tone: Tone;
  title: string;
  meta: string;
  onClick?: () => void;
  last?: boolean;
  /** Current keyboard-nav position (see useListKeyNav) — arrow keys move
   * this, Enter/Space activates it. Not the same thing as "selected" on a
   * split-pane card: there's no persistent selection here, just where the
   * arrow keys currently are. */
  focused?: boolean;
}

export function AttnRow({ label, tone, title, meta, onClick, last, focused }: AttnRowProps) {
  return (
    <ListRow
      last={last}
      gap={13}
      padding="13px 10px"
      onClick={onClick}
      style={focused ? { background: colors.fill, borderRadius: 'var(--radius-md)', boxShadow: `inset 0 0 0 1.5px ${colors.ink}` } : undefined}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <Badge tone={tone} outline>{label}</Badge>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, color: colors.ink, lineHeight: 1.35, marginTop: 7 }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 2, fontWeight: 500 }}>{meta}</div>
      </div>
      <Icon name="chevron_right" size={18} color={colors.inkMuted} />
    </ListRow>
  );
}
