const https = require('https');

function request(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: 3456,
            path: path,
            method: method,
            rejectUnauthorized: false,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data && method !== 'GET') {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runLabs() {
    console.log("=== Starting Labs of Trials ===");
    
    // Trial 1: Authentication
    console.log("\\n[Trial 1] Testing Authentication...");
    const loginRes = await request('POST', '/api/login', { username: 'admin', password: 'password123' });
    let token = null;
    
    if (loginRes.status === 200 && loginRes.data.token) {
        console.log("✅ Login successful. Token received.");
        token = loginRes.data.token;
    } else {
        console.log("❌ Login failed (might need setup or wrong password). Attempting to register...");
        const regRes = await request('POST', '/api/register', { username: 'admin', password: 'password' });
        console.log("Registration:", regRes.data);
        
        const loginRetry = await request('POST', '/api/login', { username: 'admin', password: 'password' });
        if (loginRetry.status === 200) {
            console.log("✅ Login successful after registration.");
            token = loginRetry.data.token;
        } else {
            console.log("❌ Cannot proceed without authentication.");
            return;
        }
    }

    // Trial 2: Ministry Mode Architecture
    console.log("\\n[Trial 2] Testing Ministry Mode Lockout Architecture...");
    console.log("Enabling Ministry Mode...");
    const enableMinistry = await request('POST', '/api/settings', { ministry_mode: true }, token);
    console.log("Response:", enableMinistry.data);

    console.log("Attempting unauthorized setting change (filterLevel)...");
    const changeFilter = await request('POST', '/api/settings', { filterLevel: 'off' }, token);
    if (changeFilter.status === 403) {
        console.log("✅ Architecture Test Passed: Ministry Mode correctly rejected local override. (403 Forbidden)");
    } else {
        console.log("❌ Architecture Test Failed: System allowed setting change during Ministry Mode.");
    }

    // Disable Ministry Mode to clean up
    console.log("Disabling Ministry Mode...");
    await request('POST', '/api/settings', { ministry_mode: false }, token);

    // Trial 3: System Scanner Infrastructure
    console.log("\\n[Trial 3] Testing Scanner Functionality...");
    const scanRes = await request('GET', '/api/scan', null, token);
    console.log("Scanner Response:", scanRes.data);
    if (scanRes.data && scanRes.data.success) {
        console.log("✅ Functionality Test Passed: Scanner executed successfully.");
    } else {
        console.log("❌ Functionality Test Failed or endpoint missing.");
    }

    console.log("\\n=== Labs Complete ===");
}

runLabs();
