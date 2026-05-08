'use strict';

const { applyFilter } = require('../system/dns');

/**
 * Start the ministry remote-policy sync loop.
 *
 * Every 5 minutes, when ministry_mode is active and a remote_policy_url is
 * set, fetch the remote policy JSON and apply managed settings (filterLevel,
 * lockdownMode). Also pushes local logs to the ministry server.
 *
 * @param {function(): object}          getSettings  - Returns live settings.
 * @param {function(object): void}      setSettings  - Persists settings update.
 * @param {function(string, string, string): void} logAudit - Audit logger.
 * @param {object}                      logger       - Logger with syncToMinistryServer().
 */
function startMinistrySync(getSettings, setSettings, logAudit, logger) {
    return setInterval(async () => {
        const settings = getSettings();
        
        // 1. Policy Sync (Ministry Mode)
        if (settings.ministry_mode && settings.remote_policy_url) {
            try {
                const response = await fetch(settings.remote_policy_url);
                if (response.ok) {
                    const remote  = await response.json();
                    let   updated = false;

                    if (remote.filterLevel && remote.filterLevel !== settings.filterLevel) {
                        settings.filterLevel = remote.filterLevel;
                        applyFilter(remote.filterLevel);
                        updated = true;
                    }
                    if (remote.lockdownMode !== undefined && remote.lockdownMode !== settings.lockdownMode) {
                        settings.lockdownMode = remote.lockdownMode;
                        if (settings.lockdownMode) {
                            settings.filterLevel = 'strict';
                            applyFilter('strict');
                        }
                        updated = true;
                    }

                    if (updated) {
                        setSettings(settings);
                        logAudit('MINISTRY_POLICY_SYNC', 'SYSTEM', 'Remote policies applied successfully.');
                    }
                }
            } catch (e) {
                logAudit(
                    'MINISTRY_POLICY_SYNC_FAILED',
                    'SYSTEM',
                    `Error syncing with ${settings.remote_policy_url}: ${e.message}`,
                );
            }
        }

        // 2. Log Sync (Accountability / Ministry Server)
        if (settings.ministryServerUrl) {
            const token = settings.ministryServerToken || 'calvary-secure-token-123';
            await logger.syncToMinistryServer(settings.ministryServerUrl, token);
        }

    }, 60_000 * 5); // Every 5 minutes
}

module.exports = { startMinistrySync };
