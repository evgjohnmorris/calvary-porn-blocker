'use strict';

const { applyFilter, verifyDNS } = require('../system/dns');

/**
 * Start the lockdown-mode DNS integrity monitor.
 *
 * Every 60 seconds, when lockdown mode is active, verify that the system's
 * DNS is still pointing to the blocker. If it has been manually changed,
 * revert to strict immediately and log the bypass attempt.
 *
 * @param {function(): object} getSettings - Returns the live settings object.
 * @param {function(string, string, string): void} logAudit - Audit logger.
 */
function startLockdownMonitor(getSettings, logAudit) {
    return setInterval(async () => {
        const settings = getSettings();
        if (settings.lockdownMode) {
            const isCompliant = await verifyDNS('strict');
            if (!isCompliant) {
                logAudit(
                    'BYPASS_ATTEMPT_DETECTED',
                    '127.0.0.1',
                    'DNS changed manually during lockdown. Reverting to strict.',
                );
                await applyFilter('strict');
            }
        }
    }, 60_000);
}

module.exports = { startLockdownMonitor };
