// Initialize Lucide Icons
lucide.createIcons();

// Connect to Socket.io server
const socket = io();

// DOM Elements
const alertsContainer = document.getElementById('alerts-container');
const logsBody = document.getElementById('logs-body');
const alertCountEl = document.getElementById('alert-count');
const logCountEl = document.getElementById('log-count');
const lastSyncTimeEl = document.getElementById('last-sync-time');
const toastContainer = document.getElementById('toast-container');

// State
let alerts = [];
let logs = [];

// Socket Events
socket.on('initial_state', (data) => {
    alerts = data.alerts || [];
    logs = data.logs || [];
    renderAlerts();
    renderLogs();
    updateStats();
});

socket.on('new_alert', (alert) => {
    alerts.unshift(alert);
    if (alerts.length > 100) alerts.pop();
    renderAlerts();
    updateStats();
    showToast(alert.eventName, alert.details || 'A high severity event occurred.');
});

// We can also poll for new logs manually if we don't send them via websocket
async function fetchState() {
    try {
        const btn = document.querySelector('.btn-refresh');
        btn.style.transform = 'rotate(180deg)';
        btn.style.transition = 'transform 0.5s';

        const res = await fetch('/api/state');
        const data = await res.json();
        alerts = data.alerts || [];
        logs = data.logs || [];
        
        renderAlerts();
        renderLogs();
        updateStats();
        lastSyncTimeEl.textContent = new Date().toLocaleTimeString();

        setTimeout(() => {
            btn.style.transform = 'none';
            btn.style.transition = 'none';
        }, 500);
    } catch (e) {
        console.error('Failed to fetch state', e);
    }
}

// Rendering Logic
function renderAlerts() {
    if (alerts.length === 0) {
        alertsContainer.innerHTML = '<div class="empty-state">No recent alerts. Everything looks good.</div>';
        return;
    }

    alertsContainer.innerHTML = alerts.map(alert => `
        <div class="alert-item">
            <div class="alert-header">
                <span class="alert-title"><i data-lucide="shield-alert" style="width:14px;height:14px;display:inline-block;vertical-align:text-bottom;"></i> ${formatEventName(alert.eventName)}</span>
                <span class="alert-time">${formatTime(alert.timestamp)}</span>
            </div>
            <div class="alert-detail">${escapeHtml(alert.details || 'No additional details provided.')}</div>
        </div>
    `).join('');
    
    // Re-initialize icons for newly added HTML
    lucide.createIcons();
}

function renderLogs() {
    if (logs.length === 0) {
        logsBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-secondary);">No logs synced yet.</td></tr>';
        return;
    }

    logsBody.innerHTML = logs.map(log => {
        // Parse standard log format: [Timestamp] IP: x.x.x.x | Action: ACTION | Details: ...
        const parts = log.split('|');
        if (parts.length < 3) return ''; // Skip malformed logs

        let timestampStr = parts[0].trim();
        let ip = parts[1].replace('IP:', '').trim();
        let action = parts[2].replace('Action:', '').trim();
        let details = parts.slice(3).join('|').replace('Details:', '').trim();

        // Extract raw timestamp between brackets if possible
        const tsMatch = timestampStr.match(/\[(.*?)\]/);
        const timestamp = tsMatch ? tsMatch[1] : timestampStr;

        return `
            <tr>
                <td>${formatTime(timestamp)}</td>
                <td class="log-action">${escapeHtml(action)}</td>
                <td>${escapeHtml(ip)}</td>
                <td class="log-details" title="${escapeHtml(details)}">${escapeHtml(details)}</td>
            </tr>
        `;
    }).join('');
}

function updateStats() {
    alertCountEl.textContent = alerts.length;
    logCountEl.textContent = logs.length;
}

function showToast(title, message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i data-lucide="alert-octagon"></i>
        <div>
            <div style="font-weight:700;font-size:0.9rem;">${formatEventName(title)}</div>
            <div style="font-size:0.8rem;opacity:0.9;margin-top:2px;">${escapeHtml(message)}</div>
        </div>
    `;
    toastContainer.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Helpers
function formatTime(isoString) {
    try {
        const d = new Date(isoString);
        return d.toLocaleString(undefined, { 
            month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    } catch (e) {
        return isoString;
    }
}

function formatEventName(str) {
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Initial fetch interval
setInterval(fetchState, 30000); // Poll every 30s as a fallback
