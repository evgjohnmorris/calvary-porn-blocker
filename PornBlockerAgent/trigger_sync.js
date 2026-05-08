const logger = require('./system/logger');
const settings = require('./settings.json');

(async () => {
    console.log("Triggering log sync...");
    logger.logAudit('TEST_ACTION', '127.0.0.1', 'This is a test log entry to verify sync.', settings);
    await logger.syncToMinistryServer(settings.ministryServerUrl, settings.ministryServerToken);
    console.log("Log sync completed.");
})();
