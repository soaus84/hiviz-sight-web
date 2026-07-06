import type { Meta, StoryObj } from '@storybook/react';
import { PageHead } from './PageHead';
import { Btn } from '../button/Btn';

const meta: Meta<typeof PageHead> = {
  title: 'Primitives/PageHead',
  component: PageHead,
};
export default meta;
type Story = StoryObj<typeof PageHead>;

export const Playground: Story = {
  args: { title: 'Sites', sub: 'Every worksite in the region, with its current visibility and open work.' },
};

export const WithActions: Story = {
  render: () => (
    <PageHead
      title="Visits"
      sub="Plan, brief and review site visits across the region."
      actions={
        <>
          <Btn variant="ghost" icon="download">Export</Btn>
          <Btn variant="accent" icon="add">Plan a visit</Btn>
        </>
      }
    />
  ),
};
