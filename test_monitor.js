const { app, BrowserWindow } = require('electron');
const path = require('path');
app.whenReady().then(() => {
    const win = new BrowserWindow({
        width: 1200, height: 800,
        webPreferences: { contextIsolation: true, preload: path.join(__dirname, 'preload.js') }
    });
    win.webContents.on('console-message', (e, level, msg, line, id) => {
        if (level >= 2) console.log(`[BROWSER ERR] ${msg} at ${id}:${line}`);
    });
    win.webContents.session.webRequest.onBeforeRequest((details, callback) => {
        if(details.url.includes('.js')) console.log('[REQ]', details.url);
        callback({});
    });
    win.loadURL('http://localhost:5173').catch(e => {
        console.log('[LOAD_ERR]', e);
    });
});
app.on('window-all-closed', () => app.quit());
