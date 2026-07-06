import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  argTypes: {
    tone: {
      control: 'select',
      options: ['error', 'warning', 'success', 'info', 'primary', 'hi'],
      description:
        'error = overdue/barrier · warning = at-risk/weak signal · success = positive · info = linked · primary = dark neutral · hi = AI/brand accent (solid only — poor contrast as outline text on a light page).',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The single status-chip/label primitive — formerly split across Badge (solid/outline, closed tone enum) and SChip (soft-tinted wash, arbitrary hue string). SChip was retired: its soft-wash style had no real counterpart in the native app (which only ever uses solid or outline), so all 21 real usages were migrated here. Rule of thumb used in the migration: solid = the primary status/signal a row or card is about (Signal, Visibility, Briefing, Insight status, Access level); outline = a secondary/supplementary tag layered on top (From insight, Digest, Led to insight, site-name chips, energy-type tags, Invited flag).',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {
  args: { children: 'Badge', tone: 'primary', icon: undefined, dot: false, outline: false },
};

export const Solid_PrimaryStatus: Story = {
  name: 'solid — the primary status of a row/card (most common: Signal, Visibility, Briefing, Insight status)',
  render: () => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <Badge tone="error">Barrier failure</Badge>
      <Badge tone="warning">Weak signal</Badge>
      <Badge tone="success">Positive</Badge>
      <Badge tone="warning">Needs review</Badge>
      <Badge tone="info">In action</Badge>
      <Badge tone="success">Briefed</Badge>
    </div>
  ),
};

export const Outline_SecondaryTag: Story = {
  name: 'outline — a supplementary tag layered on already-shown info',
  render: () => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <Badge tone="primary" outline icon="lightbulb">From insight</Badge>
      <Badge tone="info" outline>Digest</Badge>
      <Badge tone="warning" outline>Invited</Badge>
      <Badge tone="primary" outline icon="place">Northgate Open Cut</Badge>
      <Badge tone="error" outline>Kinetic</Badge>
    </div>
  ),
};

export const HiTone_UsedIn1Place: Story = {
  name: 'tone="hi" — the brand/AI accent, used 1×: SiteDetail contact "Primary" badge',
  render: () => <Badge tone="hi">Primary</Badge>,
};

export const WithIconAndDot: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <Badge tone="success" icon="check">Ready</Badge>
      <Badge tone="success" outline icon="circle">Live</Badge>
      <Badge tone="success" dot>Active</Badge>
    </div>
  ),
};
