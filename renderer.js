// ==================== 全局状态 ====================
let currentView = 'auth';
let config = {};
let searchResults = [];

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', async () => {
    // 加载配置
    config = await window.electronAPI.getConfig();
    applyConfig();

    // 检查 ipatool
    checkIpatoolStatus();

    // 设置事件监听器
    setupEventListeners();

    // 检查认证状态
    checkAuthStatus();
});

// ==================== 配置管理 ====================
function applyConfig() {
    // 应用主题
    document.documentElement.setAttribute('data-theme', config.theme || 'dark');
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = config.theme || 'dark';
    }

    // 应用下载路径
    const downloadPath = document.getElementById('downloadPath');
    const defaultDownloadPath = document.getElementById('defaultDownloadPath');
    if (downloadPath) {
        downloadPath.value = config.downloadPath || '';
    }
    if (defaultDownloadPath) {
        defaultDownloadPath.value = config.downloadPath || '';
    }

    // 应用 ipatool 路径
    const ipatoolPath = document.getElementById('ipatoolPath');
    if (ipatoolPath) {
        ipatoolPath.value = config.ipatoolPath || 'ipatool';
    }
}

async function saveSettings() {
    const themeSelect = document.getElementById('themeSelect');
    const defaultDownloadPath = document.getElementById('defaultDownloadPath');
    const ipatoolPath = document.getElementById('ipatoolPath');

    config.theme = themeSelect.value;
    config.downloadPath = defaultDownloadPath.value;
    config.ipatoolPath = ipatoolPath.value || 'ipatool';

    const success = await window.electronAPI.saveConfig(config);

    if (success) {
        applyConfig();
        showToast('设置已保存', 'success');
    } else {
        showToast('保存设置失败', 'error');
    }
}

// ==================== ipatool 状态检查 ====================
async function checkIpatoolStatus() {
    const statusDot = document.getElementById('ipatoolStatus');
    const statusText = document.getElementById('ipatoolStatusText');

    const result = await window.electronAPI.checkIpatool();

    if (result.installed) {
        statusDot.classList.add('online');
        statusText.textContent = 'ipatool 已就绪';
    } else {
        statusDot.classList.add('offline');
        statusText.textContent = 'ipatool 未安装';
        showToast('请先安装 ipatool: brew install ipatool', 'warning');
    }
}

// ==================== 事件监听器 ====================
function setupEventListeners() {
    // 导航
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            switchView(view);
        });
    });

    // 认证
    document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

    // 搜索
    document.getElementById('searchBtn')?.addEventListener('click', handleSearch);
    document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // 下载
    document.getElementById('downloadBtn')?.addEventListener('click', handleDownload);
    document.getElementById('selectPathBtn')?.addEventListener('click', selectDownloadPath);
    document.getElementById('loadVersionsBtn')?.addEventListener('click', loadVersions);

    // 设置
    document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
    document.getElementById('selectDefaultPathBtn')?.addEventListener('click', selectDefaultPath);
    document.getElementById('ipatoolLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.electronAPI.openExternal('https://github.com/majd/ipatool');
    });
}

// ==================== 视图切换 ====================
function switchView(viewName) {
    // 更新导航
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`)?.classList.add('active');

    // 更新视图
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}View`)?.classList.add('active');

    currentView = viewName;
}

