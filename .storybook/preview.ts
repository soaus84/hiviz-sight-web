import type { Preview } from '@storybook/react';
import '../src/styles/tokens.css';
import '../src/styles/global.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'app-bg',
      values: [
        { name: 'app-bg', value: '#FAFAF7' },
        { name: 'white', value: '#FFFFFF' },
        { name: 'sidebar-dark', value: '#0C0C0C' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // The Storybook canvas area (minus the sidebar/addons panels) is often
    // narrower than 1280px, which would silently push useBreakpoint()-driven
    // "Views" page stories into their tablet/mobile layout even when the
    // story is meant to show desktop. Default every story to a real desktop
    // width; mobile-specific stories override this per-story.
    viewport: {
      viewports: {
        desktopWide: { name: 'Desktop (1440)', styles: { width: '1440px', height: '900px' }, type: 'desktop' },
      },
      defaultViewport: 'desktopWide',
    },
  },
};

export default preview;
