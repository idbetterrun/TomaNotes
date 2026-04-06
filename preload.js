const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    security: {
        setPin: (pin) => ipcRenderer.invoke('security:set-pin', pin),
        verifyPin: (pin) => ipcRenderer.invoke('security:verify-pin', pin),
        hasPin: () => ipcRenderer.invoke('security:has-pin'),
        promptTouchID: (reason) => ipcRenderer.invoke('security:prompt-touch-id', reason),
        canPromptTouchID: () => ipcRenderer.invoke('security:can-prompt-touch-id'),
        clearPin: () => ipcRenderer.invoke('security:clear-pin')
    },
    system: {
        onBlur: (callback) => ipcRenderer.on('window-blur', callback),
        onFocus: (callback) => ipcRenderer.on('window-focus', callback),
        setLanguage: (language) => ipcRenderer.send('ui:set-language', language),
        openExternal: (url) => ipcRenderer.invoke('system:open-external', url)
    },
    window: {
        detachNote: (noteId) => ipcRenderer.invoke('window:detach-note', noteId),
        restoreNote: () => ipcRenderer.invoke('window:restore-note')
    }
});