// ==================== 认证功能 ====================
async function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const authCode = document.getElementById('authCode').value.trim();
    const loginBtn = document.getElementById('loginBtn');
    const authCodeGroup = document.getElementById('authCodeGroup');

    if (!email || !password) {
        showToast('请输入 Apple ID 和密码', 'warning');
        return;
    }

    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span>登录中...</span>';

    try {
        const result = await window.electronAPI.authLogin({ email, password, authCode: authCode || undefined });

        // 尝试解析输出
        let loginSuccess = false;
        let needsAuthCode = false;
        let errorMsg = '';

        if (result.output) {
            try {
                const data = JSON.parse(result.output);

                // 检查是否需要验证码 (检查 error 和 message 字段)
                const msg = (data.error || data.message || '').toLowerCase();
                if (msg.includes('auth-code') || msg.includes('2fa code')) {
                    needsAuthCode = true;
                    loginSuccess = false; // 需要验证码，所以还未完全登录成功
                } else if (data.success !== false && !data.error) {
                    // 检查是否登录成功(没有错误,或者 success 不是 false)
                    loginSuccess = true;
                } else {
                    errorMsg = data.error || '登录失败';
                }
            } catch (e) {
                console.error('解析登录结果失败:', e);
                errorMsg = result.error || result.stderr || '登录失败';
            }
        } else {
            errorMsg = result.error || result.stderr || '登录失败';
        }

        // 处理需要验证码的情况
        if (needsAuthCode) {
            authCodeGroup.classList.remove('hidden');
            showToast('请输入双因素认证码', 'info');
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span>登录</span>';
            document.getElementById('authCode').focus();
            return;
        }

        // 处理登录成功
        if (loginSuccess) {
            showToast('登录成功', 'success');
            authCodeGroup.classList.add('hidden');
            document.getElementById('authCode').value = '';
            await checkAuthStatus();
            document.getElementById('password').value = '';
        } else {
            // 登录失败
            console.error('登录失败:', errorMsg);
            showToast(`登录失败: ${errorMsg}`, 'error');

            // 如果是验证码错误,清空验证码输入框
            if (authCode) {
                document.getElementById('authCode').value = '';
                document.getElementById('authCode').focus();
            }
        }
    } catch (error) {
        console.error('登录错误:', error);
        showToast(`登录错误: ${error.message}`, 'error');
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span>登录</span>';
    }
}

async function handleLogout() {
    if (!confirm('确定要退出登录吗?')) return;

    try {
        await window.electronAPI.authRevoke();
        showToast('已登出', 'success');
        await checkAuthStatus();
    } catch (error) {
        showToast(`登出失败: ${error.message}`, 'error');
    }
}

async function checkAuthStatus() {
    try {
        const result = await window.electronAPI.authInfo();

        // 尝试解析输出
        if (result.output) {
            try {
                const info = JSON.parse(result.output);

                // 检查 ipatool 返回的 JSON 中的 success 字段
                if (info.success !== false && info.email) {
                    // 已登录
                    document.getElementById('accountEmail').textContent = info.email || '未知';
                    document.getElementById('accountName').textContent = info.firstName && info.lastName
                        ? `${info.firstName} ${info.lastName}`
                        : '用户';

                    document.getElementById('loginForm').classList.add('hidden');
                    document.getElementById('authInfo').classList.remove('hidden');
                } else {
                    // 未登录(ipatool 返回 success: false)
                    document.getElementById('loginForm').classList.remove('hidden');
                    document.getElementById('authInfo').classList.add('hidden');
                }
            } catch (e) {
                // JSON 解析失败,视为未登录
                console.error('解析认证信息失败:', e);
                document.getElementById('loginForm').classList.remove('hidden');
                document.getElementById('authInfo').classList.add('hidden');
            }
        } else {
            // 没有输出,视为未登录
            document.getElementById('loginForm').classList.remove('hidden');
            document.getElementById('authInfo').classList.add('hidden');
        }
    } catch (error) {
        console.error('检查认证状态失败:', error);
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('authInfo').classList.add('hidden');
    }
}

// ==================== 搜索功能 ====================
async function handleSearch() {
    const term = document.getElementById('searchInput').value.trim();
    const limit = parseInt(document.getElementById('searchLimit').value) || 10;
    const searchBtn = document.getElementById('searchBtn');
    const resultsContainer = document.getElementById('searchResults');

    if (!term) {
        showToast('请输入搜索关键词', 'warning');
        return;
    }

    searchBtn.disabled = true;
    searchBtn.innerHTML = '<span>搜索中...</span>';
    resultsContainer.innerHTML = '<div class="empty-state"><p>搜索中...</p></div>';

    try {
        const result = await window.electronAPI.searchApps({ term, limit });

        if (result.success && result.output) {
            try {
                const data = JSON.parse(result.output);

                // ipatool search 返回的是 { apps: [...] } 或 { results: [...] } 或直接是数组
                // 根据实际输出调整
                searchResults = data.apps || data.results || (Array.isArray(data) ? data : []);

                displaySearchResults(searchResults);
            } catch (e) {
                console.error('解析搜索结果失败:', e);
                showToast('解析搜索结果失败', 'error');
                resultsContainer.innerHTML = '<div class="empty-state"><p>解析结果失败</p></div>';
            }
        } else {
            console.error('搜索失败:', result.error || result.stderr);
            showToast(`搜索失败: ${result.error || result.stderr}`, 'error');
            resultsContainer.innerHTML = '<div class="empty-state"><p>搜索失败</p></div>';
        }
    } catch (error) {
        console.error('搜索错误:', error);
        showToast(`搜索错误: ${error.message}`, 'error');
        resultsContainer.innerHTML = '<div class="empty-state"><p>搜索错误</p></div>';
    } finally {
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<span>搜索</span>';
    }
}

