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
  /** This row jumps to a full page instead of drilling into a nested
   * drawer — a leaf's own outbound reference to a hub (e.g. an Incident's
   * "here's the related Investigation" card), never the reverse. Swaps the
   * drill-in chevron for an open-in-new mark so the two kinds of row never
   * look alike — see [[project_linked_entity_pattern]]. */
  external?: boolean;
  /** The entity's own icon (matching its workspace nav icon — e.g. 'report'
   * for Incident, 'search' for Investigation, 'front_hand' for Stop Work —
   * see workspaces.ts) shown as a leading tile, so a row reads at a glance
   * as "this is an Incident" before you even read the badge/title. Every
   * linked-entity reference card passes this; Focus/dashboard rows (whose
   * badge already carries a status, not a type) mostly don't need to. */
  icon?: string;
}

export function AttnRow({ label, tone, title, meta, onClick, last, focused, external, icon }: AttnRowProps) {
  return (
    <ListRow
      last={last}
      gap={13}
      padding="13px 10px"
      onClick={onClick}
      style={focused ? { background: colors.fill, borderRadius: 'var(--radius-md)', boxShadow: `inset 0 0 0 1.5px ${colors.ink}` } : undefined}
    >
      {icon && (
        <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: colors.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={17} color={colors.inkSoft} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Badge tone={tone} outline>{label}</Badge>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, color: colors.ink, lineHeight: 1.35, marginTop: 7 }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: colors.inkSoft, marginTop: 2, fontWeight: 500 }}>{meta}</div>
      </div>
      <Icon name={external ? 'open_in_new' : 'chevron_right'} size={external ? 16 : 18} color={colors.inkMuted} />
    </ListRow>
  );
}
