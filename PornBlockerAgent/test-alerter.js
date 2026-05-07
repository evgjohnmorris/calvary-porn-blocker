const { sendAlert } = require('./system/alerter');

const settings = {
    accountability: {
        enabled: true,
        partners: [{ email: 'test@example.com' }]
    }
};

sendAlert('LOCKDOWN_LIFTED', 'User disabled lockdown mode', settings).then(() => {
    console.log('Test completed.');
});
