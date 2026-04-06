const { app, BrowserWindow, Menu, ipcMain, safeStorage, systemPreferences, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'security.json');
let currentUiLanguage = 'zh-CN';
let mainWindow = null;
const detachedWindows = new Map();

function saveSecurityConfig(data) {
    const existing = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};
    fs.writeFileSync(settingsPath, JSON.stringify({ ...existing, ...data }));
}
function getSecurityConfig() {
    return fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {};
}

function buildWindowUrl(noteId, detached) {
    const isDev = !app.isPackaged;
    const search = new URLSearchParams();
    if (noteId) search.set('note', String(noteId));
    if (detached) search.set('detached', '1');

    if (isDev) {
        return [`http://localhost:5173/?${search.toString()}`, `http://localhost:5174/?${search.toString()}`];
    }

    return [path.join(__dirname, 'dist/index.html')];
}

function createWindow(options = {}) {
    const { noteId = null, detached = false } = options;
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "TomaNotes", // 任务栏显示的标题
        icon: path.join(__dirname, 'public/icon.ico'), // 给你的 Windows 版加个图标
        titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
        trafficLightPosition: process.platform === 'darwin' ? { x: 16, y: 32 } : undefined,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js') // 建议预留这个文件处理原生交互
        }
    });

    // 隐藏默认的顶栏菜单（File, Edit...），让 UI 更有 Notion 那种沉浸感
    // Menu.setApplicationMenu(null); 

    const isDev = !app.isPackaged;
    const targets = buildWindowUrl(noteId, detached);

    if (!detached) {
        mainWindow = win;
    } else if (noteId) {
        detachedWindows.set(Number(noteId), win);
    }

    // Force all external links to open in the system browser.
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (/^https?:\/\//i.test(url)) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    win.webContents.on('will-navigate', (event, url) => {
        if (/^https?:\/\//i.test(url)) {
            event.preventDefault();
            shell.openExternal(url);
        }
    });

    win.on('closed', () => {
        if (detached && noteId) {
            detachedWindows.delete(Number(noteId));
        }
        if (!detached && mainWindow === win) {
            mainWindow = null;
        }
    });

    if (isDev) {
        win.loadURL(targets[0]).catch(() => {
            win.loadURL(targets[1]).catch(() => {
                win.loadFile(path.join(__dirname, 'dist/index.html'));
            });
        });
        // 开发模式自动打开调试工具
        win.webContents.openDevTools();
    } else {
        win.loadFile(targets[0]);
    }

    win.webContents.on('context-menu', (event, params) => {
        const labels = currentUiLanguage === 'en'
            ? {
                undo: 'Undo',
                redo: 'Redo',
                cut: 'Cut',
                copy: 'Copy',
                paste: 'Paste',
                pasteMatch: 'Paste and Match Style',
                del: 'Delete',
                selectAll: 'Select All',
                services: 'Services',
            }
            : currentUiLanguage === 'zh-TW'
            ? {
                undo: '復原',
                redo: '重做',
                cut: '剪下',
                copy: '複製',
                paste: '貼上',
                pasteMatch: '貼上並符合樣式',
                del: '刪除',
                selectAll: '全選',
                services: '服務',
            }
            : {
                undo: '撤销',
                redo: '重做',
                cut: '剪切',
                copy: '复制',
                paste: '粘贴',
                pasteMatch: '粘贴并匹配样式',
                del: '删除',
                selectAll: '全选',
                services: '服务',
            };
        const template = [
            { label: labels.undo, accelerator: 'CmdOrCtrl+Z', click: () => win.webContents.undo() },
            { label: labels.redo, accelerator: 'Shift+CmdOrCtrl+Z', click: () => win.webContents.redo() },
            { type: 'separator' },
            { label: labels.cut, accelerator: 'CmdOrCtrl+X', role: 'cut' },
            { label: labels.copy, accelerator: 'CmdOrCtrl+C', role: 'copy' },
            { label: labels.paste, accelerator: 'CmdOrCtrl+V', role: 'paste' },
            { label: labels.pasteMatch, accelerator: 'Shift+CmdOrCtrl+V', role: 'pasteAndMatchStyle' },
            { label: labels.del, role: 'delete' },
            { label: labels.selectAll, accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
        ];
        
        if (process.platform === 'darwin') {
            template.push({ type: 'separator' });
            template.push({ label: labels.services, role: 'services' });
        }

        const menu = Menu.buildFromTemplate(template);
        menu.popup({ window: win, x: params.x, y: params.y });
    });

    win.on('blur', () => win.webContents.send('window-blur'));
    win.on('focus', () => win.webContents.send('window-focus'));
}

// --- 安全通信机制 ---
ipcMain.handle('security:set-pin', (event, pin) => {
    if (!safeStorage.isEncryptionAvailable()) return false;
    const buffer = safeStorage.encryptString(pin);
    saveSecurityConfig({ pin: buffer.toString('hex') });
    return true;
});

ipcMain.handle('security:verify-pin', (event, pin) => {
    const config = getSecurityConfig();
    if (!config.pin) return false;
    try {
        const decrypted = safeStorage.decryptString(Buffer.from(config.pin, 'hex'));
        return decrypted === pin;
    } catch(e) {
        return false;
    }
});

ipcMain.handle('security:has-pin', () => {
    const config = getSecurityConfig();
    return !!config.pin;
});

ipcMain.handle('security:clear-pin', () => {
    saveSecurityConfig({ pin: null });
    return true;
});

ipcMain.handle('security:prompt-touch-id', async (event, reason) => {
    if (process.platform === 'darwin' && systemPreferences.canPromptTouchID()) {
        try {
            await systemPreferences.promptTouchID(reason);
            return true;
        } catch(e) {
            return false;
        }
    }
    return false;
});

ipcMain.handle('security:can-prompt-touch-id', () => {
    if (process.platform !== 'darwin') return false;
    return systemPreferences.canPromptTouchID();
});

ipcMain.on('ui:set-language', (_event, language) => {
    currentUiLanguage = language || 'zh-CN';
});

ipcMain.handle('system:open-external', async (_event, url) => {
    if (!url || !/^https?:\/\//i.test(url)) return false;
    await shell.openExternal(url);
    return true;
});

ipcMain.handle('window:detach-note', (_event, noteId) => {
    const normalizedId = Number(noteId);
    const existing = detachedWindows.get(normalizedId);
    if (existing && !existing.isDestroyed()) {
        if (existing.isMinimized()) existing.restore();
        existing.show();
        existing.focus();
        return true;
    }
    createWindow({ noteId: normalizedId, detached: true });
    return true;
});

ipcMain.handle('window:restore-note', (event) => {
    const sourceWindow = BrowserWindow.fromWebContents(event.sender);
    if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
    }
    if (sourceWindow && sourceWindow !== mainWindow && !sourceWindow.isDestroyed()) {
        sourceWindow.close();
    }
    return true;
});

// --- macOS 专属生命周期处理 ---

// 1. 当所有窗口都被关闭时，退出应用（Windows/Linux 习惯）
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// 2. 在 macOS 上，点击程序坞图标如果没有窗口则新建一个（Mac 习惯）
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.whenReady().then(createWindow);
