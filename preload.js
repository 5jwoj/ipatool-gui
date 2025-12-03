const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 检查 ipatool
    checkIpatool: () => ipcRenderer.invoke('check-ipatool'),

    // 认证相关
    authLogin: (credentials) => ipcRenderer.invoke('auth-login', credentials),
    authInfo: () => ipcRenderer.invoke('auth-info'),
    authRevoke: () => ipcRenderer.invoke('auth-revoke'),

    // 搜索
    searchApps: (params) => ipcRenderer.invoke('search-apps', params),

    // 版本管理
    listVersions: (params) => ipcRenderer.invoke('list-versions', params),

    // 下载
    downloadApp: (params) => ipcRenderer.invoke('download-app', params),

    // 购买
    purchaseApp: (params) => ipcRenderer.invoke('purchase-app', params),

    // 配置
    getConfig: () => ipcRenderer.invoke('get-config'),
    saveConfig: (config) => ipcRenderer.invoke('save-config', config),

    // 文件系统
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    openFolder: (path) => ipcRenderer.invoke('open-folder', path),
    openExternal: (url) => ipcRenderer.invoke('open-external', url)
});
