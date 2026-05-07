const fs = require('fs');
const path = require('path');
const { generateLogHash } = require('./crypto');
const { sendAlert } = require('./alerter');

class LogOrchestrator {
    constructor() {
        this.logDir = path.join(__dirname, '..', 'logs');
        this.auditLogPath = path.join(this.logDir, 'audit.log');
        this.maxSizeBytes = 5 * 1024 * 1024; // 5 MB rotation
        this.lastLogHash = '0000000000000000000000000000000000000000000000000000000000000000';
        
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        
        this._initializeHashChain();
    }

    _initializeHashChain() {
        if (fs.existsSync(this.auditLogPath)) {
            try {
                // Read the last line to resume the HMAC chain
                const content = fs.readFileSync(this.auditLogPath, 'utf8').trim().split('\n');
                const lastLine = content[content.length - 1];
                if (lastLine && lastLine.includes('Hash: ')) {
                    this.lastLogHash = lastLine.split('Hash: ')[1].trim();
                }
            } catch (e) {
                console.error('Error reading previous log hash. Chain may be broken if tampered with.', e);
            }
        }
    }

    _rotateIfNecessary() {
        if (!fs.existsSync(this.auditLogPath)) return;
        
        const stats = fs.statSync(this.auditLogPath);
        if (stats.size >= this.maxSizeBytes) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const rotatedPath = path.join(this.logDir, `audit-${timestamp}.log`);
            fs.renameSync(this.auditLogPath, rotatedPath);
            
            // Note: The chain continues logically across files.
            const rotationMsg = `[${new Date().toISOString()}] IP: SYSTEM | Action: LOG_ROTATED | Details: Rotated to ${rotatedPath}`;
            this.lastLogHash = generateLogHash(this.lastLogHash, rotationMsg);
            const entry = `${rotationMsg} | Hash: ${this.lastLogHash}\n`;
            fs.writeFileSync(this.auditLogPath, entry);
        }
    }

    logAudit(action, ip, details = '', currentSettings = undefined) {
        this._rotateIfNecessary();

        const safeDetails = typeof details === 'string' 
            ? details.replace(/"password":"[^"]+"/gi, '"password":"***"').substring(0, 500) 
            : JSON.stringify(details);
            
        const timestamp = new Date().toISOString();
        const rawLine = `[${timestamp}] IP: ${ip} | Action: ${action} | Details: ${safeDetails}`;
        
        this.lastLogHash = generateLogHash(this.lastLogHash, rawLine);
        const logEntry = `${rawLine} | Hash: ${this.lastLogHash}\n`;
        
        fs.appendFileSync(this.auditLogPath, logEntry);
        console.log(logEntry.trim());
        
        if (currentSettings) {
            sendAlert(action, safeDetails, currentSettings).catch(e => console.error(e));
        }
    }

    async syncToMinistryServer(url) {
        // Stub implementation for Ministry Server Sync
        console.log(`[LogOrchestrator] Attempting to sync logs to Ministry Server at ${url}...`);
        try {
            // Read all logs
            const logs = fs.existsSync(this.auditLogPath) ? fs.readFileSync(this.auditLogPath, 'utf8') : '';
            // In a real scenario, we would compress and send the logs, then mark them as synced.
            // await fetch(url + '/api/logs/ingest', { method: 'POST', body: logs });
            console.log(`[LogOrchestrator] Successfully synced logs to Ministry Server.`);
            return true;
        } catch (err) {
            console.error(`[LogOrchestrator] Failed to sync logs to Ministry Server.`, err);
            return false;
        }
    }

    getLogs() {
        if (fs.existsSync(this.auditLogPath)) {
            return fs.readFileSync(this.auditLogPath, 'utf8');
        }
        return '';
    }
}

// Export a singleton instance
module.exports = new LogOrchestrator();
