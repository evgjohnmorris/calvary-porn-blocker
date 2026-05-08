'use strict';

const express = require('express');
const router  = express.Router();

const {
    runSystemScan,
    deleteSuspiciousFiles,
    clearBrowserHistory,
    cancelMemberships,
} = require('../system/scanner');

const logger = require('../system/logger');

function logAudit(action, ip, details = '') {
    logger.logAudit(action, ip, details);
}

// ---------------------------------------------------------------------------
// GET /api/scan
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const results = await runSystemScan();
        logAudit('SYSTEM_SCAN_RUN', req.ip, `Found ${results.length} flags.`);
        res.json({ success: true, results });
    } catch (e) {
        console.error('[scan] runSystemScan error:', e.message);
        res.status(500).json({ success: false, message: 'Scan failed' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/scan/remediate
// ---------------------------------------------------------------------------
router.post('/remediate', async (req, res) => {
    try {
        const fileResult = await deleteSuspiciousFiles();
        logAudit('REMEDIATION_FILES', req.ip, fileResult.message);
        res.json({ success: true, message: fileResult.message });
    } catch (e) {
        console.error('[scan] remediate error:', e.message);
        res.status(500).json({ success: false, message: 'File remediation failed: ' + e.message });
    }
});

// ---------------------------------------------------------------------------
// POST /api/scan/delete_history
// ---------------------------------------------------------------------------
router.post('/delete_history', async (req, res) => {
    try {
        const historyResult = await clearBrowserHistory();
        logAudit('REMEDIATION_HISTORY', req.ip, historyResult.message);
        res.json({ success: true, message: historyResult.message });
    } catch (e) {
        console.error('[scan] delete_history error:', e.message);
        res.status(500).json({ success: false, message: 'History deletion failed: ' + e.message });
    }
});

// ---------------------------------------------------------------------------
// POST /api/scan/cancel_memberships
// ---------------------------------------------------------------------------
router.post('/cancel_memberships', async (req, res) => {
    try {
        const memResult = await cancelMemberships();
        logAudit('REMEDIATION_MEMBERSHIPS', req.ip, memResult.message);
        res.json({
            success: true,
            message: memResult.message,
            // Canonical unsubscribe deep-links for the UI to open
            links: [
                'https://onlyfans.com/my/settings/subscriptions',
                'https://fansly.com/settings/subscriptions',
            ],
        });
    } catch (e) {
        console.error('[scan] cancel_memberships error:', e.message);
        res.status(500).json({ success: false, message: 'Membership cancellation failed: ' + e.message });
    }
});

module.exports = router;
