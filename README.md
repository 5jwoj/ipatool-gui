<div align="center">

# 📱 IPATool GUI

[![Platform](https://img.shields.io/badge/Platform-macOS-blue?style=for-the-badge&logo=apple)](https://www.apple.com/macos/)
[![Electron](https://img.shields.io/badge/Electron-28.0.0-47848F?style=for-the-badge&logo=electron)](https://www.electronjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**一个基于 [ipatool](https://github.com/majd/ipatool) 的现代化 macOS 图形界面工具**
<br>
*让搜索和下载 iOS 应用包 (IPA) 变得简单直观*

[功能特性](#-功能特性) • [安装指南](#-安装与运行) • [使用说明](#-使用指南) • [常见问题](#-常见问题)

</div>

---

## ✨ 功能特性

| 功能 | 描述 |
| :--- | :--- |
| 🔐 **账户管理** | 支持 Apple ID 登录（含 2FA 双因素认证）、登出及账户信息查看。 |
| 🔍 **应用搜索** | 快速搜索 App Store 应用，预览图标、名称、版本及开发者信息。 |
| ⬇️ **一键下载** | 自动获取许可，一键下载 IPA 文件到指定目录。 |
| 📦 **版本回溯** | 支持查看并下载应用的历史版本（需应用支持）。 |
| 🎨 **现代界面** | 采用 macOS 原生风格设计，支持深色/浅色主题自动/手动切换。 |

## 🛠️ 安装与运行

### 1. 前置要求

在开始之前，请确保您的系统已安装以下环境：

*   **Node.js** (v16+): [下载安装](https://nodejs.org/) 或使用 `brew install node`
*   **ipatool**: 核心命令行工具
    ```bash
    brew tap majd/repo
    brew install ipatool
    ```

### 2. 开发环境运行

如果您是开发者，想要运行源代码：

```bash
# 1. 克隆项目
git clone https://github.com/your-username/ipatool-gui.git
cd ipatool-gui

# 2. 安装依赖
npm install

# 3. 启动应用
npm start
```

### 3. 构建发布版本

打包生成可分发的 macOS 应用 (`.dmg` / `.app`)：

```bash
# 构建所有格式
npm run dist

# 构建完成后，安装包将位于 dist/ 目录下
```

## 📖 使用指南

### 🔐 登录认证
1.  进入 **认证** 标签页。
2.  输入您的 Apple ID 和密码。
3.  **双因素认证**：如果您的账号开启了 2FA，系统会自动提示输入 6 位验证码。
    > 🔒 **安全提示**：您的凭据仅用于与 Apple 服务器直接通信，并安全存储在系统钥匙串中，绝不会发送给任何第三方。

### 🔍 搜索应用
1.  进入 **搜索** 标签页。
2.  输入应用关键词（如 "WeChat" 或 "微信"）。
3.  点击搜索，结果将展示应用图标、名称、版本号等信息。
4.  点击 **下载** 按钮可直接跳转至下载页。

### ⬇️ 下载管理
1.  进入 **下载** 标签页。
2.  **Bundle ID**：会自动填充，也可手动输入。
3.  **版本选择**：点击 "加载版本列表" 可选择下载历史版本。
4.  **自动许可**：首次下载某应用时，建议勾选 "自动获取许可"。
5.  点击 **开始下载**，完成后可直接打开文件所在位置。

### ⚙️ 个性化设置
*   **主题**：切换深色/浅色模式。
*   **路径**：自定义默认下载路径。
*   **ipatool**：如果 `ipatool` 未安装在默认路径，可在此手动指定。

## ❓ 常见问题 (FAQ)

<details>
<summary><strong>Q: 登录失败，提示 "something went wrong"?</strong></summary>
通常是因为验证码错误或过期。请重新点击登录，获取新的验证码并输入。
</details>

<details>
<summary><strong>Q: 搜索不到应用?</strong></summary>
尝试使用应用的英文名称搜索（例如搜 "WeChat" 而不是 "微信"），或者检查您的网络连接是否正常。
</details>

<details>
<summary><strong>Q: 下载时提示没有许可 (License missing)?</strong></summary>
请勾选下载页面的 "自动获取许可" 选项。如果仍然失败，请尝试先在手机上下载一次该应用以获取所有权。
</details>

<details>
<summary><strong>Q: 无法加载版本列表?</strong></summary>
确保 Bundle ID 正确。部分应用可能隐藏了历史版本信息，或者您的账号在当前地区无法访问该应用信息。
</details>

## 📁 项目结构

```
ipatool-gui/
├── main.js           # Electron 主进程 (处理 ipatool 命令)
├── renderer.js       # 渲染进程 (界面交互逻辑)
├── preload.js        # IPC 安全桥接
├── index.html        # 界面布局
├── styles.css        # 样式文件
└── package.json      # 项目配置
```

## 📄 许可证

本项目采用 [MIT License](LICENSE) 授权。

---

<div align="center">
Made with ❤️ for iOS Developers
</div>
