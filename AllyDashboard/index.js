const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuration
const PORT = process.env.PORT || 4000;
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'calvary-secure-token-123'; // PSK for MVP

// Simple in-memory storage for MVP (could be backed by SQLite later)
const storageDir = path.join(__dirname, 'storage');
if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir);
}

const db = {
    logs: [],
    alerts: []
};

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Middleware for API endpoints
const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// --- REST API Endpoints ---

// Endpoint for the Agent to sync historical/regular audit logs
app.post('/api/logs/ingest', requireAuth, (req, res) => {
    const { logs } = req.body;
    
    if (!logs || !Array.isArray(logs)) {
        return res.status(400).json({ error: 'Invalid log format' });
    }

    console.log(`[Dashboard] Received ${logs.length} new log entries.`);
    
    // Prepend new logs to maintain reverse chronological order (newest first)
    db.logs = [...logs, ...db.logs];
    
    // Keep only the last 1000 logs in memory for performance
    if (db.logs.length > 1000) {
        db.logs = db.logs.slice(0, 1000);
    }

    // Persist to disk (simple JSON backup)
    fs.writeFileSync(path.join(storageDir, 'logs.json'), JSON.stringify(db.logs, null, 2));

    res.status(200).json({ success: true, ingested: logs.length });
});

// Endpoint for the Agent to send high-severity alerts instantly
app.post('/api/alerts', requireAuth, (req, res) => {
    const alert = req.body;
    
    if (!alert || !alert.eventName) {
        return res.status(400).json({ error: 'Invalid alert format' });
    }

    alert.timestamp = alert.timestamp || new Date().toISOString();
    alert.id = Date.now().toString() + Math.random().toString(36).substring(7);

    console.log(`[Dashboard] High-Severity Alert Received: ${alert.eventName}`);
    
    db.alerts.unshift(alert); // Add to beginning
    if (db.alerts.length > 100) db.alerts = db.alerts.slice(0, 100);
    fs.writeFileSync(path.join(storageDir, 'alerts.json'), JSON.stringify(db.alerts, null, 2));

    // Broadcast to connected web clients in real-time
    io.emit('new_alert', alert);

    res.status(200).json({ success: true, id: alert.id });
});

// Endpoint for frontend to fetch initial state
app.get('/api/state', (req, res) => {
    // Note: In a real production app, this would also be authenticated,
    // but for MVP dashboard it might be open or protected by basic auth.
    // We'll keep it simple for now to allow local testing.
    res.json({
        logs: db.logs.slice(0, 50), // Send last 50 logs
        alerts: db.alerts.slice(0, 20) // Send last 20 alerts
    });
});


// --- WebSockets ---
io.on('connection', (socket) => {
    console.log(`[Dashboard] Ally connected: ${socket.id}`);
    
    // Optionally send initial state upon connection
    socket.emit('initial_state', {
        alerts: db.alerts.slice(0, 20),
        logs: db.logs.slice(0, 50)
    });

    socket.on('disconnect', () => {
        console.log(`[Dashboard] Ally disconnected: ${socket.id}`);
    });
});

// --- Bootup ---

// Load existing data from disk if present
try {
    const logsFile = path.join(storageDir, 'logs.json');
    if (fs.existsSync(logsFile)) {
        db.logs = JSON.parse(fs.readFileSync(logsFile, 'utf8'));
    }
    const alertsFile = path.join(storageDir, 'alerts.json');
    if (fs.existsSync(alertsFile)) {
        db.alerts = JSON.parse(fs.readFileSync(alertsFile, 'utf8'));
    }
} catch (e) {
    console.error('[Dashboard] Error loading saved data:', e);
}

server.listen(PORT, () => {
    console.log(`[Dashboard] Ally Dashboard listening on port ${PORT}`);
});
