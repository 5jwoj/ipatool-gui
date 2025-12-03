# IPATool GUI

<div align="center">
  
![Platform: macOS](https://img.shields.io/badge/Platform-macOS-blue)
![Electron 28](https://img.shields.io/badge/Electron-28.0.0-47848F)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

一个基于 [ipatool](https://github.com/majd/ipatool) 的 macOS 图形界面工具，用于搜索和下载 iOS 应用包（IPA）。
</div>

<!-- TOC -->
## 目录
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [前置要求](#前置要求)
- [快速开始（开发）](#快速开始开发)
- [构建和发布](#构建和发布)
- [使用指南](#使用指南)
  - [认证（登录）](#认证登录)
  - [搜索应用](#搜索应用)
  - [下载应用](#下载应用)
  - [设置](#设置)
- [项目结构](#项目结构)
- [配置文件位置](#配置文件位置)
- [常见问题](#常见问题)
- [许可证](#许可证)
- [致谢](#致谢)
<!-- /TOC -->

## 功能特性
- 图形化界面：摆脱命令行，操作直观。
- 账户管理：支持 Apple ID 登录（含双因素认证 2FA）、登出与查看账户信息。
- 应用搜索：查看图标、名称、版本等信息。
- 版本选择：可查看并下载历史版本。
- 自动获取许可：首次下载可自动尝试获取许可。
- 主题：内置深色/浅色主题切换。
- 自定义 ipatool 路径与默认下载位置配置。

## 技术栈
- Electron（桌面应用框架）
- HTML / CSS / JavaScript（渲染层）
- ipatool（核心下载工具）

## 前置要求
- macOS（本项目目标平台）
- Node.js v16 或更高（建议）
- ipatool（命令行工具）

安装示例（Homebrew）：
```bash
# 安装 Node.js（若尚未安装）
brew install node

# 安装 ipatool
brew tap majd/repo
brew install ipatool
```

也可以从 ipatool Releases 页面下载二进制： https://github.com/majd/ipatool/releases

## 快速开始（开发）
1. 克隆仓库并进入目录：
```bash
git clone https://github.com/5jwoj/ipatool-gui.git
cd ipatool-gui
```

2. 安装依赖：
```bash
npm install
```

3. 启动应用（开发模式）：
```bash
npm start
```

## 构建和发布
构建 macOS 安装包（示例脚本）：
```bash
# 构建 .app 与安装包到 dist 目录
npm run dist

# 或者按项目脚本区分构建：
npm run build       # 通常生成 .app/.dmg/.zip 等
npm run build:dmg
npm run build:zip
```
构建输出位于 `dist/` 目录（具体位置取决于项目配置）。

## 使用指南

### 认证（登录）
1. 打开应用，选择 “认证” 标签页。  
2. 输入 Apple ID 与密码，点击登录。  
3. 若启用双因素认证（2FA），会提示输入六位验证码。  
4. 成功登录后会显示账户信息。  
注意：凭据仅用于与 Apple 服务器通信，建议使用系统钥匙串或本地安全存储，不会发送给第三方。

常用命令行（仅用于疑难排查）：
```bash
# 若需要在命令行先行登录（ipatool）
ipatool auth login
```

### 搜索应用
1. 进入 “搜索” 标签页，输入应用名称（支持中文/英文）。  
2. 可调整返回结果数量（如果有该选项）。  
3. 点击搜索后在结果列表查看图标、名称、Bundle ID 等。  
4. 点击结果中的 “下载” 可跳转或填充到下载页。

### 下载应用
1. 进入 “下载” 标签页；Bundle ID 会在从搜索页跳转时自动填充。  
2. 点击 “加载版本列表” 查看历史版本并选择。  
3. 可勾选 “自动获取许可”（首次下载建议开启）。  
4. 点击 “开始下载”，选择保存位置后开始下载 IPA。

注意事项：
- 若提示没有许可，建议先在真实设备上下载一次该应用或使用已购买账号。
- 对于付费应用，需拥有相应购买记录/许可。

### 设置
在 “设置” 中可以：
- 切换深色/浅色主题
- 配置默认下载路径
- 指定自定义 ipatool 可执行文件路径（例如 /opt/homebrew/bin/ipatool）

## 项目结构
示例（简化）：
```
ipatool-gui/
├── main.js
├── preload.js
├── index.html
├── styles.css
├── renderer.js
├── package.json
└── README.md
```

## 配置文件位置
应用配置保存在：
```
~/Library/Application Support/ipatool-gui/config.json
```
包含项示例：
- theme: "dark" | "light"
- downloadPath: "/Users/<you>/Downloads"
- ipatoolPath: "/opt/homebrew/bin/ipatool"

## 常见问题
Q: 登录失败，提示 "something went wrong"？  
A: 通常是验证码错误或已过期，重新获取并输入最新验证码。也请确认网络连接和 Apple ID 凭据正确。

Q: 搜索不到应用？  
A: 尝试英文名称或更完整的关键词，或检查网络与区域限制。

Q: 下载时提示没有许可？  
A: 勾选 “自动获取许可”，或在设备上预先下载以获得所有权。付费应用需要购买记录。

Q: ipatool 未找到？  
A: 在终端运行 `which ipatool` 检查路径；或在设置中指定 ipatool 的完整路径（例如 /opt/homebrew/bin/ipatool）。

## 贡献
欢迎 issue 与 PR。请在提交前确保：
- 描述复现步骤
- 提供日志或错误输出（若有）
- 简要说明期望行为

## 许可证
MIT License

## 致谢
- [ipatool](https://github.com/majd/ipatool) — 核心命令行工具  
- [Electron](https://www.electronjs.org/) — 桌面应用框架

---

Made with ❤️ for iOS developers
