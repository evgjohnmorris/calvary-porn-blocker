const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');
const { applyFilter, verifyDNS } = require('./system/dns');
const { startDNSServer } = require('./system/dns-server');
const { encryptSettings, decryptSettings, generateLogHash } = require('./system/crypto');
const { runSystemScan, startProcessMonitoring } = require('./system/scanner');
const { sendAlert } = require('./system/alerter');

const app = express();
const PORT = 3456;
const AUDIT_LOG = path.join(__dirname, 'audit.log');
const JWT_SECRET = 'placeholder-secret-change-in-prod';
const USERS_FILE = path.join(__dirname, 'users.json');
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

// We need a persistent lastHash for the chain
let lastLogHash = '0000000000000000000000000000000000000000000000000000000000000000';

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

// ISO 27001 Tamper-Evident Audit Logger
function logAudit(action, ip, details = '') {
    const safeDetails = typeof details === 'string' 
        ? details.replace(/"password":"[^"]+"/gi, '"password":"***"').substring(0, 500) 
        : details;
    const timestamp = new Date().toISOString();
    
    // Create the raw log line without hash first
    const rawLine = `[${timestamp}] IP: ${ip} | Action: ${action} | Details: ${safeDetails}`;
    
    // Generate HMAC using the previous hash
    lastLogHash = generateLogHash(lastLogHash, rawLine);
    
    const logEntry = `${rawLine} | Hash: ${lastLogHash}\n`;
    fs.appendFileSync(AUDIT_LOG, logEntry);
    console.log(logEntry.trim());
    
    // Fire off async alert
    if (typeof currentSettings !== 'undefined') {
        sendAlert(action, safeDetails, currentSettings).catch(e => console.error(e));
    }
}

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false // Disabled for initial testing
}));
app.use(express.json());

// Rate Limiting
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later.'
});

// Static Files (Frontend UI)
app.use(express.static(path.join(__dirname, 'public')));

// State Initialization
let currentSettings = loadData(SETTINGS_FILE, {
    filterLevel: 'strict', // 'strict', 'moderate', 'off'
    lockdownMode: false,
    network: { dnsPrimary: '', dnsSecondary: '' },
    vpn: { hostname: '', hub: '', port: '' },
    personalization: { theme: 'dark', accentColor: '#4f46e5' },
    accountability: { enabled: false, partners: [] }
});
saveData(SETTINGS_FILE, currentSettings);

// Start embedded DNS server so it downloads blocklists and is ready for strict mode
if (process.env.NODE_ENV !== 'test') {
    startDNSServer();
    startProcessMonitoring(); // Begin real-time Tor termination
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
    
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password required' });

    try {
        const adminHash = await bcrypt.hash(password, 10);
        users.adminUsername = username;
        users.adminHash = adminHash;
        saveData(USERS_FILE, users);
        logAudit('SETUP_COMPLETE', req.ip, `User ${username} created`);
        res.json({ success: true, message: 'Setup complete' });
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

const { loadPlugins, togglePlugin } = require('./plugins');

// API: Get Settings
app.get('/api/settings', authenticateToken, (req, res) => {
    res.json({ ...currentSettings, plugins: loadPlugins() });
});

// API: Get Logs
app.get('/api/logs', authenticateToken, (req, res) => {
    try {
        const logs = fs.readFileSync(AUDIT_LOG, 'utf8');
        res.json({ success: true, logs });
    } catch (e) {
        res.json({ success: false, logs: 'No logs found or error reading logs.' });
    }
});

// API: Update Settings
app.post('/api/settings', authenticateToken, (req, res) => {
    const { filterLevel, lockdownMode, ministry_mode, pluginId, pluginEnabled, network, vpn, personalization, accountability } = req.body;
    
    // Enforce Ministry Mode restrictions
    if (currentSettings.ministry_mode) {
        if (filterLevel || lockdownMode !== undefined || network || vpn) {
            logAudit('MINISTRY_MODE_VIOLATION', req.ip, `Attempt to alter managed settings.`);
            return res.status(403).json({ success: false, message: 'These settings are managed by your organization.' });
        }
    }

    if (ministry_mode !== undefined) {
        currentSettings.ministry_mode = ministry_mode;
        logAudit('MINISTRY_MODE_CHANGED', req.ip, `Ministry mode set to ${ministry_mode}`);
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
    } else if (!currentSettings.lockdownMode && filterLevel) {
        currentSettings.filterLevel = filterLevel;
        logAudit('FILTER_CHANGED', req.ip, `Level set to ${filterLevel}`);
        applyFilter(filterLevel);
    }

    if (network) currentSettings.network = { ...currentSettings.network, ...network };
    if (vpn) currentSettings.vpn = { ...currentSettings.vpn, ...vpn };
    if (personalization) currentSettings.personalization = { ...currentSettings.personalization, ...personalization };
    if (accountability) currentSettings.accountability = accountability;

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
            } catch (e) {
                logAudit('MINISTRY_POLICY_SYNC_FAILED', 'SYSTEM', `Error syncing with ${currentSettings.remote_policy_url}: ${e.message}`);
            }
        }
    }, 60000 * 5); // Check every 5 minutes
}

// Generate Self-Signed Cert and Start HTTPS Server
const attrs = [{ name: 'commonName', value: 'localhost' }];

(async () => {
    try {
        const pems = await selfsigned.generate(attrs, { days: 365, keySize: 2048 });
        const server = https.createServer({
            key: pems.private,
            cert: pems.cert
        }, app);
        
        if (process.env.NODE_ENV !== 'test') {
            server.listen(PORT, '0.0.0.0', () => {
                console.log(`Calvary Sexual Immorality Blocker running securely at https://localhost:${PORT}`);
                logAudit('SERVER_STARTED', '127.0.0.1');
            });
        }
    } catch (err) {
        console.error('Failed to generate self-signed cert:', err);
    }
})();

module.exports = app;
