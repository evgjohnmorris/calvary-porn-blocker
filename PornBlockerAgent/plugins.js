const fs = require('fs');
const path = require('path');
const { applyPlugins } = require('./system/plugins-engine');

const PLUGINS_FILE = path.join(__dirname, 'plugins.json');

// Default plugins
const defaultPlugins = [
    { id: 'safesearch', name: 'Global SafeSearch', description: 'Enforces SafeSearch and Restricted Mode on Google, Bing, and YouTube via DNS redirection.', enabled: false },
    { id: 'reddit-safe', name: 'Reddit Safe Mode', description: 'Forces Safe Mode on Reddit to blur/block NSFW content.', enabled: false },
    { id: 'twitter-safe', name: 'Twitter Media Filter', description: 'Hides sensitive media on Twitter/X.', enabled: false }
];

function loadPlugins() {
    if (!fs.existsSync(PLUGINS_FILE)) {
        fs.writeFileSync(PLUGINS_FILE, JSON.stringify(defaultPlugins, null, 2));
    }
    
    let plugins = JSON.parse(fs.readFileSync(PLUGINS_FILE, 'utf8'));
    
    // Auto-migrate new default plugins if they don't exist in the current plugins.json
    let migrated = false;
    defaultPlugins.forEach(dp => {
        if (!plugins.find(p => p.id === dp.id)) {
            plugins.push(dp);
            migrated = true;
        }
    });

    if (migrated) {
        savePlugins(plugins);
    }
    
    return plugins;
}

function savePlugins(plugins) {
    fs.writeFileSync(PLUGINS_FILE, JSON.stringify(plugins, null, 2));
}

function togglePlugin(id, enabled) {
    const plugins = loadPlugins();
    const plugin = plugins.find(p => p.id === id);
    if (plugin) {
        plugin.enabled = enabled;
        savePlugins(plugins);
        // Apply the plugin logic via the system engine
        applyPlugins(plugins);
        return true;
    }
    return false;
}

module.exports = { loadPlugins, togglePlugin };
