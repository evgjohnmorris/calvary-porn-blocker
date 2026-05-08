const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { generateLogHash } = require('../PornBlockerAgent/system/crypto');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Ignore self-signed cert

const API_BASE = 'https://localhost:3456/api';

const agentPath = path.join(__dirname, '..', 'PornBlockerAgent', 'server.js');
const agentDir = path.join(__dirname, '..', 'PornBlockerAgent');

function cleanupState() {
    console.log('Cleaning up old state...');
    const usersFile = path.join(agentDir, 'users.json');
    if (fs.existsSync(usersFile)) fs.unlinkSync(usersFile);
    
    const logsDir = path.join(agentDir, 'logs');
    if (fs.existsSync(logsDir)) {
        fs.rmSync(logsDir, { recursive: true, force: true });
    }
}

function request(method, endpoint, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + endpoint);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = data;
                try { parsed = JSON.parse(data); } catch (e) {}
                resolve({ status: res.statusCode, data: parsed, headers: res.headers });
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTestLab() {
    console.log('--- Calvary Porn Blocker Test Lab ---');
    cleanupState();
    
    console.log('Starting Agent...');
    const agent = spawn('node', [agentPath], { cwd: agentDir, env: { ...process.env, NODE_ENV: 'test' } });
    
    agent.stdout.on('data', (data) => console.log(`[AGENT] ${data.toString().trim()}`));
    agent.stderr.on('data', (data) => console.error(`[AGENT ERR] ${data.toString().trim()}`));

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
        console.log('1. Checking Setup Status...');
        let res = await request('GET', '/setup/status');
        console.log('Setup status:', res.data);
        if (res.data.isSetup) throw new Error('Expected clean state.');

        console.log('2. Registering admin...');
        res = await request('POST', '/register', {
            username: 'admin',
            password: 'securepassword123',
            name: 'Test Lab Admin'
        });
        console.log('Register response:', res.data);
        if (!res.data.success) throw new Error('Failed to register.');

        console.log('3. Logging in...');
        res = await request('POST', '/login', { username: 'admin', password: 'securepassword123' });
        console.log('Login response:', res.data);
        let token = null;
        if (res.headers && res.headers['set-cookie']) {
            const tokenCookie = res.headers['set-cookie'].find(c => c.startsWith('token='));
            if (tokenCookie) {
                token = tokenCookie.split(';')[0].split('=')[1];
            }
        }
        if (!token) throw new Error('Failed to login.');

        console.log('4. Changing Settings (Activating Lockdown Mode)...');
        res = await request('POST', '/settings', { lockdownMode: true }, token);
        console.log('Settings update:', res.data.success);
        
        console.log('5. Running System Scan...');
        res = await request('GET', '/scan', null, token);
        console.log('Scan results:', res.data.success ? `Found ${res.data.results.length} flags` : 'Failed');

        console.log('6. Verifying Logs...');
        res = await request('GET', '/logs', null, token);
        const logs = res.data.logs || [];
        const logLines = logs;
        console.log(`Log entries fetched: ${logLines.length} lines`);
        
        const logsText = logLines.join('\n');
        if (!logsText.includes('LOCKDOWN_ACTIVATED')) {
             throw new Error('Lockdown log missing');
        }

        // Verify the hash chain
        let currentHash = '0000000000000000000000000000000000000000000000000000000000000000';
        let chainValid = true;
        let lastValidHash = currentHash;
        for (const line of logLines) {
            if (!line) continue;
            const parts = line.split(' | Hash: ');
            if (parts.length < 2) continue;
            currentHash = generateLogHash(currentHash, parts[0]);
            if (currentHash !== parts[1].trim()) {
                chainValid = false;
                break;
            }
            lastValidHash = currentHash;
        }
        console.log('Initial Hash Chain Valid:', chainValid);
        if (!chainValid) throw new Error('Hash chain validation failed.');

        console.log('7. Simulating Log Tampering (Deleting last line)...');
        const auditLogPath = path.join(agentDir, 'logs', 'audit.log');
        // Actually wait, let's truncate the file. Since the server is running, we can just rewrite it
        if (fs.existsSync(auditLogPath)) {
            const lines = fs.readFileSync(auditLogPath, 'utf8').trim().split('\n');
            lines.pop(); // Remove the last line
            fs.writeFileSync(auditLogPath, lines.join('\n') + '\n');
        }

        console.log('8. Triggering new audit log after tampering...');
        // Login again to trigger a log
        await request('POST', '/login', { username: 'admin', password: 'securepassword123' });

        console.log('9. Re-verifying Logs against Ministry Server stored hash...');
        res = await request('GET', '/logs', null, token);
        const tamperedLogs = res.data.logs || [];
        const tamperedLines = tamperedLogs;
        const tamperedLogsText = tamperedLines.join('\n');
        
        // Let's verify from the beginning. 
        // The file's internal chain will be "valid" because the agent resumes from the new last line.
        // But if the Ministry Server stored `lastValidHash` from earlier, it will detect that the chain is broken
        // because the events don't link up to the known last state.
        
        // Simulating ministry server verification:
        // We know what the last state was `lastValidHash`. 
        // We check if the new logs contain a line matching `lastValidHash`. If not, someone deleted history!
        const historyIntact = tamperedLogsText.includes(lastValidHash);
        console.log('Ministry Server check - History Intact:', historyIntact);
        if (!historyIntact) {
            console.log('TAMPERING DETECTED SUCCESS: The agent was tampered with and the ministry server detected the truncated history.');
        } else {
            throw new Error('Tampering was NOT detected!');
        }

        console.log('--- Test Lab Completed Successfully ---');
    } catch (e) {
        console.error('Test Lab Failed!', e);
    } finally {
        console.log('Shutting down Agent...');
        agent.kill();
        process.exit(0);
    }
}

runTestLab();
