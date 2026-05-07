const crypto = require('crypto');

// In a real enterprise application, this key should be loaded securely via DPAPI or KMS.
// For this prototype, we use a static derived 32-byte key.
const AES_KEY = crypto.scryptSync('AllySecretEnterpriseKey', 'salt', 32);

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
