const fs = require('fs');
const path = require('path');
const https = require('https');
const dns2 = require('dns2');
const { Packet } = dns2;

// Upstream DNS (CleanBrowsing Adult Filter)
const UPSTREAM_DNS = '185.228.168.10';
const FALLBACK_DNS = '1.1.1.1';

const blockedDomains = new Set([
    'i.redd.it', 
    'v.redd.it', 
    'preview.redd.it',
    'redditmedia.com'
]);
let isServerRunning = false;
let dnsServer = null;

// The blocklists to download and use
const LISTS = [
    { name: 'stevenblack-porn-hosts.txt', url: 'https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn/hosts' },
    { name: 'blocklistproject-porn.txt', url: 'https://blocklistproject.github.io/Lists/porn.txt' }
];

// OISD is currently offline/changed paths for direct blocklist, using StevenBlack and BlocklistProject as primary sources.

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
 * Parses blocklist files into the Set.
 */
function loadBlocklists() {
    console.log('[DNS] Loading massive blocklists into memory...');
    const startTime = Date.now();
    let count = 0;

    for (const list of LISTS) {
        const listPath = path.join(__dirname, '..', list.name);
        if (fs.existsSync(listPath)) {
            const content = fs.readFileSync(listPath, 'utf8');
            const lines = content.split('\n');
            for (const line of lines) {
                let trimmed = line.trim();
                // Ignore comments and empty lines
                if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;
                
                // Some lists use "0.0.0.0 domain.com", others use "||domain.com^", others are just "domain.com"
                // OISD uses "||domain.com^"
                if (trimmed.startsWith('||') && trimmed.endsWith('^')) {
                    trimmed = trimmed.substring(2, trimmed.length - 1);
                } 
                // StevenBlack/BlocklistProject uses "0.0.0.0 domain.com"
                else if (trimmed.startsWith('0.0.0.0 ')) {
                    trimmed = trimmed.substring(8).trim();
                } else if (trimmed.startsWith('127.0.0.1 ')) {
                    trimmed = trimmed.substring(10).trim();
                }

                // Strip any trailing comments (e.g., "domain.com # comment")
                const hashIndex = trimmed.indexOf('#');
                if (hashIndex !== -1) {
                    trimmed = trimmed.substring(0, hashIndex).trim();
                }

                if (trimmed) {
                    blockedDomains.add(trimmed.toLowerCase());
                    count++;
                }
            }
        } else {
            console.warn(`[DNS] Warning: Blocklist file not found: ${listPath}`);
        }
    }
    const endTime = Date.now();
    console.log(`[DNS] Loaded ${blockedDomains.size} unique domains into memory in ${endTime - startTime}ms. (Total lines processed: ${count})`);
}

/**
 * Starts the embedded DNS server
 */
async function startDNSServer() {
    if (isServerRunning) return;

    await downloadBlocklists();
    loadBlocklists();

    dnsServer = dns2.createServer({
        udp: true,
        handle: async (request, send, rinfo) => {
            const response = Packet.createResponseFromRequest(request);
            const [ question ] = request.questions;
            
            if (!question) {
                return send(response);
            }

            const name = question.name.toLowerCase();

            // Check against our Set
            if (blockedDomains.has(name)) {
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
}

function stopDNSServer() {
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
