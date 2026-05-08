'use strict';

const fs   = require('fs');
const path = require('path');
const { decryptSettings, encryptSettings } = require('../system/crypto');

/**
 * Load JSON data from disk.
 *
 * @param {string} filePath    - Absolute path to the JSON file.
 * @param {*}      defaultData - Value returned when the file does not exist.
 * @param {boolean} isEncrypted - Whether the file contents are AES-encrypted.
 * @returns {*} Parsed data or defaultData on error / absence.
 */
function loadData(filePath, defaultData = {}, isEncrypted = false) {
    if (fs.existsSync(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            if (isEncrypted) {
                return decryptSettings(JSON.parse(content));
            }
            return JSON.parse(content);
        } catch (e) {
            console.error(`[store] Error reading ${path.basename(filePath)}:`, e.message);
        }
    }
    return defaultData;
}

/**
 * Persist JSON data to disk with an atomic write (write-then-rename).
 *
 * @param {string}  filePath    - Absolute path to the JSON file.
 * @param {*}       data        - Data to serialise.
 * @param {boolean} isEncrypted - Whether to AES-encrypt before writing.
 */
function saveData(filePath, data, isEncrypted = false) {
    const payload  = isEncrypted ? encryptSettings(data) : data;
    const tmp      = filePath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(payload, null, 2), 'utf8');
    fs.renameSync(tmp, filePath);
}

module.exports = { loadData, saveData };
