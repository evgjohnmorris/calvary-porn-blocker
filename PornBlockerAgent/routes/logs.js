'use strict';

const express = require('express');
const router  = express.Router();

const logger = require('../system/logger');

/**
 * GET /api/logs
 * Returns the raw audit log lines as an array of strings.
 * Authenticated via middleware mounted in server.js.
 */
router.get('/', (req, res) => {
    try {
        const raw  = logger.getLogs();
        const logs = raw ? raw.trim().split('\n').filter(Boolean) : [];
        res.json({ success: true, logs });
    } catch (e) {
        console.error('[logs] Failed to read logs:', e.message);
        res.json({ success: false, logs: [] });
    }
});

module.exports = router;
