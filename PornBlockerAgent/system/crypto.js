const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CRED_FILE = path.join(__dirname, 'credentials.key');
let AES_KEY;

if (fs.existsSync(CRED_FILE)) {
    AES_KEY = fs.readFileSync(CRED_FILE);
} else {
    AES_KEY = crypto.randomBytes(32);
    fs.writeFileSync(CRED_FILE, AES_KEY);
    try {
        const { execSync } = require('child_process');
        // Restrict file permissions using Windows ACLs to current user and SYSTEM
        execSync(`icacls "${CRED_FILE}" /inheritance:r /grant:r "%USERNAME%:(F)" "SYSTEM:(F)"`, { stdio: 'ignore' });
    } catch (e) {
        console.warn('[CRYPTO] Warning: Could not set strict file permissions on credentials.key.');
    }
}

function encryptSettings(jsonObject) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', AES_KEY, iv);
    
    let encrypted = cipher.update(JSON.stringify(jsonObject), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    return {
        encrypted: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag
    };
}

function decryptSettings(cipherObj) {
    try {
        const iv = Buffer.from(cipherObj.iv, 'hex');
        const authTag = Buffer.from(cipherObj.authTag, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', AES_KEY, iv);
        
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(cipherObj.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted);
    } catch (err) {
        console.error('[CRYPTO] Failed to decrypt settings. Data may be tampered.', err.message);
        throw new Error('Decryption Failed');
    }
}

// Generates an HMAC-SHA256 for audit log chaining
function generateLogHash(previousHash, logEntry) {
    const hmac = crypto.createHmac('sha256', AES_KEY);
    hmac.update(previousHash + logEntry);
    return hmac.digest('hex');
}

module.exports = {
    encryptSettings,
    decryptSettings,
    generateLogHash
};
