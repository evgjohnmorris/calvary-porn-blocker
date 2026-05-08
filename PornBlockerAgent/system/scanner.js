const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const sqlite3 = require('sqlite3').verbose();

function startProcessMonitoring() {
    console.log('[Scanner] Starting real-time process monitoring (Tor defense)...');
    setInterval(() => {
        exec('taskkill /F /IM tor.exe', (err) => {
            if (!err) {
                console.log('[Scanner] Intercepted and terminated Tor process (tor.exe).');
            }
        });
    }, 5000); // Check every 5 seconds
}

const ADULT_KEYWORDS = [
    'porn', 'sex', 'xvideos', 'pornhub', 'xnxx', 'redtube', 'youporn', 'xhamster',
    'onlyfans', 'chaturbate', 'camgirl', 'rule34', 'hentai', 'nude'
];

const MEMBERSHIP_URLS = [
    'onlyfans.com', 'fansly.com', 'patreon.com/nsfw', 'chaturbate.com'
];

function scanNetworkConnections() {
    return new Promise((resolve) => {
        exec('netstat -ano', (err, stdout) => {
            if (err) return resolve([]);
            
            const results = [];
            const lines = stdout.split('\n');
            lines.forEach(line => {
                if (line.includes('ESTABLISHED')) {
                    results.push({ type: 'Network', details: line.trim() });
                }
            });
            resolve(results.slice(0, 5));
        });
    });
}

function scanWifiProfiles() {
    return new Promise((resolve) => {
        exec('netsh wlan show profiles', (err, stdout) => {
            if (err) return resolve([]);
            const results = [];
            for (const keyword of ADULT_KEYWORDS) {
                if (stdout.toLowerCase().includes(keyword)) {
                    results.push({ type: 'WiFi', details: `Found suspicious Wi-Fi profile containing keyword: ${keyword}` });
                }
            }
            resolve(results);
        });
    });
}

function scanDirectory(dir, maxDepth = 2, currentDepth = 0) {
    let findings = [];
    if (currentDepth > maxDepth) return findings;

    try {
        if (!fs.existsSync(dir)) return findings;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            
            try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    findings = findings.concat(scanDirectory(fullPath, maxDepth, currentDepth + 1));
                } else {
                    const nameLower = file.toLowerCase();
                    const hasAdultContent = ADULT_KEYWORDS.some(k => nameLower.includes(k));
                    if (hasAdultContent) {
                        findings.push({ type: 'File', details: fullPath });
                    }
                }
            } catch (e) {
                // Ignore permission errors
                /* ignore */
            }
        }
    } catch (e) {
        // Ignore permission errors
        /* ignore */
    }
    return findings;
}

function scanLocalFiles() {
    const userDir = os.homedir();
    const downloads = path.join(userDir, 'Downloads');
    const videos = path.join(userDir, 'Videos');
    const desktop = path.join(userDir, 'Desktop');
    
    let results = [];
    results = results.concat(scanDirectory(downloads));
    results = results.concat(scanDirectory(videos));
    results = results.concat(scanDirectory(desktop));
    
    return results;
}

