'use strict';

const express = require('express');
const router  = express.Router();

/**
 * GET /api/csrf-token
 * Returns the current CSRF token so the frontend can bootstrap its state.
 * The csrfMiddleware (mounted globally) already set the csrf_token cookie and
 * attached the value to req._csrfToken before this handler runs.
 */
router.get('/', (req, res) => {
    res.json({ csrfToken: req._csrfToken });
});

module.exports = router;
