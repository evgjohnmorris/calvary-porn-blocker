'use strict';

/**
 * Input validation middleware — no external schema library required.
 *
 * Validates req.body fields and calls next() if valid, or returns
 * 400 with a descriptive error message if invalid.
 *
 * Usage:
 *   router.post('/', validate.settings, handler);
 *   router.post('/update', validate.accountUpdate, handler);
 *   router.post('/reset-password', validate.resetPassword, handler);
 */

const FILTER_LEVELS  = new Set(['off', 'moderate', 'strict']);
const MAX_STR        = 255;
const MAX_PASSWORD   = 128;
const MIN_PASSWORD   = 8;

/**
 * Returns true when val is a plain JS object (not array, not null).
 */
function isPlainObject(val) {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
}

/**
 * Returns true if the string contains null bytes or control characters
 * that have no place in user-supplied text fields.
 */
function hasDangerousBytes(str) {
    return /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(str);
}

/**
 * Validates a string field:
 *  - must be a string when provided
 *  - must not exceed maxLen
 *  - must not contain null/control bytes
 *  Returns an error message string or null if valid.
 */
function checkString(val, fieldName, maxLen = MAX_STR) {
    if (val === undefined || val === null) return null; // Optional fields are fine absent
    if (typeof val !== 'string')  return `${fieldName} must be a string`;
    if (val.length > maxLen)      return `${fieldName} must not exceed ${maxLen} characters`;
    if (hasDangerousBytes(val))   return `${fieldName} contains invalid characters`;
    return null;
}

// ---------------------------------------------------------------------------
// Validator: POST /api/settings
// ---------------------------------------------------------------------------
function settings(req, res, next) {
    const {
        filterLevel, lockdownMode, ministry_mode, family_mode,
        network, vpn, personalization, accountability, blockedApps,
        remote_policy_url, pluginId, pluginEnabled,
    } = req.body;

    if (filterLevel !== undefined && !FILTER_LEVELS.has(filterLevel)) {
        return res.status(400).json({
            success: false,
            message: `filterLevel must be one of: ${[...FILTER_LEVELS].join(', ')}`,
        });
    }

    for (const [field, val] of [['lockdownMode', lockdownMode], ['ministry_mode', ministry_mode], ['family_mode', family_mode]]) {
        if (val !== undefined && typeof val !== 'boolean') {
            return res.status(400).json({ success: false, message: `${field} must be a boolean` });
        }
    }

    for (const [field, val] of [['network', network], ['vpn', vpn], ['personalization', personalization], ['accountability', accountability]]) {
        if (val !== undefined && !isPlainObject(val)) {
            return res.status(400).json({ success: false, message: `${field} must be an object` });
        }
    }

    if (blockedApps !== undefined && !Array.isArray(blockedApps)) {
        return res.status(400).json({ success: false, message: 'blockedApps must be an array' });
    }

    const rpuErr = checkString(remote_policy_url, 'remote_policy_url', 512);
    if (rpuErr) return res.status(400).json({ success: false, message: rpuErr });

    const pluginIdErr = checkString(pluginId, 'pluginId', 64);
    if (pluginIdErr) return res.status(400).json({ success: false, message: pluginIdErr });

    if (pluginEnabled !== undefined && typeof pluginEnabled !== 'boolean') {
        return res.status(400).json({ success: false, message: 'pluginEnabled must be a boolean' });
    }

    next();
}

// ---------------------------------------------------------------------------
// Validator: POST /api/account/update
// ---------------------------------------------------------------------------
function accountUpdate(req, res, next) {
    const { username, name, email, password } = req.body;

    for (const [field, val] of [['username', username], ['name', name], ['email', email]]) {
        const err = checkString(val, field);
        if (err) return res.status(400).json({ success: false, message: err });
    }

    if (password !== undefined) {
        const err = checkString(password, 'password', MAX_PASSWORD);
        if (err) return res.status(400).json({ success: false, message: err });
        if (typeof password === 'string' && password.length > 0 && password.length < MIN_PASSWORD) {
            return res.status(400).json({
                success: false,
                message: `password must be at least ${MIN_PASSWORD} characters`,
            });
        }
    }

    next();
}

// ---------------------------------------------------------------------------
// Validator: POST /api/account/delete
// ---------------------------------------------------------------------------
function accountDelete(req, res, next) {
    const { password } = req.body;
    if (!password || typeof password !== 'string') {
        return res.status(400).json({ success: false, message: 'password is required' });
    }
    next();
}

// ---------------------------------------------------------------------------
// Validator: POST /api/account/reset-password
// ---------------------------------------------------------------------------
function resetPassword(req, res, next) {
    const { recoveryKey, newPassword } = req.body;

    const rkErr = checkString(recoveryKey, 'recoveryKey', 128);
    if (rkErr) return res.status(400).json({ success: false, message: rkErr });

    if (!newPassword || typeof newPassword !== 'string') {
        return res.status(400).json({ success: false, message: 'newPassword is required' });
    }
    if (newPassword.length < MIN_PASSWORD) {
        return res.status(400).json({
            success: false,
            message: `newPassword must be at least ${MIN_PASSWORD} characters`,
        });
    }
    if (newPassword.length > MAX_PASSWORD) {
        return res.status(400).json({
            success: false,
            message: `newPassword must not exceed ${MAX_PASSWORD} characters`,
        });
    }
    if (hasDangerousBytes(newPassword)) {
        return res.status(400).json({ success: false, message: 'newPassword contains invalid characters' });
    }

    next();
}

module.exports = { settings, accountUpdate, accountDelete, resetPassword };
