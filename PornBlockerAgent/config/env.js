'use strict';

const path = require('path');
const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Fail-closed production guard.
// In production a missing JWT_SECRET would silently rotate on every restart,
// invalidating all sessions. Crash instead.
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is required in production.');
    console.error('Generate one with: node -e "require(\'crypto\').randomBytes(64).toString(\'hex\') |> console.log"');
    process.exit(1);
}

const JWT_SECRET     = process.env.JWT_SECRET     || crypto.randomBytes(64).toString('hex');
// COOKIE_SECRET signs the CSRF cookie; keep separate from JWT_SECRET.
const COOKIE_SECRET  = process.env.COOKIE_SECRET  || crypto.randomBytes(32).toString('hex');
const PORT           = parseInt(process.env.PORT  || '3456', 10);
const NODE_ENV       = process.env.NODE_ENV        || 'development';

const USERS_FILE    = path.join(__dirname, '..', 'users.json');
const SETTINGS_FILE = path.join(__dirname, '..', 'settings.json');

module.exports = { JWT_SECRET, COOKIE_SECRET, PORT, NODE_ENV, USERS_FILE, SETTINGS_FILE };
