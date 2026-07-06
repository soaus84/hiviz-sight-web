import type { Meta, StoryObj } from '@storybook/react';
import { Stat } from './Stat';
import { colors } from '@/tokens';

const meta: Meta<typeof Stat> = {
  title: 'Primitives/Stat',
  component: Stat,
  argTypes: {
    deltaTone: {
      control: 'select',
      options: ['(default: green)', 'red', 'amber', 'blue'],
      mapping: { '(default: green)': undefined, red: colors.red, amber: colors.amber, blue: colors.blue },
      description: 'Not used anywhere in the real app yet — the one real delta ("+18%") relies on the green default.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Used 8× across the app (Dashboard ×4, SiteDetail ×4), always the plain white card. A dark `accent` variant existed for one instance (Dashboard\'s "Open insights") but was removed — it drew too much attention next to the other 7 plain stats.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Stat>;

export const Playground: Story = {
  args: { label: 'Visits this week', value: '4', sub: '1 live · 3 planned', icon: 'event' },
};

export const Default_UsedIn8Places: Story = {
  name: 'Default — used 8×: Dashboard ×4, SiteDetail ×4',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 220px)', gap: 16 }}>
      <Stat label="Visits this week" value="4" sub="1 live · 3 planned" icon="event" />
      <Stat label="Open insights" value="12" sub="4 awaiting your support" icon="lightbulb" />
      <Stat label="Observations · 7d" value="47" delta="+18%" icon="visibility" />
      <Stat label="Sites at risk" value="2" unit="of 7" sub="Coolinga · Jewell" icon="warning" />
      <Stat label="Visibility" value="High" sub="On site now" icon="visibility" />
      <Stat label="Observations" value={184} sub="All time" icon="forum" />
      <Stat label="Open insights" value={3} sub="Across this site" icon="lightbulb" />
      <Stat label="Atrophy" value={28} unit="/ 100" sub="Within range" icon="trending_up" />
    </div>
  ),
};
