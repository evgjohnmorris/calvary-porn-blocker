import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/desktop',
  timeout: 60000,
  globalTimeout: 120000,
  workers: 1,
  expect: {
    timeout: 8000
  },
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Electron',
      use: {
        browserName: 'chromium',
      },
    },
  ],
};

export default config;
