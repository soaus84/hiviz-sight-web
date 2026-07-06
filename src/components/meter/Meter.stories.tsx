import type { Meta, StoryObj } from '@storybook/react';
import { Meter } from './Meter';
import { colors } from '@/tokens';

const TONE_OPTIONS = ['green', 'amber', 'red'];
const TONE_MAPPING: Record<string, string> = { green: colors.green, amber: colors.amber, red: colors.red };

const meta: Meta<typeof Meter> = {
  title: 'Primitives/Meter',
  component: Meter,
  argTypes: {
    tone: {
      control: 'select',
      options: TONE_OPTIONS,
      mapping: TONE_MAPPING,
      description: 'Real atrophy-score usage (utils/atrophy.ts atrophyTone): green <38 · amber 38-54 · red ≥55. Note this threshold set differs from deriveAtrophyState\'s active/elevated/critical labels (40/70) — same score can map to a different tone than its labeled state.',
    },
  },
};
export default meta;
type Story = StoryObj<typeof Meter>;

export const Playground: Story = {
  args: { value: 28, tone: colors.green, width: 96 },
};

export const AtrophyStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Meter value={22} tone={colors.green} />
      <Meter value={41} tone={colors.amber} />
      <Meter value={64} tone={colors.red} />
    </div>
  ),
};
