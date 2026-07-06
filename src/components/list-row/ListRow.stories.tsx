import type { Meta, StoryObj } from '@storybook/react';
import { ListRow } from './ListRow';
import { Avatar, Badge, Icon } from '@/components';
import { colors } from '@/tokens';

const meta: Meta<typeof ListRow> = {
  title: 'Primitives/ListRow',
  component: ListRow,
  parameters: {
    docs: {
      description: {
        component:
          'The row shell behind every bordered list in the app: flex row, gap, padding, alignment, and a bottom border that disappears on the last item. Extracted after the same `borderBottom: last ? \'none\' : ...` computation turned up 9 times — 5 recomputed by hand per view (SiteDetail x2, Dashboard, Communities, InsightDetail) and 4 already using a `last` prop on a bespoke row component (Fact, SettingRow, AttnRow, NotifMenu\'s Row) — all now built on this shared shell.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ListRow>;

export const Playground: Story = {
  args: { last: false, gap: 12, padding: '11px 0', align: 'center' },
  render: (args) => (
    <div style={{ maxWidth: 360, border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)' }}>
      <ListRow {...args}>
        <Avatar name="Jordan Marsh" size={32} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>Jordan Marsh</div>
          <div style={{ fontSize: 12, color: colors.inkSoft }}>Region Manager</div>
        </div>
      </ListRow>
    </div>
  ),
};

export const List_LastItemHasNoBorder: Story = {
  name: 'A real list — border disappears on the last row',
  render: () => (
    <div style={{ maxWidth: 360, border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '0 4px' }}>
      {['Jordan Marsh', 'Priya Singh', 'Kim Lee'].map((name, i, arr) => (
        <ListRow key={name} last={i === arr.length - 1}>
          <Avatar name={name} size={28} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{name}</div>
          </div>
          <Badge tone="success">Active</Badge>
        </ListRow>
      ))}
    </div>
  ),
};

export const AlignFlexStart_UsedByFactAndNotifMenu: Story = {
  name: 'align="flex-start" — used when content wraps to multiple lines (Fact, NotifMenu)',
  render: () => (
    <div style={{ maxWidth: 360, border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '0 14px' }}>
      <ListRow last gap={14} align="flex-start">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: colors.inkMuted, width: 110, flexShrink: 0 }}>REPORTED BY</div>
        <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>A longer value that could wrap onto a second line without misaligning the label column.</div>
      </ListRow>
    </div>
  ),
};

export const Clickable: Story = {
  render: () => (
    <div style={{ maxWidth: 360, border: `1px solid ${colors.rule}`, borderRadius: 'var(--radius-lg)', padding: '0 14px' }}>
      <ListRow last onClick={() => {}}>
        <Icon name="flag" size={17} color={colors.amber} />
        <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>Clickable row (cursor + hover only apply when onClick is set)</div>
        <Icon name="chevron_right" size={18} color={colors.inkMuted} />
      </ListRow>
    </div>
  ),
};
