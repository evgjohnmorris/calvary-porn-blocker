const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Fix native module loading when running as a spawned Electron Node process
if (process.env.ELECTRON_RUN_AS_NODE) {
  delete process.versions.electron;
}



const selfsigned = require('selfsigned');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { exec } = require('child_process');
const { applyFilter, verifyDNS } = require('./system/dns');
const { startDNSServer } = require('./system/dns-server');
const { encryptSettings, decryptSettings, generateLogHash } = require('./system/crypto');
const logger = require('./system/logger');
const { runSystemScan, startProcessMonitoring, deleteSuspiciousFiles, clearBrowserHistory, cancelMemberships } = require('./system/scanner');
const { sendAlert } = require('./system/alerter');
const { startAccountabilityMonitor } = require('./system/monitor');

const app = express();
const PORT = 3456;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const USERS_FILE = path.join(__dirname, 'users.json');
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

function loadData(filePath, defaultData = {}, isEncrypted = false) {
    if (fs.existsSync(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            if (isEncrypted) {
                return decryptSettings(JSON.parse(content));
            }
            return JSON.parse(content);
        } catch (e) {
            console.error(`Error reading ${filePath}`, e);
        }
    }
    return defaultData;
}

function saveData(filePath, data, isEncrypted = false) {
    const payload = isEncrypted ? encryptSettings(data) : data;
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

// Utility to generate a 16-character recovery key
function generateRecoveryKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    const bytes = crypto.randomBytes(16);
    for (let i = 0; i < 16; i++) {
        key += chars[bytes[i] % chars.length];
    }
    return key;
}

function formatRecoveryKey(key) {
    return key.match(/.{1,4}/g).join('-');
}

// ISO 27001 Tamper-Evident Audit Logger via LogOrchestrator
function logAudit(action, ip, details = '') {
    logger.logAudit(action, ip, details, typeof currentSettings !== 'undefined' ? currentSettings : undefined);
}

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false // Disabled for initial testing
}));
app.use(express.json());

// Rate Limiting — relaxed for test/localhost environments
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'test' ? 100 : 5,
    skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.hostname === 'localhost',
    message: 'Too many login attempts, please try again later.'
});

// Static Files (Frontend UI)
app.use(express.static(path.join(__dirname, 'public')));

// State Initialization
let currentSettings = loadData(SETTINGS_FILE, {
    filterLevel: 'strict', // 'strict', 'family', 'moderate', 'off'
    lockdownMode: false,
    family_mode: false,   // Locally-enforced floor: blocks 'off'/'moderate' changes
    ministry_mode: false,
    network: { dnsPrimary: '', dnsSecondary: '' },
    vpn: { hostname: '', hub: '', port: '' },
    personalization: { theme: 'dark', accentColor: '#4f46e5' },
    accountability: { enabled: false, partners: [] },
    blockedApps: []
});
saveData(SETTINGS_FILE, currentSettings);

// Start embedded DNS server so it downloads blocklists and is ready for strict mode
if (process.env.NODE_ENV !== 'test') {
    startDNSServer();
    startProcessMonitoring(); // Begin real-time Tor termination
    startAccountabilityMonitor(() => currentSettings, logAudit); // App killing & Screenshots
}

// API: Setup Status
app.get('/api/setup/status', (req, res) => {
    const users = loadData(USERS_FILE, {});
    res.json({ isSetup: !!users.adminHash });
});

