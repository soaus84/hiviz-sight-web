import type { Meta, StoryObj } from '@storybook/react';
import { Btn } from './Btn';

const meta: Meta<typeof Btn> = {
  title: 'Primitives/Btn',
  component: Btn,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'accent', 'ghost', 'subtle', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Real variant usage across the app (15 call sites total): ghost 8×, accent 5×, primary 2×, subtle 0×, danger 0×. `subtle` and `danger` are implemented but currently unused anywhere — decide whether to keep them for future states (e.g. a destructive action) or drop them.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Btn>;

export const Playground: Story = {
  args: { children: 'Plan a visit', variant: 'accent', size: 'md', icon: 'add' },
};

export const Ghost_UsedIn8Places: Story = {
  name: 'ghost — most common, used 8×: Export, Configure, Map view, Report, Assign owner, Review briefing, View linked insight',
  render: () => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <Btn variant="ghost" icon="download">Export</Btn>
      <Btn variant="ghost" icon="tune">Configure</Btn>
      <Btn variant="ghost" icon="map">Map view</Btn>
      <Btn variant="ghost" icon="download">Report</Btn>
      <Btn variant="ghost" size="sm" icon="person_add">Assign owner</Btn>
      <Btn variant="ghost" size="sm" iconRight="arrow_forward">Review briefing</Btn>
    </div>
  ),
};

export const Accent_UsedIn5Places: Story = {
  name: 'accent — used 5×: Plan a visit ×2, New post, Invite user, Open visit',
  render: () => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <Btn variant="accent" icon="add">Plan a visit</Btn>
      <Btn variant="accent" icon="add">New post</Btn>
      <Btn variant="accent" icon="person_add">Invite user</Btn>
      <Btn variant="accent" size="lg" iconRight="arrow_forward">Open visit</Btn>
    </div>
  ),
};

export const Primary_UsedIn2Places: Story = {
  name: 'primary — used 2×: Support for action, Reply',
  render: () => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <Btn variant="primary" size="sm" icon="check">Support for action</Btn>
      <Btn variant="primary" icon="send">Reply</Btn>
    </div>
  ),
};

export const Subtle_and_Danger_UnusedInApp: Story = {
  name: 'subtle / danger — implemented but 0× used in the app today',
  render: () => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <Btn variant="subtle">Subtle</Btn>
      <Btn variant="danger">Danger</Btn>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <Btn size="sm">sm — 32px</Btn>
      <Btn size="md">md — 38px (default)</Btn>
      <Btn size="lg">lg — 46px</Btn>
    </div>
  ),
};
