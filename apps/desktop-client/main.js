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

  tray.setToolTip('Calvary Blocker - Checking Status...');
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
        tray.setToolTip('Calvary Blocker - Active');
      } else {
        tray.setToolTip('Calvary Blocker - Issue Detected');
      }
    }).on('error', (err) => {
      tray.setToolTip('Calvary Blocker - Offline');
    });
  }, 5000);
}

// Make sure the app doesn't quit when all windows are closed
app.on('window-all-closed', (e) => {
  e.preventDefault();
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
