'use strict';

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

/**
 * Authenticate the request.
 *
 * Precedence:
 *  1. `token` httpOnly cookie  (production browser clients)
 *  2. `Authorization: Bearer <token>` header  (test suite / API clients)
 *
 * On success: attaches `req.user` and calls `next()`.
 * On failure: responds 401 (missing) or 403 (invalid / expired).
 */
function authenticateToken(req, res, next) {
    // Cookie path (preferred in production)
    let token = req.cookies && req.cookies.token;

    // Bearer header fallback (test suite compatibility)
    if (!token) {
        const authHeader = req.headers['authorization'];
        token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    }

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken };
