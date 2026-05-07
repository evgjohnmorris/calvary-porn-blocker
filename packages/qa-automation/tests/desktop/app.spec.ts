import { test, expect, _electron as electron } from '@playwright/test';
import * as path from 'path';

test('Launch Desktop App and Verify UI', async () => {
  const mainPath = path.join(__dirname, '../../../../apps/desktop-client/main.js');
  // Launch Electron app
  const electronApp = await electron.launch({
    args: [mainPath]
  });

  electronApp.process().stdout?.on('data', (data: any) => console.log('STDOUT:', data.toString()));
  electronApp.process().stderr?.on('data', (data: any) => console.error('STDERR:', data.toString()));

  // Get the first window
  const window = await electronApp.firstWindow();
  window.on('console', (msg: any) => console.log('WINDOW CONSOLE:', msg.text()));
  window.on('pageerror', (err: any) => console.log('WINDOW ERROR:', err));

  try {
    // Wait for the backend agent to start and serve the UI
    // The backend starts asynchronously so we poll until it responds
    await expect(async () => {
      await window.goto('https://localhost:3456', { waitUntil: 'domcontentloaded', timeout: 6000 }).catch(() => {});
      const header = window.locator('text=Calvary Sexual Immorality Blocker Login');
      await expect(header).toBeVisible({ timeout: 4000 });
    }).toPass({ timeout: 45000, intervals: [3000, 5000, 5000, 5000, 5000] });

    // Verify title after it successfully loads
    const title = await window.title();
    expect(title).toBe('Calvary Sexual Immorality Blocker');
    const header = window.locator('text=Calvary Sexual Immorality Blocker Login');
    await expect(header).toBeVisible();
  } finally {
    // Close app
    await electronApp.close();
  }
});
