# IPATool GUI

<div align="center">
  
![IPATool GUI](https://img.shields.io/badge/Platform-macOS-blue)
![Electron](https://img.shields.io/badge/Electron-28.0.0-47848F)
![License](https://img.shields.io/badge/License-MIT-green)

一个基于 [ipatool](https://github.com/majd/ipatool) 的 macOS 图形界面工具，用于搜索和下载 iOS 应用包 (IPA)。

## ✨ 功能特性

*   **图形化界面**: 告别复杂的命令行，操作更直观。
*   **账户管理**: 支持 Apple ID 登录（含双因素认证 2FA）、登出和查看账户信息。
*   **应用搜索**: 快速搜索 App Store 应用，查看图标、名称和版本。
*   **版本选择**: 支持下载应用的特定历史版本。
*   **自动下载**: 一键下载 IPA 文件，支持自动获取许可。
*   **主题切换**: 内置深色和浅色模式，随心切换。

## 🛠️ 安装与运行

### 前置要求

1.  **Node.js**: 需要安装 Node.js (推荐 v16+)。
    ```bash
    brew install node
    ```
2.  **ipatool**: 需要安装命令行工具 `ipatool`。
    ```bash
    brew tap majd/repo
    brew install ipatool
    ```

### 开发环境运行

1.  克隆项目到本地：
    ```bash
    git clone https://github.com/your-username/ipatool-gui.git
    cd ipatool-gui
    ```

2  安装依赖：
    ```bash
    npm install
    ```

3.  启动应用：
    ```bash
    npm start
    ```

### 📦 构建发布版本

你可以将应用打包为 macOS 原生应用 (`.dmg` 或 `.app`)。

1.  执行构建命令：
    ```bash
    npm run dist
    ```

2.  构建完成后，安装包位于 `dist` 目录下。

## 📖 使用指南

### 1. 登录
*   打开应用，进入"认证"标签页。
*   输入 Apple ID 和密码。
*   如果开启了双因素认证，点击登录后会提示输入 6 位验证码。
*   登录成功后会显示账户信息。
*   *注意：凭据仅用于与 Apple 服务器通信，保存在系统钥匙串中，不会发送给第三方。*

### 2. 搜索应用
*   进入"搜索"标签页。
*   输入应用名称（如 "WeChat" 或 "微信"）。
*   点击搜索，结果列表中会显示应用图标和详细信息。
*   点击"下载"按钮可直接跳转到下载页面。

### 3. 下载应用
*   进入"下载"标签页。
*   输入 Bundle ID（如果从搜索页跳转则自动填充）。
*   点击"加载版本列表"可查看和选择历史版本。
*   勾选"自动获取许可"（如果是首次下载该应用）。
*   点击"开始下载"，选择保存位置。

### 4. 设置
*   进入"设置"标签页。
*   可以切换深色/浅色主题。
*   配置默认下载路径。
*   指定 `ipatool` 的自定义路径（如果未安装在默认位置）。

## ❓ 常见问题

**Q: 登录失败，提示 "something went wrong"?**
A: 通常是因为验证码错误或过期。请重新点击登录，获取新的验证码并输入。

**Q: 搜索不到应用?**
A: 尝试使用英文名称搜索，或者检查网络连接。

**Q: 下载时提示没有许可?**
A: 请勾选"自动获取许可"选项，或者先在手机上下载一次该应用以获取所有权。

**Q: 无法加载版本列表?**
A: 确保 Bundle ID 正确。部分应用可能隐藏了历史版本信息。

## 📄 许可证

MIT License

## 📋 前置要求

### 1. 安装 ipatool

使用 Homebrew 安装:

```bash
brew install ipatool
```

或从 [GitHub Releases](https://github.com/majd/ipatool/releases) 下载。

### 2. 安装 Node.js

需要 Node.js 16 或更高版本:

```bash
brew install node
```

## 🚀 快速开始

### 开发模式

1. **克隆或下载项目**

```bash
cd ipatool-gui
```

2. **安装依赖**

```bash
npm install
```

3. **启动应用**

```bash
npm start
```

### 构建应用

构建 macOS 应用:

```bash
# 构建 .app 和 .dmg
npm run build

# 仅构建 .dmg
npm run build:dmg

# 仅构建 .zip
npm run build:zip
```

构建后的应用位于 `dist` 目录。

## 📖 使用说明

### 1. 认证

首次使用需要登录 Apple ID:

1. 点击左侧 **认证** 菜单
2. 输入 Apple ID 和密码
3. 点击 **登录**

> ⚠️ 您的凭据仅用于与 Apple 服务器通信,不会被存储或发送到其他地方。

### 2. 搜索应用

1. 点击左侧 **搜索** 菜单
2. 输入应用名称
3. 调整结果数量(可选)
4. 点击 **搜索**
5. 点击搜索结果中的 **下载** 按钮

### 3. 下载应用

1. 点击左侧 **下载** 菜单
2. 输入 Bundle ID(或从搜索结果自动填充)
3. 选择保存位置
4. 可选:勾选 **自动获取许可**
5. 可选:加载并选择特定版本
6. 点击 **开始下载**

### 4. 设置

在 **设置** 菜单中可以配置:

- 主题(深色/浅色)
- 默认下载路径
- ipatool 路径

## 🎨 界面预览

应用采用现代 macOS 设计风格:

- 玻璃态效果
- 流畅的动画过渡
- 深色/浅色主题切换
- 响应式布局

## 🛠️ 技术栈

- **Electron** - 跨平台桌面应用框架
- **HTML/CSS/JavaScript** - 原生 Web 技术
- **ipatool** - iOS 应用下载工具

## 📁 项目结构

```
ipatool-gui/
├── main.js           # Electron 主进程
├── preload.js        # 预加载脚本
├── index.html        # 主界面
├── styles.css        # 样式文件
├── renderer.js       # 渲染进程逻辑
├── package.json      # 项目配置
└── README.md         # 项目文档
```

## ⚙️ 配置文件

配置文件存储在:

```
~/Library/Application Support/ipatool-gui/config.json
```

包含:
- 主题偏好
- 下载路径
- ipatool 路径

## 🐛 故障排除

### ipatool 未找到

确保 ipatool 已安装并在 PATH 中:

```bash
which ipatool
```

如果未找到,在设置中指定完整路径,例如:

```
/opt/homebrew/bin/ipatool
```

### 登录失败

- 确保 Apple ID 和密码正确
- 如果启用了双因素认证,可能需要在命令行中首次登录:

```bash
ipatool auth login
```

### 下载失败

- 确保已登录 Apple ID
- 确保应用在您的地区可用
- 对于付费应用,需要先购买许可

## 📝 许可证

MIT License

## 🙏 致谢

- [ipatool](https://github.com/majd/ipatool) - 核心命令行工具
- [Electron](https://www.electronjs.org/) - 应用框架

## 🔗 相关链接

- [ipatool GitHub](https://github.com/majd/ipatool)
- [ipatool FAQ](https://github.com/majd/ipatool/wiki/FAQ)
- [Electron 文档](https://www.electronjs.org/docs)

---

<div align="center">
Made with ❤️ for iOS developers
</div>
