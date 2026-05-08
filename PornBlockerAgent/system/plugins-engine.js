const fs = require('fs');
const { exec } = require('child_process');

const HOSTS_PATH = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
const SAFESEARCH_IP = '216.239.38.120';

// Markers so we can safely replace our injected lines
const MARKER_START = '# --- ALLY AGENT PLUGINS START ---';
const MARKER_END = '# --- ALLY AGENT PLUGINS END ---';

// Mapping plugin IDs to the hostnames they affect
const pluginRules = {
    'safesearch': [
        'www.google.com',
        'google.com',
        'www.youtube.com',
        'youtube.com',
        'm.youtube.com',
        'youtubei.googleapis.com',
        'youtube.googleapis.com',
        'www.youtube-nocookie.com'
    ],
    'reddit-safe': [
        // Reddit doesn't have a DNS-level safe mode. We might block it entirely or leave as placeholder.
        // For demonstration, we could map it to a blocked page, or omit it.
    ],
    'twitter-safe': [
        // Same for Twitter.
    ]
};

function runPowerShell(command) {
    return new Promise((resolve, reject) => {
        exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${command}"`, (error, stdout) => {
            if (error) {
                console.error(`PowerShell Error: ${error.message}`);
                return reject(error);
            }
            resolve(stdout.trim());
        });
    });
}

async function applyPlugins(activePlugins) {
    let hostsContent = '';
    try {
        hostsContent = fs.readFileSync(HOSTS_PATH, 'utf8');
    } catch (e) {
        console.error('Could not read hosts file. Ensure running as Administrator.', e);
        return false;
    }

    // Strip out the old block
    const regex = new RegExp(`\\n?${MARKER_START}[\\s\\S]*?${MARKER_END}\\n?`, 'g');
    hostsContent = hostsContent.replace(regex, '');

    // Build the new block
    let injectedLines = [];
    activePlugins.forEach(plugin => {
        if (plugin.enabled && pluginRules[plugin.id]) {
            pluginRules[plugin.id].forEach(hostname => {
                injectedLines.push(`${SAFESEARCH_IP} ${hostname}`);
            });
        }
    });

    if (injectedLines.length > 0) {
        hostsContent += `\n${MARKER_START}\n`;
        hostsContent += injectedLines.join('\n') + '\n';
        hostsContent += `${MARKER_END}\n`;
    }

    try {
        fs.writeFileSync(HOSTS_PATH, hostsContent.trim() + '\n', 'utf8');
        // Flush DNS to ensure the new hosts file takes precedence
        await runPowerShell(`Clear-DnsClientCache`);
        console.log('Plugins applied to hosts file.');
        return true;
    } catch (e) {
        console.error('Failed to write hosts file. Requires Administrator privileges.', e);
        return false;
    }
}

module.exports = {
    applyPlugins
};
