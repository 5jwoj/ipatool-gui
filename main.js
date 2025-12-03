const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

let mainWindow;

// 配置文件路径
const configPath = path.join(app.getPath('userData'), 'config.json');

// 默认配置
const defaultConfig = {
  theme: 'dark',
  downloadPath: path.join(os.homedir(), 'Downloads'),
  ipatoolPath: 'ipatool',
  outputFormat: 'text'
};

// 读取配置
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
  return defaultConfig;
}

// 保存配置
function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1a1a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  // 开发模式下打开开发者工具
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 执行 ipatool 命令的辅助函数
function executeIpatool(args, callback) {
  const config = loadConfig();
  const command = `${config.ipatoolPath} ${args}`;

  exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
    // 即使有错误,也返回 stdout,因为 ipatool 会在 stdout 中返回 JSON 错误信息
    if (error) {
      // 如果有 stdout 输出,尝试解析它(可能是 JSON 格式的错误)
      if (stdout && stdout.trim()) {
        callback({ success: false, output: stdout, stderr, error: error.message });
      } else {
        callback({ success: false, error: error.message, stderr });
      }
      return;
    }
    callback({ success: true, output: stdout, stderr });
  });
}

// IPC 处理器

// 检查 ipatool 是否已安装
ipcMain.handle('check-ipatool', async () => {
  return new Promise((resolve) => {
    exec('which ipatool', (error, stdout) => {
      if (error) {
        resolve({ installed: false, path: null });
      } else {
        resolve({ installed: true, path: stdout.trim() });
      }
    });
  });
});

// 认证 - 登录
ipcMain.handle('auth-login', async (event, { email, password, authCode }) => {
  return new Promise((resolve) => {
    let args = `auth login -e "${email}" -p "${password}" --non-interactive --format json`;
    if (authCode) {
      args += ` --auth-code "${authCode}"`;
    }
    executeIpatool(args, (result) => {
      resolve(result);
    });
  });
});

// 认证 - 获取账户信息
ipcMain.handle('auth-info', async () => {
  return new Promise((resolve) => {
    executeIpatool('auth info --format json', (result) => {
      resolve(result);
    });
  });
});

// 认证 - 登出
ipcMain.handle('auth-revoke', async () => {
  return new Promise((resolve) => {
    executeIpatool('auth revoke', (result) => {
      resolve(result);
    });
  });
});

// 搜索应用
ipcMain.handle('search-apps', async (event, { term, limit }) => {
  return new Promise((resolve) => {
    const args = `search "${term}" --limit ${limit} --non-interactive --format json`;
    executeIpatool(args, (result) => {
      resolve(result);
    });
  });
});

// 获取应用版本列表
ipcMain.handle('list-versions', async (event, { bundleId, appId }) => {
  return new Promise((resolve) => {
    let args = 'list-versions --non-interactive --format json';
    if (bundleId) {
      args += ` -b "${bundleId}"`;
    } else if (appId) {
      args += ` -i ${appId}`;
    }
    executeIpatool(args, (result) => {
      resolve(result);
    });
  });
});

// 下载应用
ipcMain.handle('download-app', async (event, { bundleId, appId, outputPath, purchase, versionId }) => {
  return new Promise((resolve) => {
    let args = 'download --non-interactive --format json';

    if (bundleId) {
      args += ` -b "${bundleId}"`;
    } else if (appId) {
      args += ` -i ${appId}`;
    }

    if (outputPath) {
      args += ` -o "${outputPath}"`;
    }

    if (purchase) {
      args += ' --purchase';
    }

    if (versionId) {
      args += ` --external-version-id "${versionId}"`;
    }

    executeIpatool(args, (result) => {
      resolve(result);
    });
  });
});

// 购买应用许可
ipcMain.handle('purchase-app', async (event, { bundleId }) => {
  return new Promise((resolve) => {
    const args = `purchase -b "${bundleId}" --non-interactive --format json`;
    executeIpatool(args, (result) => {
      resolve(result);
    });
  });
});

// 配置管理
ipcMain.handle('get-config', async () => {
  return loadConfig();
});

ipcMain.handle('save-config', async (event, config) => {
  return saveConfig(config);
});

// 选择文件夹
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// 打开文件夹
ipcMain.handle('open-folder', async (event, folderPath) => {
  shell.openPath(folderPath);
});

// 打开外部链接
ipcMain.handle('open-external', async (event, url) => {
  shell.openExternal(url);
});
