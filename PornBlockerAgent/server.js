'use strict';

// Fix native module loading when running as a spawned Electron Node process
if (process.env.ELECTRON_RUN_AS_NODE) {
    delete process.versions.electron;
}

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------
const express    = require('express');
const https      = require('https');
const path       = require('path');
const selfsigned = require('selfsigned');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const cookieParser = require('cookie-parser');

// ---------------------------------------------------------------------------
// Config & shared utilities
// ---------------------------------------------------------------------------
const { PORT, NODE_ENV, SETTINGS_FILE, COOKIE_SECRET } = require('./config/env');
const { loadData, saveData }   = require('./storage/store');
const { authenticateToken }    = require('./middleware/auth');
const { csrfMiddleware }       = require('./middleware/csrf');
const logger                   = require('./system/logger');
const { startDNSServer }       = require('./system/dns-server');
const { startProcessMonitoring } = require('./system/scanner');
const { startAccountabilityMonitor } = require('./system/monitor');

// ---------------------------------------------------------------------------
// Route modules
// ---------------------------------------------------------------------------
const { router: authRouter }    = require('./routes/auth');
const accountRouter             = require('./routes/account');
const { router: settingsRouter, init: initSettings } = require('./routes/settings');
const scanRouter                = require('./routes/scan');
const logsRouter                = require('./routes/logs');
const csrfRouter                = require('./routes/csrf');

// ---------------------------------------------------------------------------
// Background workers
// ---------------------------------------------------------------------------
const { startLockdownMonitor } = require('./workers/lockdown-monitor');
const { startMinistrySync }    = require('./workers/ministry-sync');

// ---------------------------------------------------------------------------
// App bootstrap
// ---------------------------------------------------------------------------
const app = express();

// Security headers (CSP enabled in all environments)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc:  ["'self'"],
            styleSrc:   ["'self'", "'unsafe-inline'"], // SPA uses inline styles for dynamic theming
            imgSrc:     ["'self'", "data:"],
            connectSrc: ["'self'"],
            fontSrc:    ["'self'"],
            objectSrc:  ["'none'"],
            frameSrc:   ["'none'"],
            baseUri:    ["'self'"],
            formAction: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false, // Required for self-signed cert dev environment
}));

app.use(cookieParser(COOKIE_SECRET));
app.use(express.json());
app.use(csrfMiddleware);

// ---------------------------------------------------------------------------
// Rate limiters
// ---------------------------------------------------------------------------
const loginLimiter = rateLimit({
    windowMs:      15 * 60 * 1000,
    max:           NODE_ENV === 'test' ? 100 : 5,
    skip:          (req) => ['127.0.0.1', '::1'].includes(req.ip) || req.hostname === 'localhost',
    message:       'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders:   false,
});

const recoveryLimiter = rateLimit({
    windowMs:      15 * 60 * 1000,
    max:           NODE_ENV === 'test' ? 50 : 5,
    message:       'Too many recovery attempts. Please try again in 15 minutes.',
    standardHeaders: true,
    legacyHeaders:   false,
});

// ---------------------------------------------------------------------------
// Static files
// ---------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------------------
// State initialisation
// ---------------------------------------------------------------------------
let currentSettings = loadData(SETTINGS_FILE, {
    filterLevel:     'strict',
    lockdownMode:    false,
    family_mode:     false,
    ministry_mode:   false,
    network:         { dnsPrimary: '', dnsSecondary: '' },
    vpn:             { hostname: '', hub: '', port: '' },
    personalization: { theme: 'dark', accentColor: '#4f46e5' },
    accountability:  { enabled: false, partners: [] },
    blockedApps:     [],
});
saveData(SETTINGS_FILE, currentSettings);

// Share live settings reference with the settings route
initSettings(
    ()  => currentSettings,
    (s) => { currentSettings = s; },
);

// Shared audit logger
function logAudit(action, ip, details = '') {
    logger.logAudit(action, ip, details, currentSettings);
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api',            csrfRouter);
app.use('/api',            authRouter);

// Unauthenticated account recovery endpoints (rate-limited; no JWT required)
app.use('/api/account/reset-password',    recoveryLimiter, accountRouter);
app.use('/api/account/security-question', recoveryLimiter, accountRouter);

// All remaining account endpoints require a valid JWT
app.use('/api/account',    authenticateToken, accountRouter);

app.use('/api/settings',   authenticateToken, settingsRouter);
app.use('/api/scan',       authenticateToken, scanRouter);
app.use('/api/logs',       authenticateToken, logsRouter);

// ---------------------------------------------------------------------------
// Background services (skip in test environment)
// ---------------------------------------------------------------------------
if (NODE_ENV !== 'test') {
    startDNSServer();
    startProcessMonitoring();
    startAccountabilityMonitor(() => currentSettings, logAudit);
    startLockdownMonitor(() => currentSettings, logAudit);
    startMinistrySync(
        ()  => currentSettings,
        (s) => { currentSettings = s; saveData(SETTINGS_FILE, s); },
        logAudit,
        logger,
    );
}

// ---------------------------------------------------------------------------
// HTTPS server — only when invoked directly (not when require()'d by tests)
// ---------------------------------------------------------------------------
if (require.main === module) {
    (async () => {
        try {
            const attrs = [{ name: 'commonName', value: 'localhost' }];
            const pems  = await selfsigned.generate(attrs, { days: 365, keySize: 2048 });
            const server = https.createServer({ key: pems.private, cert: pems.cert }, app);

            server.listen(PORT, '0.0.0.0', () => {
                console.log(`Calvary Sexual Immorality Blocker running securely at https://localhost:${PORT}`);
                logAudit('SERVER_STARTED', '127.0.0.1');
            });
        } catch (err) {
            console.error('Failed to generate self-signed cert:', err);
            process.exit(1);
        }
    })();
}

module.exports = app;
