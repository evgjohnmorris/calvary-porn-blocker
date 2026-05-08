const alerter = require('./system/alerter');
const settings = require('./settings.json');

(async () => {
    console.log("Triggering high-severity event...");
    await alerter.sendAlert('BYPASS_ATTEMPT_DETECTED', 'User attempted to terminate the system proxy process.', settings);
    console.log("Alert triggered.");
})();