function displaySearchResults(results) {
    const container = document.getElementById('searchResults');

    if (!results || results.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>未找到结果</p></div>';
        return;
    }

    container.innerHTML = results.map(app => {
        // 处理字段名变体
        const bundleId = app.bundleIdentifier || app.bundleID || app.bundleId || '';
        const appId = app.identifier || app.id || '';
        const name = app.name || '未知应用';
        const developer = app.artistName || app.developer || '未知开发者';
        const icon = app.artworkURL512 || app.icon || app.artworkURL100 || '';
        const version = app.version || '';
        const price = app.price === 0 ? '免费' : (app.price ? `¥${app.price}` : '');

        return `
    <div class="app-item" data-bundle-id="${bundleId}" data-app-id="${appId}">
      <div class="app-icon">
        ${icon ? `<img src="${icon}" alt="${name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiMzMzMiLz48L3N2Zz4='">` : '<div style="width:100%;height:100%;background:#333"></div>'}
      </div>
      <div class="app-info">
        <div class="app-name">${name} <span style="font-size:0.8em;opacity:0.7">${version}</span></div>
        <div class="app-developer">${developer} ${price ? `• ${price}` : ''}</div>
        <div class="app-bundle-id">${bundleId}</div>
      </div>
      <div class="app-actions">
        <button class="btn btn-primary btn-sm download-app-btn">下载</button>
      </div>
    </div>
  `}).join('');

    // 添加下载按钮事件
    container.querySelectorAll('.download-app-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const appItem = e.target.closest('.app-item');
            const bundleId = appItem.getAttribute('data-bundle-id');
            fillDownloadForm(bundleId);
            switchView('download');
        });
    });
}

function fillDownloadForm(bundleId) {
    document.getElementById('bundleId').value = bundleId;
    // 清空版本选择
    document.getElementById('versionSelect').innerHTML = '<option value="">最新版本</option>';
    document.getElementById('versionSelect').disabled = true;
    // 自动加载版本
    loadVersions();
}

