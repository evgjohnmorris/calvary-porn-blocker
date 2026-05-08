import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/desktop',
  timeout: 60000,
  globalTimeout: 300000,
  workers: 1,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'test-results/html', open: 'never' }]],
  outputDir: 'test-results/artifacts',
  expect: {
    timeout: 10000,
  },
  use: {
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'Electron',
      use: {
        browserName: 'chromium',
      },
    },
    {
      name: 'desktop',      // alias so --project=desktop works
      use: {
        browserName: 'chromium',
      },
    },
  ],
};

export default config;
