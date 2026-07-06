import type { Meta, StoryObj } from '@storybook/react';
import { Dot } from './Dot';
import { colors } from '@/tokens';

const TONE_OPTIONS = ['green', 'amber', 'red', 'blue', 'inkMuted'];
const TONE_MAPPING: Record<string, string> = {
  green: colors.green, amber: colors.amber, red: colors.red, blue: colors.blue, inkMuted: colors.inkMuted,
};

const meta: Meta<typeof Dot> = {
  title: 'Primitives/Dot',
  component: Dot,
  argTypes: {
    tone: {
      control: 'select',
      options: TONE_OPTIONS,
      mapping: TONE_MAPPING,
      description: 'green = live/on-site/positive · amber = pending · red = overdue/barrier · blue = info · inkMuted = neutral/unread-off',
    },
  },
};
export default meta;
type Story = StoryObj<typeof Dot>;

export const Playground: Story = {
  args: { tone: colors.green, size: 8, pulse: false },
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Dot tone={colors.green} />
      <Dot tone={colors.amber} />
      <Dot tone={colors.red} />
      <Dot tone={colors.blue} />
      <Dot tone={colors.inkMuted} />
    </div>
  ),
};

export const Pulsing: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Dot tone={colors.green} pulse />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: colors.inkSoft }}>Live on site</span>
    </div>
  ),
};
