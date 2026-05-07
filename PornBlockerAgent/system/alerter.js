const nodemailer = require('nodemailer');
const twilio = require('twilio');

let transporter = null;

async function getTransporter(accountabilitySettings) {
    if (transporter) return transporter;

    // Use provided SMTP settings or fallback to Ethereal for testing
    if (accountabilitySettings.smtpHost && accountabilitySettings.smtpUser && accountabilitySettings.smtpPass) {
        transporter = nodemailer.createTransport({
            host: accountabilitySettings.smtpHost,
            port: accountabilitySettings.smtpPort || 587,
            secure: accountabilitySettings.smtpPort == 465,
            auth: {
                user: accountabilitySettings.smtpUser,
                pass: accountabilitySettings.smtpPass
            }
        });
    } else {
        // Fallback to test ethereal account for development
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log(`[Alerter] Using test SMTP account: ${testAccount.user}`);
        } catch (e) {
            console.error('[Alerter] Failed to create test account:', e);
            throw e;
        }
    }
    return transporter;
}

async function sendSMSAlert(partner, subject, text, accountabilitySettings) {
    if (!accountabilitySettings.twilioSid || !accountabilitySettings.twilioAuth || !accountabilitySettings.twilioFrom || !partner.phone) {
        return;
    }
    
    try {
        const client = twilio(accountabilitySettings.twilioSid, accountabilitySettings.twilioAuth);
        const message = await client.messages.create({
            body: `${subject}\n\n${text}`,
            from: accountabilitySettings.twilioFrom,
            to: partner.phone
        });
        console.log(`[Alerter] SMS sent to ${partner.phone}. Message ID: ${message.sid}`);
    } catch (err) {
        console.error(`[Alerter] Failed to send SMS to ${partner.phone}:`, err);
    }
}

async function sendAlert(eventName, details, settings) {
    if (!settings || !settings.accountability || !settings.accountability.enabled) {
        return; // Alerts not enabled
    }

    const partners = settings.accountability.partners || [];
    if (partners.length === 0) return;

    // Check if the event is high-severity
    const highSeverityEvents = [
        'MINISTRY_MODE_VIOLATION',
        'LOCKDOWN_LIFTED',
        'BYPASS_ATTEMPT_DETECTED'
    ];
    
    if (!highSeverityEvents.includes(eventName)) {
        return; // We don't alert for this event
    }

    const subject = `[ALERT] Calvary Blocker: High-Severity Event Detected`;
    const text = `Accountability Alert\n\nA high-severity event was logged on the monitored device.\nEvent Type: ${eventName}\nDetails: ${details}\nTime: ${new Date().toISOString()}\n\nPlease check in with your accountability partner.\n\n- Calvary Sexual Immorality Blocker`;

    try {
        const mailTransporter = await getTransporter(settings.accountability);
        
        for (const partner of partners) {
            // Send Email
            if (partner.email) {
                try {
                    const info = await mailTransporter.sendMail({
                        from: '"Calvary Blocker Alert" <alerts@calvaryblocker.local>',
                        to: partner.email,
                        subject: subject,
                        text: text,
                    });
                    console.log(`[Alerter] Alert sent to ${partner.email}. Message ID: ${info.messageId}`);
                    if (info.messageId && mailTransporter.options.host === 'smtp.ethereal.email') {
                        console.log(`[Alerter] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
                    }
                } catch (emailErr) {
                    console.error(`[Alerter] Failed to send email to ${partner.email}:`, emailErr);
                }
            }
            
            // Send SMS
            if (partner.phone) {
                await sendSMSAlert(partner, subject, text, settings.accountability);
            }
        }
    } catch (err) {
        console.error(`[Alerter] Failed to initialize mail transporter or send alerts:`, err);
    }
}

module.exports = {
    sendAlert
};
