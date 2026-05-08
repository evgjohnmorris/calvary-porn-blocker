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
const crypto = require('crypto');
const os = require('os');

// Hardcoded names of known circumvention tools
const KNOWN_PROXIES = [
    'tor browser', 'tor.exe', 'psiphon', 'ultrasurf', 'hotspot shield', 
    'protonvpn', 'nordvpn', 'expressvpn', 'mullvad', 'cyberghost', 
    'windscribe', 'hide.me', 'tunnelbear', 'surfshark', 'pia', 
    'private internet access', 'lantern', 'outline'
];

// Map of known malicious/bypass executable hashes (SHA-256)
// This can be expanded. Example: Tor Browser's specific hashes.
const KNOWN_BYPASS_HASHES = new Set([
    // Add known hashes here
]);

const hashCache = new Map(); // path -> { hash, timestamp }

function getFileHash(filePath) {
    return new Promise((resolve) => {
        if (!fs.existsSync(filePath)) return resolve(null);
        
        const cached = hashCache.get(filePath);
        // Cache for 1 hour to avoid re-hashing the same file constantly
        if (cached && (Date.now() - cached.timestamp < 3600000)) {
            return resolve(cached.hash);
        }

        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        
        stream.on('data', data => hash.update(data));
        stream.on('end', () => {
            const digest = hash.digest('hex');
            hashCache.set(filePath, { hash: digest, timestamp: Date.now() });
            resolve(digest);
        });
        stream.on('error', () => resolve(null));
    });
}

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
    if (os.platform() !== 'win32') {
        console.warn('[Monitor] Process monitoring is currently only supported on Windows.');
        return;
    }

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
            const appName = window.owner.name ? window.owner.name.toLowerCase() : '';
            const windowTitle = window.title ? window.title.toLowerCase() : '';
            const appPath = window.owner.path || '';
            
            const combinedBlocklist = [...blockedApps, ...KNOWN_PROXIES];
            
            let isBlocked = combinedBlocklist.length > 0 && combinedBlocklist.some(app => {
                if (!app) return false;
                const term = app.toLowerCase();
                return appName.includes(term) || windowTitle.includes(term);
            });

            // Hash-based detection for rename bypasses
            if (!isBlocked && appPath && KNOWN_BYPASS_HASHES.size > 0) {
                const hash = await getFileHash(appPath);
                if (hash && KNOWN_BYPASS_HASHES.has(hash)) {
                    isBlocked = true;
                    console.log(`[Monitor] Blocked application detected via Hash: ${hash}`);
                }
            }

            if (isBlocked) {
                console.log(`[Monitor] Blocked application detected: ${window.owner.name} (${window.title})`);
                // Kill process
                exec(`taskkill /F /PID ${window.owner.processId}`, (err) => {
                    if (!err) {
                        logAudit('BYPASS_ATTEMPT_DETECTED', 'SYSTEM', `Killed blocked app/proxy: ${window.owner.name} (${window.title})`);
                        if (accountabilityEnabled) {
                            takeScreenshot('violation');
                        }
                    } else {
                        console.error('[Monitor] Failed to kill process', err);
                    }
                });
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
