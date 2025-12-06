# 启动文档索引 / Startup Documentation Index

## 📚 文档概览 / Documentation Overview

本项目的启动文档分为多个层次，从快速参考到详细指南，满足不同用户的需求：

This project's startup documentation is organized in multiple levels, from quick reference to detailed guides, meeting different user needs:

### 🎯 根据你的需求选择文档 / Choose Documentation Based on Your Needs

#### 1. 🚀 我想快速启动，需要完整的平台说明

👉 **[完整启动指南](START_GUIDE.md)** - 最全面的启动指南

**包含内容 / Includes:**
- ✅ 自动化环境检查脚本
- ✅ Windows/Linux/macOS 平台特定说明
- ✅ 端口占用检查
- ✅ 详细的故障排查
- ✅ 健康检查命令
- ✅ 完整的命令参考表

**适合:** 首次使用的用户，或需要详细平台说明的用户

---

#### 2. ⚡ 我想快速开始，只需要基本命令

👉 **[快速启动指南](../QUICKSTART.md)** - 快速参考指南

**包含内容 / Includes:**
- ✅ 三步快速启动
- ✅ 常用命令速查
- ✅ 服务验证方法
- ✅ 链接到详细文档

**适合:** 有经验的用户，或需要快速参考的用户

---

#### 3. 🐳 我需要详细的容器化部署说明

👉 **[容器化部署指南](CONTAINER_DEPLOYMENT.md)** - 详细的容器化部署文档

**包含内容 / Includes:**
- ✅ 完整的 Docker 配置说明
- ✅ 数据持久化配置
- ✅ 环境变量配置
- ✅ 生产环境建议

**适合:** 需要部署到生产环境的用户

---

#### 4. 🏠 我想使用本地 Ollama 服务

👉 **[本地 Ollama 配置指南](LOCAL_OLLAMA_SETUP.md)** - 使用本地 Ollama 的详细说明

**包含内容 / Includes:**
- ✅ 本地 Ollama 配置步骤
- ✅ 平台特定的网络配置
- ✅ 连接验证方法
- ✅ 常见问题排查

**适合:** 想使用本地已安装的 Ollama 服务的用户

---

## 📖 文档结构 / Documentation Structure

```
docs/
├── START_GUIDE.md              # 完整启动指南（推荐首次阅读）
├── CONTAINER_DEPLOYMENT.md     # 容器化部署详细文档
├── LOCAL_OLLAMA_SETUP.md       # 本地 Ollama 配置指南
└── README_STARTUP.md           # 本文档（启动文档索引）

QUICKSTART.md                   # 快速启动参考（项目根目录）
GETTING_STARTED.md              # 快速开始指南（项目根目录）
```

---

## 🎯 推荐阅读顺序 / Recommended Reading Order

### 首次使用 / First Time Users

1. **第一步**: 阅读 [完整启动指南](START_GUIDE.md) 的"系统要求检查"部分
2. **第二步**: 运行环境检查脚本验证你的环境
3. **第三步**: 根据你的平台（Windows/Linux/macOS）选择对应的启动方式
4. **第四步**: 遇到问题时查看故障排查部分

### 有经验的用户 / Experienced Users

1. 直接查看 [快速启动指南](../QUICKSTART.md)
2. 需要详细配置时参考 [容器化部署指南](CONTAINER_DEPLOYMENT.md)
3. 使用本地 Ollama 时参考 [本地 Ollama 配置指南](LOCAL_OLLAMA_SETUP.md)

---

## 🔍 快速查找 / Quick Search

### 我想...

- **检查环境是否满足要求** → [完整启动指南 - 系统要求检查](START_GUIDE.md#1-系统要求检查--system-requirements-check)
- **在 Windows 上启动** → [完整启动指南 - Windows 部分](START_GUIDE.md#-windows)
- **在 Linux 上启动** → [完整启动指南 - Linux 部分](START_GUIDE.md#-linux)
- **在 macOS 上启动** → [完整启动指南 - macOS 部分](START_GUIDE.md#-macos)
- **使用本地 Ollama** → [本地 Ollama 配置指南](LOCAL_OLLAMA_SETUP.md)
- **配置生产环境** → [容器化部署指南](CONTAINER_DEPLOYMENT.md)
- **排查启动问题** → [完整启动指南 - 故障排查](START_GUIDE.md#6-常见问题排查--troubleshooting)
- **查看所有可用命令** → [快速启动指南 - 常用命令](../QUICKSTART.md#-常用命令--common-commands)

---

## 🛠️ 环境检查工具 / Environment Check Tools

### 自动化检查脚本

- **Windows**: `scripts/check-env.ps1`
- **Linux/macOS**: `scripts/check-env.sh`

这些脚本会自动检查：
- Docker 安装和版本
- Docker Compose 安装和版本
- Docker 守护进程状态
- 端口占用情况
- 本地 Ollama（可选）
- Make（可选）

运行脚本后，会显示详细的检查结果和建议。

---

## 📞 获取帮助 / Getting Help

如果文档无法解决你的问题：

1. 运行环境检查脚本，查看是否有错误提示
2. 查看服务日志: `make logs` 或 `.\scripts\docker-run.ps1 logs`
3. 检查服务状态: `make status` 或 `.\scripts\docker-run.ps1 status`
4. 查看详细文档中的故障排查部分

---

## ✨ 文档更新 / Documentation Updates

所有文档都会持续更新以反映最新的配置和最佳实践。如果你发现文档有误或需要改进，欢迎提交 Issue 或 Pull Request。

All documentation is continuously updated to reflect the latest configurations and best practices. If you find any errors or improvements needed, please submit an Issue or Pull Request.

---

祝使用愉快！Happy coding! 🚀

