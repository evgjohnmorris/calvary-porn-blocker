const fs = require('fs');
const path = require('path');
const https = require('https');
const dns2 = require('dns2');
const { Packet } = dns2;
const { getCorporateNetworkDomains } = require('./corporate-network-blocklist');

const UPSTREAM_DNS = '185.228.168.10';
const FALLBACK_DNS = '1.1.1.1';

const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '..', 'blocklist.db');
const db = new sqlite3.Database(dbPath);

// Initialize DB schema
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS blocked_domains (domain TEXT PRIMARY KEY)`);
    db.run(`PRAGMA synchronous = OFF`);
    db.run(`PRAGMA journal_mode = MEMORY`);
});

const util = require('util');
const dbGetAsync = util.promisify(db.get.bind(db));

// Seed corporate network + default hardcoded domains at startup
db.serialize(() => {
    const stmt = db.prepare('INSERT OR IGNORE INTO blocked_domains (domain) VALUES (?)');
    const corporateDomains = getCorporateNetworkDomains();
    console.log(`[DNS] Seeding ${corporateDomains.length} corporate network / ad network domains...`);
    corporateDomains.forEach(domain => stmt.run(domain));
    stmt.finalize(() => {
        console.log('[DNS] Corporate network blocklist loaded into DB.');
    });
});

// SafeSearch Enforcements (hardcoded mappings to SafeSearch IPs)
const SAFESEARCH_MAP = {
    'www.google.com': '216.239.38.120',
    'google.com': '216.239.38.120',
    'www.bing.com': '204.79.197.220',
    'bing.com': '204.79.197.220',
    'www.duckduckgo.com': '107.20.240.232',
    'duckduckgo.com': '107.20.240.232',
    'www.youtube.com': '216.239.38.120',
    'm.youtube.com': '216.239.38.120',
    'youtube.com': '216.239.38.120',
    'www.youtubei.googleapis.com': '216.239.38.120',
    'youtubei.googleapis.com': '216.239.38.120'
};
let isServerRunning = false;
let dnsServer = null;

// The blocklists to download and use
const LISTS = [
    // Hosts-format (0.0.0.0 <domain>)
    { name: 'stevenblack-porn-hosts.txt', url: 'https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn/hosts' },
    // Plain domain-per-line (blocklistproject)
    { name: 'blocklistproject-porn.txt', url: 'https://blocklistproject.github.io/Lists/porn.txt' },
    // OISD NSFW - one of the most comprehensive maintained adult blocklists
    { name: 'oisd-nsfw.txt', url: 'https://nsfw.oisd.nl' },
    // Hagezi NSFW - curated adult content blocklist (hosts format)
    { name: 'hagezi-nsfw-hosts.txt', url: 'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/hosts/nosafesearch.txt' },
];


async function downloadBlocklists() {
    console.log('[DNS] Checking for blocklist updates...');
    const oneDay = 24 * 60 * 60 * 1000;
    for (const list of LISTS) {
        const dest = path.join(__dirname, '..', list.name);
        let needsDownload = true;
        if (fs.existsSync(dest)) {
            const stats = fs.statSync(dest);
            if (Date.now() - stats.mtimeMs < oneDay) {
                needsDownload = false;
            }
        }
        
        if (needsDownload) {
            console.log(`[DNS] Downloading global blocklist: ${list.name}`);
            try {
                await new Promise((resolve, reject) => {
                    const file = fs.createWriteStream(dest);
                    https.get(list.url, response => {
                        if (response.statusCode === 301 || response.statusCode === 302) {
                            https.get(response.headers.location, res2 => {
                                res2.pipe(file);
                                file.on('finish', () => file.close(resolve));
                            }).on('error', err => reject(err));
                        } else {
                            response.pipe(file);
                            file.on('finish', () => file.close(resolve));
                        }
                    }).on('error', err => {
                        fs.unlink(dest, () => {});
                        reject(err);
                    });
                });
                console.log(`[DNS] Successfully downloaded ${list.name}`);
            } catch (err) {
                console.error(`[DNS] Failed to download ${list.name}: ${err.message}`);
            }
        }
    }
}

/**
 * Parses blocklist files and inserts them into the SQLite database.
 */
function loadBlocklists() {
    console.log('[DNS] Loading massive blocklists into SQLite database...');
    const startTime = Date.now();
    let count = 0;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        const stmt = db.prepare('INSERT OR IGNORE INTO blocked_domains (domain) VALUES (?)');

        for (const list of LISTS) {
            const listPath = path.join(__dirname, '..', list.name);
            if (fs.existsSync(listPath)) {
                const content = fs.readFileSync(listPath, 'utf8');
                const lines = content.split('\n');
                for (const line of lines) {
                    let trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;
                    
                    if (trimmed.startsWith('||') && trimmed.endsWith('^')) {
                        trimmed = trimmed.substring(2, trimmed.length - 1);
                    } else if (trimmed.startsWith('0.0.0.0 ')) {
                        trimmed = trimmed.substring(8).trim();
                    } else if (trimmed.startsWith('127.0.0.1 ')) {
                        trimmed = trimmed.substring(10).trim();
                    }

                    const hashIndex = trimmed.indexOf('#');
                    if (hashIndex !== -1) {
                        trimmed = trimmed.substring(0, hashIndex).trim();
                    }

                    if (trimmed) {
                        stmt.run(trimmed.toLowerCase());
                        count++;
                    }
                }
            } else {
                console.warn(`[DNS] Warning: Blocklist file not found: ${listPath}`);
            }
        }
        stmt.finalize();
        db.run('COMMIT', () => {
            db.get('SELECT COUNT(*) AS count FROM blocked_domains', (err, row) => {
                const endTime = Date.now();
                console.log(`[DNS] SQLite Loaded ${row ? row.count : 0} unique domains into db in ${endTime - startTime}ms. (Lines processed: ${count})`);
            });
        });
    });
}

/**
 * Fetches ExoClick's rotating ad-serving domains from their own publisher API.
 * ExoClick rotates these every few days to evade blocklists — this beats them
 * at their own game by polling the list they publish for their own publishers.
 */
async function fetchExoClickDynamicDomains() {
    return new Promise((resolve) => {
        const url = 'https://ads.exoclick.com/adblock-domains.php';
        console.log('[DNS] Fetching ExoClick dynamic ad-serving domains...');
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                const domains = data.split('\n')
                    .map(l => l.trim().toLowerCase())
                    .filter(l => l && !l.startsWith('#') && l.includes('.'));
                if (domains.length > 0) {
                    db.serialize(() => {
                        db.run('BEGIN TRANSACTION');
                        const stmt = db.prepare('INSERT OR IGNORE INTO blocked_domains (domain) VALUES (?)');
                        domains.forEach(d => stmt.run(d));
                        stmt.finalize();
                        db.run('COMMIT', () => {
                            console.log(`[DNS] Blocked ${domains.length} ExoClick rotating ad domains.`);
                        });
                    });
                }
                resolve(domains);
            });
        }).on('error', (err) => {
            console.warn(`[DNS] Could not fetch ExoClick dynamic domains: ${err.message}`);
            resolve([]);
        });
    });
}

/**
 * Starts the embedded DNS server
 */
async function startDNSServer() {
    if (isServerRunning) return;

    await downloadBlocklists();
    loadBlocklists();

    // Fetch ExoClick rotating domains immediately, then refresh every 48 hours
    await fetchExoClickDynamicDomains();
    const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
    setInterval(fetchExoClickDynamicDomains, FORTY_EIGHT_HOURS);

    dnsServer = dns2.createServer({
        udp: true,
        handle: async (request, send, rinfo) => {
            const response = Packet.createResponseFromRequest(request);
            const [ question ] = request.questions;
            
            if (!question) {
                return send(response);
            }

            const name = question.name.toLowerCase();

            // Check against SQLite Database
            try {
                const row = await dbGetAsync('SELECT 1 FROM blocked_domains WHERE domain = ?', [name]);
                if (row) {
                    // Return 0.0.0.0 (Null routing)
                    response.answers.push({
                        name: question.name,
                        type: Packet.TYPE.A,
                        class: Packet.CLASS.IN,
                        ttl: 300,
                        address: '0.0.0.0'
                    });
                    return send(response);
                }
            } catch (err) {
                console.error(`[DNS] DB Query error:`, err);
            }

            // Enforce SafeSearch
            if (SAFESEARCH_MAP[name] && question.type === Packet.TYPE.A) {
                console.log(`[DNS] Forcing SafeSearch for ${name}`);
                response.answers.push({
                    name: question.name,
                    type: Packet.TYPE.A,
                    class: Packet.CLASS.IN,
                    ttl: 300,
                    address: SAFESEARCH_MAP[name]
                });
                return send(response);
            }

            // Forward to upstream
            try {
                const upstreamResponse = await dns2.resolve(question.name, question.type, { servers: [UPSTREAM_DNS, FALLBACK_DNS] });
                response.answers = upstreamResponse.answers;
                response.authorities = upstreamResponse.authorities;
                response.additionals = upstreamResponse.additionals;
                send(response);
            } catch (err) {
                // If upstream resolution fails, just send an empty response
                send(response);
            }
        }
    });

    dnsServer.on('error', (err) => {
        console.error(`[DNS] Server Error: ${err.message}`);
    });

    dnsServer.listen({
        udp: { port: 53, address: '127.0.0.1' },
        tcp: { port: 53, address: '127.0.0.1' }
    });

    console.log('[DNS] Embedded DNS Server listening on 127.0.0.1:53');
    isServerRunning = true;

    // Start DB Optimization / Maintenance Interval (runs every 12 hours)
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    this.maintenanceInterval = setInterval(() => {
        if (fs.existsSync(dbPath)) {
            const stats = fs.statSync(dbPath);
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`[DNS] Running DB Maintenance. Current DB size: ${sizeMB} MB`);
            
            db.serialize(() => {
                db.run('PRAGMA optimize');
                // Vacuum rebuilds the entire database file, reclaiming unused space
                // It is very useful after large blocklist updates
                db.run('VACUUM', (err) => {
                    if (err) {
                        console.error(`[DNS] Error during DB VACUUM:`, err);
                    } else {
                        const newStats = fs.statSync(dbPath);
                        const newSizeMB = (newStats.size / (1024 * 1024)).toFixed(2);
                        console.log(`[DNS] DB Maintenance complete. New size: ${newSizeMB} MB`);
                    }
                });
            });
        }
    }, TWELVE_HOURS);
}

function stopDNSServer() {
    if (this.maintenanceInterval) {
        clearInterval(this.maintenanceInterval);
    }
    
    if (dnsServer && isServerRunning) {
        dnsServer.close();
        isServerRunning = false;
        console.log('[DNS] Embedded DNS Server stopped.');
    }
}

module.exports = {
    startDNSServer,
    stopDNSServer,
    loadBlocklists
};
