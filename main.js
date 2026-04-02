const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "TomaNotes", // 任务栏显示的标题
        icon: path.join(__dirname, 'public/icon.ico'), // 给你的 Windows 版加个图标
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js') // 建议预留这个文件处理原生交互
        }
    });

    // 隐藏默认的顶栏菜单（File, Edit...），让 UI 更有 Notion 那种沉浸感
    // Menu.setApplicationMenu(null); 

    const isDev = !app.isPackaged;

    if (isDev) {
        // 智能侦测 Vite 端口，增加容错
        win.loadURL('http://localhost:5173').catch(() => {
            win.loadURL('http://localhost:5174').catch(() => {
                win.loadFile(path.join(__dirname, 'dist/index.html'));
            });
        });
        // 开发模式自动打开调试工具
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, 'dist/index.html'));
    }
}

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