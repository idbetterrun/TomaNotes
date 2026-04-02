const { app, BrowserWindow, ipcMain, safeStorage, systemPreferences } = require('electron');
const path = require('path');
const fs = require('fs');

const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'security.json');

function saveSecurityConfig(data) {
    const existing = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};
    fs.writeFileSync(settingsPath, JSON.stringify({ ...existing, ...data }));
}
function getSecurityConfig() {
    return fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.webContents.on('console-message', (event, level, message, line, sourceId) => {
        if (level >= 2) {
             console.log(`[BROWSER CHROME ERROR] ${message} | ${sourceId}:${line}`);
        }
    });

    win.loadURL('http://localhost:5173').catch(() => {
        win.loadFile(path.join(__dirname, 'dist/index.html'));
    });
}
app.whenReady().then(createWindow);

ipcMain.handle('security:set-pin', (event, pin) => { return true; });
ipcMain.handle('security:verify-pin', (event, pin) => { return true; });
ipcMain.handle('security:has-pin', () => { return false; });
ipcMain.handle('security:clear-pin', () => { return true; });
ipcMain.handle('security:prompt-touch-id', async () => { return false; });
ipcMain.handle('security:can-prompt-touch-id', () => { return false; });
