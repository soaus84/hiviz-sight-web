import type { Meta, StoryObj } from '@storybook/react';
import { AINote } from './AINote';

const meta: Meta<typeof AINote> = {
  title: 'Primitives/AINote',
  component: AINote,
  parameters: {
    docs: {
      description: {
        component:
          'Solid-yellow "AI voice" callout, updated to match the native mobile app\'s Communities screens ("Seeded from approved insight", "The question this raises") — bg colors.hi, hiInk text, no border. Previously a pale-yellow wash (#FFFEF0) with a lime hairline border; changed after comparing against native app screenshots + decompiled source.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof AINote>;

export const Playground: Story = {
  args: {
    title: 'Hiviz classification',
    children: 'A live barrier failure — high confidence. This is checked against other sites the moment it’s submitted.',
  },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <AINote {...args} />
    </div>
  ),
};

export const RoutedToPipeline: Story = {
  render: () => (
    <div style={{ maxWidth: 500 }}>
      <AINote title="Hiviz routed to pipeline">
        Routed automatically — 4 unwanted energy events across 3 sites in 14 days. Barrier assessment flagged degradation on most observations.
      </AINote>
    </div>
  ),
};
