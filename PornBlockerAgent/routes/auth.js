'use strict';

const express  = require('express');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const router   = express.Router();

const { JWT_SECRET, NODE_ENV, USERS_FILE, SETTINGS_FILE } = require('../config/env');
const { loadData, saveData }  = require('../storage/store');
const logger                  = require('../system/logger');

// ---------------------------------------------------------------------------
// Helpers (shared with account route via recovery key generation)
// ---------------------------------------------------------------------------

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

function logAudit(action, ip, details = '') {
    logger.logAudit(action, ip, details);
}

// Cookie options for the JWT auth cookie
function authCookieOptions() {
    return {
        httpOnly: true,
        secure:   true,
        sameSite: 'Strict',
        maxAge:   15 * 60 * 1000, // 15 minutes — matches JWT expiry
        path:     '/',
    };
}

// ---------------------------------------------------------------------------
// GET /api/setup/status
// ---------------------------------------------------------------------------
router.get('/setup/status', (req, res) => {
    const users = loadData(USERS_FILE, {});
    res.json({ isSetup: !!users.adminHash });
});

// ---------------------------------------------------------------------------
// POST /api/register  (first-time setup only)
// ---------------------------------------------------------------------------
router.post('/register', async (req, res) => {
    const users = loadData(USERS_FILE, {});
    if (users.adminHash) {
        return res.status(403).json({ success: false, message: 'Already setup' });
    }

    const { username, password, name, email } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    try {
        const adminHash    = await bcrypt.hash(password, 10);
        const recoveryKey  = generateRecoveryKey();
        const recoveryHash = await bcrypt.hash(recoveryKey, 10);

        users.adminUsername = username;
        users.adminHash     = adminHash;
        users.recoveryHash  = recoveryHash;
        users.adminName     = name  || '';
        users.adminEmail    = email || '';
        // Security question fields are left empty — only recovery key is supported.

        saveData(USERS_FILE, users);
        logAudit('SETUP_COMPLETE', req.ip, `User ${username} created`);

        res.json({ success: true, message: 'Setup complete', recoveryKey: formatRecoveryKey(recoveryKey) });
    } catch (err) {
        console.error('[auth] register error:', err);
        res.status(500).json({ success: false, message: 'Error during setup' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/login
// Sets an httpOnly JWT cookie on success; does NOT return the token in the body.
// ---------------------------------------------------------------------------
router.post('/login', async (req, res) => {
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
        res.cookie('token', token, authCookieOptions());
        logAudit('LOGIN_SUCCESS', req.ip, `User: ${username}`);
        res.json({ success: true });
    } else {
        logAudit('LOGIN_FAILED', req.ip, `Invalid password for user: ${username}`);
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/logout  — clears the auth cookie
// ---------------------------------------------------------------------------
router.post('/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.json({ success: true });
});

module.exports = { router, generateRecoveryKey, formatRecoveryKey, logAudit };
