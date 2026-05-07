const { exec } = require('child_process');

// Embedded Local Proxy IP
const LOCAL_DNS = '127.0.0.1';

// CleanBrowsing Adult Filter (Fallback if embedded is disabled)
const DNS_STRICT = '185.228.168.10,185.228.169.11';
// CleanBrowsing Family Filter
const DNS_MODERATE = '185.228.168.168,185.228.169.168';

function runPowerShell(command) {
    return new Promise((resolve, reject) => {
        exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${command}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`PowerShell Error: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                console.error(`PowerShell Stderr: ${stderr}`);
                return reject(new Error(stderr));
            }
            resolve(stdout.trim());
        });
    });
}

async function applyFilter(level) {
    try {
        if (level === 'strict') {
            // Point Windows DNS to our embedded server
            await runPowerShell(`Get-NetAdapter | Where-Object Status -eq 'Up' | Set-DnsClientServerAddress -ServerAddresses ${LOCAL_DNS}`);
            console.log('Applied embedded local DNS filter.');
        } else if (level === 'moderate') {
            await runPowerShell(`Get-NetAdapter | Where-Object Status -eq 'Up' | Set-DnsClientServerAddress -ServerAddresses ${DNS_MODERATE}`);
            console.log('Applied moderate DNS filter.');
        } else if (level === 'off') {
            await runPowerShell(`Get-NetAdapter | Where-Object Status -eq 'Up' | Set-DnsClientServerAddress -ResetServerAddresses`);
            console.log('Removed DNS filter (Reset to automatic).');
        } else {
            console.warn(`Unknown filter level: ${level}`);
        }
        
        // Flush DNS cache
        await runPowerShell(`Clear-DnsClientCache`);
        return true;
    } catch (err) {
        console.error('Failed to apply DNS filter:', err);
        return false;
    }
}

async function verifyDNS(level) {
    try {
        const stdout = await runPowerShell(`(Get-DnsClientServerAddress -AddressFamily IPv4 | Where-Object { $_.ServerAddresses -ne $null }).ServerAddresses -join ','`);
        let expected = '';
        if (level === 'strict') expected = LOCAL_DNS;
        else if (level === 'moderate') expected = DNS_MODERATE;
        else return true; // Hard to verify 'off' generically because it picks up DHCP DNS.

        // If at least one active interface has the target DNS, consider it compliant.
        return stdout.includes(expected.split(',')[0]); 
    } catch (err) {
        console.error('Failed to verify DNS:', err);
        return false;
    }
}

module.exports = {
    applyFilter,
    verifyDNS
};
