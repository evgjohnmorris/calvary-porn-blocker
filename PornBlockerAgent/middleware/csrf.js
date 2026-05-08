'use strict';

const crypto = require('crypto');

// Routes exempt from CSRF validation (they authenticate themselves differently
// or are bootstrapping routes that the user hits before they have a CSRF token).
const CSRF_EXEMPT = new Set([
    'POST /api/login',
    'POST /api/register',
    'POST /api/account/reset-password',
]);

/**
 * Issue a CSRF token as a non-httpOnly cookie so the frontend JS can read it,
 * then send it back in the X-CSRF-Token header on mutating requests.
 *
 * This is the "double-submit cookie" pattern — it does not require server-side
 * session state and is safe against CSRF when combined with SameSite=Strict.
 */
function csrfMiddleware(req, res, next) {
    const method = req.method.toUpperCase();
    const routeKey = `${method} ${req.path}`;

    // --- Ensure every response carries a fresh (or existing) CSRF token ---
    if (!req.cookies || !req.cookies.csrf_token) {
        const newToken = crypto.randomBytes(32).toString('hex');
        res.cookie('csrf_token', newToken, {
            httpOnly: false,   // Must be readable by frontend JS
            secure: true,
            sameSite: 'Strict',
            path: '/',
        });
        // Attach to request so the GET /api/csrf-token route can read it immediately
        req._csrfToken = newToken;
    } else {
        req._csrfToken = req.cookies.csrf_token;
    }

    // --- Validate on mutating methods ---
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !CSRF_EXEMPT.has(routeKey)) {
        const headerToken = req.headers['x-csrf-token'];
        if (!headerToken || headerToken !== req._csrfToken) {
            return res.status(403).json({ success: false, message: 'Invalid or missing CSRF token.' });
        }
    }

    next();
}

module.exports = { csrfMiddleware };
