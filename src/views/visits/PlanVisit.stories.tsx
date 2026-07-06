import type { Meta, StoryObj } from '@storybook/react';
import { PageAt } from '@/stories/PageAt';

const meta: Meta = {
  title: 'Views/Wizard/Plan a Visit',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The only multi-step wizard pattern in the app — Site → Schedule → Briefing → Review. No visitor step: the planner is always the current user, matching the reference native prototype (hiviz-field-standalone.html). The Schedule step mirrors that prototype\'s quick-pick date pattern (Today/Tomorrow cards, weekday strip, Arrive-by time slots) with a "Save for later" footer action that skips date selection entirely. Reached from the "Plan a visit" button on Visits or any Site page. On submit it creates a real Visit (in-memory, no backend) and navigates to its VisitDetail page.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const StepOne_NoSitePreselected: Story = {
  name: 'Step 1 — opened from Visits (no site preselected)',
  render: () => <PageAt path="/visits/new" />,
};

export const StepOne_SitePreselected: Story = {
  name: 'Step 1 — opened from a Site page (site preselected)',
  render: () => <PageAt path="/visits/new?site=s4" />,
};