// API: Register (First time setup)
app.post('/api/register', async (req, res) => {
    const users = loadData(USERS_FILE, {});
    if (users.adminHash) {
        return res.status(403).json({ success: false, message: 'Already setup' });
    }
    
    const { username, password, name, email, securityQuestion, securityAnswer } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password required' });

    try {
        const adminHash = await bcrypt.hash(password, 10);
        const recoveryKey = generateRecoveryKey();
        const recoveryHash = await bcrypt.hash(recoveryKey, 10);
        
        let securityAnswerHash = null;
        if (securityAnswer) {
            securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);
        }

        users.adminUsername = username;
        users.adminHash = adminHash;
        users.recoveryHash = recoveryHash;
        users.adminName = name || '';
        users.adminEmail = email || '';
        users.securityQuestion = securityQuestion || '';
        users.securityAnswerHash = securityAnswerHash;

        saveData(USERS_FILE, users);
        
        logAudit('SETUP_COMPLETE', req.ip, `User ${username} created`);
        res.json({ success: true, message: 'Setup complete', recoveryKey: formatRecoveryKey(recoveryKey) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error during setup' });
    }
});

// API: Login
app.post('/api/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    const users = loadData(USERS_FILE, {});
    
    if (!users.adminHash) {
        return res.status(400).json({ success: false, message: 'System not set up yet.' });
    }

    if (username !== users.adminUsername) {
        logAudit('LOGIN_FAILED', req.ip, `Invalid username: ${username}`);
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, users.adminHash);

    if (match) {
        const token = jwt.sign({ role: 'ally', username }, JWT_SECRET, { expiresIn: '15m' });
        logAudit('LOGIN_SUCCESS', req.ip, `User: ${username}`);
        res.json({ success: true, token });
    } else {
        logAudit('LOGIN_FAILED', req.ip, `Invalid password for user: ${username}`);
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Middleware: Authenticate JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// API: Account Update
app.post('/api/account/update', authenticateToken, async (req, res) => {
    const users = loadData(USERS_FILE, {});
    const { username, password, name, email, securityQuestion, securityAnswer } = req.body;
    
    let updated = false;
    let logMessage = [];

    if (username && username !== users.adminUsername) {
        users.adminUsername = username;
        updated = true;
        logMessage.push('username updated');
    }

    if (password) {
        users.adminHash = await bcrypt.hash(password, 10);
        updated = true;
        logMessage.push('password updated');
    }
    
    if (name !== undefined && name !== users.adminName) {
        users.adminName = name;
        updated = true;
        logMessage.push('name updated');
    }

    if (email !== undefined && email !== users.adminEmail) {
        users.adminEmail = email;
        updated = true;
        logMessage.push('email updated');
    }
    
    if (securityQuestion !== undefined && securityAnswer) {
        users.securityQuestion = securityQuestion;
        users.securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);
        updated = true;
        logMessage.push('security question updated');
    }

    if (updated) {
        saveData(USERS_FILE, users);
        logAudit('ACCOUNT_UPDATED', req.ip, logMessage.join(', '));
        res.json({ success: true, message: 'Account updated successfully' });
    } else {
        res.json({ success: true, message: 'No changes made' });
    }
});

// API: Get Profile Info
app.get('/api/account/profile', authenticateToken, (req, res) => {
    const users = loadData(USERS_FILE, {});
    res.json({
        success: true,
        username: users.adminUsername || '',
        name: users.adminName || '',
        email: users.adminEmail || '',
        securityQuestion: users.securityQuestion || ''
    });
});

// API: Get Security Question for Recovery
app.get('/api/account/security-question', (req, res) => {
    const users = loadData(USERS_FILE, {});
    if (users.securityQuestion) {
        res.json({ success: true, securityQuestion: users.securityQuestion });
    } else {
        res.json({ success: false, message: 'No security question set' });
    }
});

// API: Generate New Recovery Key
app.get('/api/account/recovery-key', authenticateToken, async (req, res) => {
    const users = loadData(USERS_FILE, {});
    try {
        const recoveryKey = generateRecoveryKey();
        users.recoveryHash = await bcrypt.hash(recoveryKey, 10);
        saveData(USERS_FILE, users);
        logAudit('RECOVERY_KEY_GENERATED', req.ip, 'New recovery key generated by user');
        res.json({ success: true, recoveryKey: formatRecoveryKey(recoveryKey) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error generating recovery key' });
    }
});

// API: Reset Password
app.post('/api/account/reset-password', async (req, res) => {
    const users = loadData(USERS_FILE, {});
    const { recoveryKey, securityAnswer, newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ success: false, message: 'New password is required' });
    }

    try {
        let match = false;

        if (recoveryKey && users.recoveryHash) {
            const normalizedKey = recoveryKey.replace(/-/g, '').toUpperCase();
            match = await bcrypt.compare(normalizedKey, users.recoveryHash);
        } else if (securityAnswer && users.securityAnswerHash) {
            match = await bcrypt.compare(securityAnswer.toLowerCase().trim(), users.securityAnswerHash);
        }

        if (match) {
            users.adminHash = await bcrypt.hash(newPassword, 10);
            const newRecoveryKey = generateRecoveryKey();
            users.recoveryHash = await bcrypt.hash(newRecoveryKey, 10);
            
            saveData(USERS_FILE, users);
            logAudit('PASSWORD_RESET', req.ip, 'Password reset via recovery key or security question');
            res.json({ success: true, message: 'Password reset successfully', recoveryKey: formatRecoveryKey(newRecoveryKey) });
        } else {
            logAudit('PASSWORD_RESET_FAILED', req.ip, 'Invalid recovery method attempted');
            res.status(401).json({ success: false, message: 'Invalid recovery key or security answer' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error resetting password' });
    }
});

// API: Delete Account / Factory Reset
app.post('/api/account/delete', authenticateToken, async (req, res) => {
    try {
        const { password } = req.body;
        const users = loadData(USERS_FILE, {});
        
        if (password) {
             const match = await bcrypt.compare(password, users.adminHash);
             if (!match) {
                 logAudit('ACCOUNT_DELETE_FAILED', req.ip, 'Invalid password provided for account deletion.');
                 return res.status(401).json({ success: false, message: 'Invalid password for account deletion.' });
             }
        } else {
            return res.status(400).json({ success: false, message: 'Password required to delete account.' });
        }

        if (fs.existsSync(USERS_FILE)) {
            fs.unlinkSync(USERS_FILE);
        }
        
        // Reset settings
        currentSettings = {
            filterLevel: 'off',
            lockdownMode: false,
            network: { dnsPrimary: '', dnsSecondary: '' },
            vpn: { hostname: '', hub: '', port: '' },
            personalization: { theme: 'dark', accentColor: '#4f46e5' },
            accountability: { enabled: false, partners: [] },
            blockedApps: []
        };
        saveData(SETTINGS_FILE, currentSettings);
        applyFilter('off'); // Turn off the filter just in case

        logAudit('ACCOUNT_DELETED', req.ip, 'User deleted account and factory reset system');
        res.json({ success: true, message: 'Account deleted and system reset.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error deleting account' });
    }
});

const { loadPlugins, togglePlugin } = require('./plugins');

// API: Get Settings
app.get('/api/settings', authenticateToken, (req, res) => {
    res.json({ ...currentSettings, plugins: loadPlugins() });
});

// API: Get Logs
app.get('/api/logs', authenticateToken, (req, res) => {
    try {
        const raw = logger.getLogs();
        const logs = raw ? raw.trim().split('\n').filter(Boolean) : [];
        res.json({ success: true, logs });
    } catch (e) {
        res.json({ success: false, logs: [] });
    }
});

// API: Update Settings
app.post('/api/settings', authenticateToken, (req, res) => {
    const { filterLevel, lockdownMode, ministry_mode, family_mode, pluginId, pluginEnabled, network, vpn, personalization, accountability, blockedApps, remote_policy_url } = req.body;
    
    // Enforce Ministry Mode restrictions (org-managed: blocks filter, lockdown, network, vpn)
    if (currentSettings.ministry_mode) {
        if (filterLevel || lockdownMode !== undefined || network || vpn) {
            logAudit('MINISTRY_MODE_VIOLATION', req.ip, `Attempt to alter managed settings.`);
            return res.status(403).json({ success: false, message: 'These settings are managed by your organization.' });
        }
    }

    // Enforce Family Mode restrictions (locally-managed: blocks downgrade to off/moderate)
    if (currentSettings.family_mode) {
        if (filterLevel === 'off' || filterLevel === 'moderate') {
            logAudit('FAMILY_MODE_VIOLATION', req.ip, `Attempt to lower filter to '${filterLevel}' while family mode active.`);
            return res.status(403).json({ success: false, message: 'Family mode prevents lowering the filter level.' });
        }
    }

    if (ministry_mode !== undefined) {
        currentSettings.ministry_mode = ministry_mode;
        logAudit('MINISTRY_MODE_CHANGED', req.ip, `Ministry mode set to ${ministry_mode}`);
    }

    if (family_mode !== undefined) {
        currentSettings.family_mode = family_mode;
        logAudit('FAMILY_MODE_CHANGED', req.ip, `Family mode set to ${family_mode}`);
        // When family mode is enabled, floor must be at least 'strict'
        if (family_mode && (currentSettings.filterLevel === 'off' || currentSettings.filterLevel === 'moderate')) {
            currentSettings.filterLevel = 'strict';
            applyFilter('strict');
        }
    }

    // Handle Plugin Toggles
    if (pluginId !== undefined && pluginEnabled !== undefined) {
        const success = togglePlugin(pluginId, pluginEnabled);
        if (success) {
            logAudit('PLUGIN_TOGGLED', req.ip, `${pluginId} set to ${pluginEnabled}`);
        }
    }

    if (currentSettings.lockdownMode && lockdownMode === false) {
        logAudit('LOCKDOWN_LIFTED', req.ip);
        currentSettings.lockdownMode = false;
    } else if (lockdownMode === true) {
        logAudit('LOCKDOWN_ACTIVATED', req.ip);
        currentSettings.lockdownMode = true;
        currentSettings.filterLevel = 'strict'; // Force strict
        applyFilter('strict');
    } else if (currentSettings.lockdownMode && filterLevel) {
        // Lockdown active — reject any attempt to change filter level
        logAudit('LOCKDOWN_BYPASS_ATTEMPT', req.ip, `Attempt to set filterLevel to '${filterLevel}' while locked down.`);
        return res.status(403).json({ success: false, message: 'These settings are managed by your organization.' });
    } else if (!currentSettings.lockdownMode && filterLevel) {
        currentSettings.filterLevel = filterLevel;
        logAudit('FILTER_CHANGED', req.ip, `Level set to ${filterLevel}`);
        applyFilter(filterLevel);
    }

    if (network) currentSettings.network = { ...currentSettings.network, ...network };
    if (vpn) currentSettings.vpn = { ...currentSettings.vpn, ...vpn };
    if (personalization) currentSettings.personalization = { ...currentSettings.personalization, ...personalization };
    if (accountability) currentSettings.accountability = accountability;
    if (blockedApps !== undefined) currentSettings.blockedApps = blockedApps;
    if (remote_policy_url !== undefined) currentSettings.remote_policy_url = remote_policy_url;

    saveData(SETTINGS_FILE, currentSettings);

    res.json({ success: true, settings: currentSettings });
});

// API: Run System Scan
app.get('/api/scan', authenticateToken, async (req, res) => {
    try {
        const results = await runSystemScan();
        logAudit('SYSTEM_SCAN_RUN', req.ip, `Found ${results.length} flags.`);
        res.json({ success: true, results });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Scan failed' });
    }
});

// API: Get Logs
app.get('/api/logs', authenticateToken, (req, res) => {
    const logs = logger.getLogs();
    res.json({ success: true, logs });
});

// API: Remediate / Delete Files
app.post('/api/scan/remediate', authenticateToken, async (req, res) => {
    try {
        const fileResult = await deleteSuspiciousFiles();
        logAudit('REMEDIATION_FILES', req.ip, fileResult.message);
        res.json({ success: true, message: fileResult.message });
    } catch (e) {
        res.status(500).json({ success: false, message: 'File remediation failed: ' + e.message });
    }
});

// API: Clear Browser History
app.post('/api/scan/delete_history', authenticateToken, async (req, res) => {
    try {
        const historyResult = await clearBrowserHistory();
        logAudit('REMEDIATION_HISTORY', req.ip, historyResult.message);
        res.json({ success: true, message: historyResult.message });
    } catch (e) {
        res.status(500).json({ success: false, message: 'History deletion failed: ' + e.message });
    }
});

// API: Cancel Memberships
app.post('/api/scan/cancel_memberships', authenticateToken, async (req, res) => {
    try {
        const memResult = await cancelMemberships();
        logAudit('REMEDIATION_MEMBERSHIPS', req.ip, memResult.message);
        // Providing some hardcoded unsubscribe links as an example response for the UI to open
        res.json({ 
            success: true, 
            message: memResult.message,
            links: ['https://onlyfans.com/my/settings/subscriptions', 'https://fansly.com/settings/subscriptions']
        });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Membership cancellation failed: ' + e.message });
    }
});

// Periodic Lockdown Check
if (process.env.NODE_ENV !== 'test') {
    setInterval(async () => {
        if (currentSettings.lockdownMode) {
            const isCompliant = await verifyDNS('strict');
            if (!isCompliant) {
                logAudit('BYPASS_ATTEMPT_DETECTED', '127.0.0.1', 'DNS changed manually during lockdown. Reverting to strict.');
                await applyFilter('strict');
            }
        }
    }, 60000);

    // Periodic Ministry Policy Sync
    setInterval(async () => {
        if (currentSettings.ministry_mode && currentSettings.remote_policy_url) {
            try {
                // Node 18+ built-in fetch
                const response = await fetch(currentSettings.remote_policy_url);
                if (response.ok) {
                    const remoteSettings = await response.json();
                    let updated = false;
                    
                    // Sync specific managed properties
                    if (remoteSettings.filterLevel && remoteSettings.filterLevel !== currentSettings.filterLevel) {
                        currentSettings.filterLevel = remoteSettings.filterLevel;
                        applyFilter(remoteSettings.filterLevel);
                        updated = true;
                    }
                    if (remoteSettings.lockdownMode !== undefined && remoteSettings.lockdownMode !== currentSettings.lockdownMode) {
                        currentSettings.lockdownMode = remoteSettings.lockdownMode;
                        if (currentSettings.lockdownMode) {
                            currentSettings.filterLevel = 'strict';
                            applyFilter('strict');
                        }
                        updated = true;
                    }
                    
                    if (updated) {
                        saveData(SETTINGS_FILE, currentSettings);
                        logAudit('MINISTRY_POLICY_SYNC', 'SYSTEM', 'Remote policies applied successfully.');
                    }
                }
                
                // Sync local logs to ministry server
                await logger.syncToMinistryServer(currentSettings.remote_policy_url);
            } catch (e) {
                logAudit('MINISTRY_POLICY_SYNC_FAILED', 'SYSTEM', `Error syncing with ${currentSettings.remote_policy_url}: ${e.message}`);
            }
        }
    }, 60000 * 5); // Check every 5 minutes
}

// Generate Self-Signed Cert and Start HTTPS Server
// Guard: only bind to port when run directly (node server.js), not when require()'d by tests.
const attrs = [{ name: 'commonName', value: 'localhost' }];

if (require.main === module) {
    (async () => {
        try {
            const pems = await selfsigned.generate(attrs, { days: 365, keySize: 2048 });
            const server = https.createServer({
                key: pems.private,
                cert: pems.cert
            }, app);
            
            server.listen(PORT, '0.0.0.0', () => {
                console.log(`Calvary Sexual Immorality Blocker running securely at https://localhost:${PORT}`);
                logAudit('SERVER_STARTED', '127.0.0.1');
            });
        } catch (err) {
            console.error('Failed to generate self-signed cert:', err);
        }
    })();
}

module.exports = app;
