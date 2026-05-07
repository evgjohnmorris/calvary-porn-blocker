let _activeWin = null;
function getActiveWin() {
    if (_activeWin === null) {
        try {
            _activeWin = require('active-win');
        } catch (e) {
            console.warn('[Monitor] active-win native binary unavailable — app window monitoring disabled.');
            _activeWin = undefined; // set to undefined so we don't retry
        }
    }
    return _activeWin;
}

const screenshot = require('screenshot-desktop');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', '.tmp', 'screenshots');

function ensureDirExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Keep track of when we last took a routine screenshot
let lastScreenshotTime = 0;
const SCREENSHOT_INTERVAL_MS = 15 * 60 * 1000;

function takeScreenshot(reason = 'routine') {
    ensureDirExists(SCREENSHOT_DIR);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(SCREENSHOT_DIR, `screenshot-${reason}-${timestamp}.jpg`);
    
    screenshot({ filename, format: 'jpg' }).then(() => {
        console.log(`[Monitor] Saved screenshot: ${filename}`);
    }).catch((err) => {
        console.error('[Monitor] Failed to take screenshot', err);
    });
}

function startAccountabilityMonitor(getSettings, logAudit) {
    console.log('[Monitor] Starting screen accountability & app monitor...');
    
    // Take an initial screenshot on startup if enabled
    setTimeout(() => {
        const settings = getSettings();
        if (settings.accountability && settings.accountability.enabled) {
            takeScreenshot('startup');
            lastScreenshotTime = Date.now();
        }
    }, 2000);

    setInterval(async () => {
        const settings = getSettings();
        const accountabilityEnabled = settings.accountability && settings.accountability.enabled;
        const blockedApps = settings.blockedApps || [];

        if (!accountabilityEnabled && blockedApps.length === 0) {
            return;
        }

        try {
            const activeWinFn = getActiveWin();
            if (!activeWinFn) return; // native module unavailable
            const window = await activeWinFn();
            if (!window) return;

            // App killing logic
            if (blockedApps.length > 0) {
                const appName = window.owner.name.toLowerCase();
                const windowTitle = window.title.toLowerCase();
                
                const isBlocked = blockedApps.some(app => {
                    const term = app.toLowerCase();
                    return appName.includes(term) || windowTitle.includes(term);
                });

                if (isBlocked) {
                    console.log(`[Monitor] Blocked application detected: ${window.owner.name} (${window.title})`);
                    // Kill process
                    exec(`taskkill /F /PID ${window.owner.processId}`, (err) => {
                        if (!err) {
                            logAudit('APP_KILLED', 'SYSTEM', `Killed blocked app: ${window.owner.name} (${window.title})`);
                            if (accountabilityEnabled) {
                                takeScreenshot('violation');
                            }
                        } else {
                            console.error('[Monitor] Failed to kill process', err);
                        }
                    });
                }
            }

            // Routine Screenshot logic
            if (accountabilityEnabled) {
                const now = Date.now();
                if (now - lastScreenshotTime >= SCREENSHOT_INTERVAL_MS) {
                    takeScreenshot('routine');
                    lastScreenshotTime = now;
                }
            }

        } catch (err) {
            console.error('[Monitor] Error checking active window', err);
        }
    }, 5000);
}

module.exports = {
    startAccountabilityMonitor
};