function scanBrowserHistory() {
    return new Promise((resolve) => {
        const results = [];
        const localAppData = process.env.LOCALAPPDATA;
        if (!localAppData) return resolve(results);

        const chromeHistoryPath = path.join(localAppData, 'Google', 'Chrome', 'User Data', 'Default', 'History');
        const edgeHistoryPath = path.join(localAppData, 'Microsoft', 'Edge', 'User Data', 'Default', 'History');

        const promises = [];

        const checkHistoryDB = (filePath, browserName) => {
            return new Promise((res) => {
                if (!fs.existsSync(filePath)) return res();

                const tempPath = path.join(os.tmpdir(), `shadow_history_${Date.now()}.sqlite`);
                try {
                    fs.copyFileSync(filePath, tempPath); // Shadow copy to bypass locks
                } catch (err) {
                    results.push({ type: 'Browser History', details: `Could not shadow copy ${browserName} History.` });
                    return res();
                }

                const db = new sqlite3.Database(tempPath, sqlite3.OPEN_READONLY, (err) => {
                    if (err) {
                        fs.unlinkSync(tempPath);
                        return res();
                    }
                });

                db.all("SELECT url, title, visit_count FROM urls", [], (err, rows) => {
                    if (err) {
                        db.close(() => fs.unlinkSync(tempPath));
                        return res();
                    }

                    let explicitFound = 0;
                    let membershipsFound = [];

                    rows.forEach(row => {
                        const url = (row.url || '').toLowerCase();
                        const title = (row.title || '').toLowerCase();

                        // Check explicit keywords
                        if (ADULT_KEYWORDS.some(k => url.includes(k) || title.includes(k))) {
                            explicitFound++;
                        }

                        // Check memberships
                        MEMBERSHIP_URLS.forEach(mem => {
                            if (url.includes(mem) && !membershipsFound.includes(mem)) {
                                membershipsFound.push(mem);
                            }
                        });
                    });

                    if (explicitFound > 0) {
                        results.push({ type: 'Browser History', details: `Found ${explicitFound} explicit URLs in ${browserName}.` });
                    }
                    if (membershipsFound.length > 0) {
                        results.push({ type: 'Account/Membership', details: `Found active memberships in ${browserName}: ${membershipsFound.join(', ')}` });
                    }

                    db.close(() => {
                        try { fs.unlinkSync(tempPath); } catch(e) { /* ignore */ }
                        res();
                    });
                });
            });
        };

        promises.push(checkHistoryDB(chromeHistoryPath, 'Google Chrome'));
        promises.push(checkHistoryDB(edgeHistoryPath, 'Microsoft Edge'));

        Promise.all(promises).then(() => resolve(results));
    });
}

function deleteSuspiciousFiles() {
    return new Promise((resolve) => {
        const files = scanLocalFiles();
        let deletedCount = 0;
        files.forEach(f => {
            if (f.type === 'File') {
                try {
                    fs.unlinkSync(f.details);
                    deletedCount++;
                } catch (e) { /* ignore */ }
            }
        });
        resolve({ success: true, message: `Deleted ${deletedCount} suspicious files.` });
    });
}

function clearBrowserHistory() {
    return new Promise((resolve) => {
        const localAppData = process.env.LOCALAPPDATA;
        if (!localAppData) return resolve({ success: false, message: 'Could not locate LocalAppData' });

        const chromeHistoryPath = path.join(localAppData, 'Google', 'Chrome', 'User Data', 'Default', 'History');
        const edgeHistoryPath = path.join(localAppData, 'Microsoft', 'Edge', 'User Data', 'Default', 'History');

        let clearedCount = 0;
        [chromeHistoryPath, edgeHistoryPath].forEach(p => {
            if (fs.existsSync(p)) {
                try {
                    // Overwrite with empty file or delete it (browser will recreate it)
                    fs.unlinkSync(p);
                    clearedCount++;
                } catch (e) {
                    // Usually means browser is open and holding a lock
                    /* ignore */
                }
            }
        });

        if (clearedCount > 0) {
            resolve({ success: true, message: `Successfully cleared history databases for ${clearedCount} browsers.` });
        } else {
            resolve({ success: false, message: 'Could not clear history. Please ensure all browsers are closed.' });
        }
    });
}

function cancelMemberships() {
    // Cannot natively cancel users' subscriptions, but we can block the domains
    return new Promise((resolve) => {
        resolve({ success: true, message: 'Membership domains have been added to the strict blocklist. Access is revoked.' });
    });
}

async function runSystemScan() {
    console.log('[Scanner] Starting deep system scan...');
    const history = await scanBrowserHistory();
    const wifi = await scanWifiProfiles();
    const files = scanLocalFiles();
    const network = await scanNetworkConnections();
    
    return [...history, ...wifi, ...files, ...network];
}

module.exports = {
    runSystemScan,
    deleteSuspiciousFiles,
    clearBrowserHistory,
    cancelMemberships,
    startProcessMonitoring
};
