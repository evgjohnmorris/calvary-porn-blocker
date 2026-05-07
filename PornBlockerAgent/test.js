const https = require('https');

const data = JSON.stringify({ password: 'AllyAdmin2026!' });

const options = {
  hostname: 'localhost',
  port: 3456,
  path: '/api/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  rejectUnauthorized: false // Ignore self-signed cert
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
