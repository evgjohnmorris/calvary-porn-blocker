const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let tray = null;
let mainWindow = null;

const DASHBOARD_URL = 'https://localhost:3456';

app.commandLine.appendSwitch('ignore-certificate-errors');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL(DASHBOARD_URL);

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Dashboard',
      click: () => {
        if (!mainWindow) {
          createWindow();
        }
        mainWindow.show();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Calvary Porn Blocker - Checking Status...');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (!mainWindow) {
      createWindow();
    }
    mainWindow.show();
  });

  // Poll backend status
  setInterval(() => {
    const https = require('https');
    const agent = new https.Agent({ rejectUnauthorized: false });
    https.get('https://localhost:3456/api/setup/status', { agent }, (res) => {
      if (res.statusCode === 200) {
        tray.setToolTip('Calvary Porn Blocker - Active');
      } else {
        tray.setToolTip('Calvary Porn Blocker - Issue Detected');
      }
    }).on('error', (err) => {
      tray.setToolTip('Calvary Porn Blocker - Offline');
    });
  }, 5000);
}

const { spawn } = require('child_process');
let agentProcess = null;

function startBackendAgent() {
  // In production, the path will be relative to resources directory
  // In dev, it's relative to the project root
  const isDev = !app.isPackaged;
  const agentPath = isDev 
    ? path.join(__dirname, '..', '..', 'PornBlockerAgent', 'server.js')
    : path.join(process.resourcesPath, 'PornBlockerAgent', 'server.js');
  const execPath = isDev ? 'node' : process.execPath;
  const env = isDev ? process.env : { ...process.env, ELECTRON_RUN_AS_NODE: '1' };
  
  agentProcess = spawn(execPath, [agentPath], {
    cwd: path.dirname(agentPath),
    env
  });

  agentProcess.stdout.on('data', (data) => console.log(`Agent: ${data}`));
  agentProcess.stderr.on('data', (data) => console.error(`Agent Error: ${data}`));
}

// In normal use, keep running in tray when windows close.
// But allow quit when app.isQuitting is set (e.g. tray Quit or Playwright close()).
app.on('window-all-closed', (e) => {
  if (!app.isQuitting) {
    e.preventDefault();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (agentProcess) {
    agentProcess.kill();
  }
});

app.whenReady().then(() => {
  startBackendAgent();
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