// ==================== 下载功能 ====================
async function handleDownload() {
    const bundleId = document.getElementById('bundleId').value.trim();
    const outputPath = document.getElementById('downloadPath').value.trim();
    const purchase = document.getElementById('autoPurchase').checked;
    const versionSelect = document.getElementById('versionSelect');
    const versionId = versionSelect.value;
    const downloadBtn = document.getElementById('downloadBtn');

    if (!bundleId) {
        showToast('请输入 Bundle ID', 'warning');
        return;
    }

    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<span>准备下载...</span>';

    // 显示进度
    const progressContainer = document.getElementById('downloadProgress');
    const progressStatus = document.getElementById('downloadStatus');
    progressContainer.classList.remove('hidden');
    progressStatus.textContent = '正在连接 App Store...';

    try {
        const params = {
            bundleId,
            outputPath: outputPath || undefined,
            purchase,
            versionId: versionId || undefined
        };

        const result = await window.electronAPI.downloadApp(params);

        if (result.success) {
            progressStatus.textContent = '下载完成!';
            showToast('下载成功', 'success');

            // 提供打开文件夹选项
            if (outputPath) {
                const folderPath = outputPath.substring(0, outputPath.lastIndexOf('/'));
                setTimeout(() => {
                    if (confirm('下载完成!是否打开文件夹?')) {
                        window.electronAPI.openFolder(folderPath);
                    }
                }, 500);
            }
        } else {
            progressStatus.textContent = '下载失败';
            showToast(`下载失败: ${result.error || result.stderr}`, 'error');
        }
    } catch (error) {
        progressStatus.textContent = '下载错误';
        showToast(`下载错误: ${error.message}`, 'error');
    } finally {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2c-.55 0-1 .45-1 1v8.59l-2.29-2.3c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4 4c.39.39 1.02.39 1.41 0l4-4c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L11 11.59V3c0-.55-.45-1-1-1zM4 15c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1H4z"/>
      </svg>
      <span>开始下载</span>
    `;

        setTimeout(() => {
            progressContainer.classList.add('hidden');
        }, 3000);
    }
}

async function selectDownloadPath() {
    const folder = await window.electronAPI.selectFolder();
    if (folder) {
        const bundleId = document.getElementById('bundleId').value.trim() || 'app';
        const fileName = `${bundleId}.ipa`;
        document.getElementById('downloadPath').value = `${folder}/${fileName}`;
    }
}

async function selectDefaultPath() {
    const folder = await window.electronAPI.selectFolder();
    if (folder) {
        document.getElementById('defaultDownloadPath').value = folder;
    }
}

async function loadVersions() {
    const bundleId = document.getElementById('bundleId').value.trim();
    const loadBtn = document.getElementById('loadVersionsBtn');
    const versionSelect = document.getElementById('versionSelect');

    if (!bundleId) {
        showToast('请先输入 Bundle ID', 'warning');
        return;
    }

    loadBtn.disabled = true;
    loadBtn.textContent = '加载中...';

    try {
        const result = await window.electronAPI.listVersions({ bundleId });

        if (result.success && result.output) {
            try {
                const data = JSON.parse(result.output);

                // ipatool list-versions 可能返回 { items: [...] } 或 { versions: [...] } 或 { externalVersionIdentifiers: [...] }
                let versions = [];
                if (data.externalVersionIdentifiers && Array.isArray(data.externalVersionIdentifiers)) {
                    // 处理纯 ID 数组的情况
                    versions = data.externalVersionIdentifiers.map(id => ({
                        id: id,
                        version: '未知版本号' // API 只返回了 ID
                    }));
                } else {
                    versions = data.items || data.versions || (Array.isArray(data) ? data : []);
                }

                if (versions.length === 0) {
                    showToast('未找到版本信息', 'warning');
                    return;
                }

                versionSelect.innerHTML = '<option value="">最新版本</option>';
                // 倒序显示,通常 ID 越大版本越新
                versions.reverse().forEach(version => {
                    // 处理字段名变体
                    const verId = version.externalVersionIdentifier || version.id || version.versionId;
                    const verNum = version.version || version.bundleVersion || '未知';

                    if (verId) {
                        const option = document.createElement('option');
                        option.value = verId;
                        // 如果只有 ID,就只显示 ID
                        option.textContent = verNum === '未知版本号' ? `版本 ID: ${verId}` : `${verNum} (${verId})`;
                        versionSelect.appendChild(option);
                    }
                });

                versionSelect.disabled = false;
                showToast(`加载了 ${versions.length} 个版本`, 'success');
            } catch (e) {
                console.error('解析版本列表失败:', e);
                showToast('解析版本列表失败', 'error');
            }
        } else {
            console.error('加载版本失败:', result.error || result.stderr);
            showToast(`加载版本失败: ${result.error || result.stderr}`, 'error');
        }
    } catch (error) {
        console.error('加载版本错误:', error);
        showToast(`加载版本错误: ${error.message}`, 'error');
    } finally {
        loadBtn.disabled = false;
        loadBtn.textContent = '加载版本列表';
    }
}

// ==================== Toast 通知 ====================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm-1 12l-3-3 1.41-1.41L9 11.17l4.59-4.58L15 8l-6 6z"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H9v-2h2v2zm0-4H9V5h2v6z"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M2 17h16l-8-14-8 14zm9-3H9v-2h2v2zm0-3H9V8h2v3z"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H9V9h2v6zm0-8H9V5h2v2z"/></svg>'
    };

    toast.innerHTML = `
    ${icons[type] || icons.info}
    <span>${message}</span>
  `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.25s reverse';
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}
