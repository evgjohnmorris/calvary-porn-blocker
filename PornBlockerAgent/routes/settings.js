'use strict';

const express = require('express');
const router  = express.Router();

const { SETTINGS_FILE }     = require('../config/env');
const { loadData, saveData } = require('../storage/store');
const { applyFilter, applyDoHBlock } = require('../system/dns');
const { loadPlugins, togglePlugin } = require('../plugins');
const logger                 = require('../system/logger');
const validate               = require('../middleware/validate');

function logAudit(action, ip, details = '') {
    logger.logAudit(action, ip, details);
}

// Shared in-memory settings reference — injected at mount time by server.js.
let _getSettings = null;
let _setSettings = null;

/**
 * Attach live settings accessors.
 * Called once by server.js after initialising currentSettings:
 *   settingsRouter.init(() => currentSettings, (s) => { currentSettings = s; });
 */
function init(getSettings, setSettings) {
    _getSettings = getSettings;
    _setSettings = setSettings;
}

// ---------------------------------------------------------------------------
// GET /api/settings
// ---------------------------------------------------------------------------
router.get('/', (req, res) => {
    res.json({ ..._getSettings(), plugins: loadPlugins() });
});

// ---------------------------------------------------------------------------
// POST /api/settings
// ---------------------------------------------------------------------------
router.post('/', validate.settings, (req, res) => {
    const {
        filterLevel, lockdownMode, ministry_mode, family_mode,
        pluginId, pluginEnabled,
        network, vpn, personalization, accountability, blockedApps, remote_policy_url,
    } = req.body;

    let s = _getSettings();

    // --- Ministry Mode guard ---
    if (s.ministry_mode) {
        if (filterLevel || lockdownMode !== undefined || network || vpn) {
            logAudit('MINISTRY_MODE_VIOLATION', req.ip, 'Attempt to alter managed settings.');
            return res.status(403).json({ success: false, message: 'These settings are managed by your organization.' });
        }
    }

    // --- Family Mode guard ---
    if (s.family_mode) {
        if (filterLevel === 'off' || filterLevel === 'moderate') {
            logAudit('FAMILY_MODE_VIOLATION', req.ip, `Attempt to lower filter to '${filterLevel}' while family mode active.`);
            return res.status(403).json({ success: false, message: 'Family mode prevents lowering the filter level.' });
        }
    }

    if (ministry_mode !== undefined) {
        s.ministry_mode = ministry_mode;
        logAudit('MINISTRY_MODE_CHANGED', req.ip, `Ministry mode set to ${ministry_mode}`);
    }

    if (family_mode !== undefined) {
        s.family_mode = family_mode;
        logAudit('FAMILY_MODE_CHANGED', req.ip, `Family mode set to ${family_mode}`);
        if (family_mode && (s.filterLevel === 'off' || s.filterLevel === 'moderate')) {
            s.filterLevel = 'strict';
            applyFilter('strict');
            applyDoHBlock(); // Re-enforce DoH block when family mode activates
        }
    }

    if (pluginId !== undefined && pluginEnabled !== undefined) {
        const ok = togglePlugin(pluginId, pluginEnabled);
        if (ok) logAudit('PLUGIN_TOGGLED', req.ip, `${pluginId} set to ${pluginEnabled}`);
    }

    if (s.lockdownMode && lockdownMode === false) {
        logAudit('LOCKDOWN_LIFTED', req.ip);
        s.lockdownMode = false;
    } else if (lockdownMode === true) {
        logAudit('LOCKDOWN_ACTIVATED', req.ip);
        s.lockdownMode  = true;
        s.filterLevel   = 'strict';
        applyFilter('strict');
        applyDoHBlock(); // Re-enforce DoH block on lockdown
    } else if (s.lockdownMode && filterLevel) {
        logAudit('LOCKDOWN_BYPASS_ATTEMPT', req.ip, `Attempt to set filterLevel to '${filterLevel}' while locked down.`);
        return res.status(403).json({ success: false, message: 'These settings are managed by your organization.' });
    } else if (!s.lockdownMode && filterLevel) {
        s.filterLevel = filterLevel;
        logAudit('FILTER_CHANGED', req.ip, `Level set to ${filterLevel}`);
        applyFilter(filterLevel);
        if (filterLevel === 'strict') {
            applyDoHBlock(); // Re-enforce DoH block whenever strict mode is applied
        }
    }

    if (network)             s.network            = { ...s.network,           ...network };
    if (vpn)                 s.vpn                = { ...s.vpn,               ...vpn };
    if (personalization)     s.personalization    = { ...s.personalization,   ...personalization };
    if (accountability)      s.accountability     = accountability;
    if (blockedApps !== undefined) s.blockedApps  = blockedApps;
    if (remote_policy_url !== undefined) s.remote_policy_url = remote_policy_url;

    _setSettings(s);
    saveData(SETTINGS_FILE, s);

    res.json({ success: true, settings: s });
});

module.exports = { router, init };
