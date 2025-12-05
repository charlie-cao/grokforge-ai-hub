# GrokForge AI Hub 🚀

<div align="center">

**From advice to code—deploy your solo empire!**

一个基于 Bun + React + Shadcn UI 的 AI 驱动业务助手 MVP，集成 Ollama/Qwen3 模型，将业务建议转换为可执行的自动化代码。

An AI-powered business assistant MVP built with Bun + React + Shadcn UI, integrating Ollama/Qwen3 to transform business advice into executable automation code.

[![Bun](https://img.shields.io/badge/Bun-1.3+-000000?style=flat&logo=bun)](https://bun.sh)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)

</div>

---

## 🎉 Day 4 Updates: Export & Leads Generation / Day 4 更新：导出和线索生成

- **One-click .py download (markdown-free)** / **一键下载 .py 文件（无 Markdown）**
  - Automatically strips markdown code fences from exported code
  - 自动去除导出代码中的 Markdown 代码块标记

- **Apollo-integrated LeadsBot for marketing automation** / **集成 Apollo 的 LeadsBot 营销自动化**
  - Specialized system prompt for lead generation queries
  - 针对线索生成查询的专用系统提示
  - Detects "leads" keyword in input to activate LeadsBot mode
  - 检测输入中的 "leads" 关键词以激活 LeadsBot 模式

- **Mock CSV simulation in dashboard** / **仪表板中的模拟 CSV**
  - Visual table display of generated leads (name, email, company)
  - 生成线索的可视化表格显示（姓名、邮箱、公司）
  - Simulates LeadsBot execution with sample data
  - 使用示例数据模拟 LeadsBot 执行

---

## ✨ Features / 功能特性

### 🌟 Core Features / 核心功能

- **🤖 AI-Powered Business Advice** / **AI 驱动的业务建议**
  - Query Qwen3 model via Ollama API for solo business advice
  - 通过 Ollama API 查询 Qwen3 模型获取独立业务建议

- **💻 Code Generation** / **代码生成**
  - Automatically generate Python automation scripts from business advice
  - 从业务建议自动生成 Python 自动化脚本

- **📥 One-Click Export** / **一键导出**
  - Download generated agent code as `bot.py` file
  - 将生成的代理代码下载为 `bot.py` 文件

- **🎨 Modern UI** / **现代化界面**
  - Neon gradient design with smooth animations
  - 霓虹渐变设计，流畅动画效果
  - Dark/Light mode toggle
  - 深色/浅色模式切换
  - Fully responsive design
  - 完全响应式设计

- **⚡ Performance Optimized** / **性能优化**
  - React hooks optimization with `useCallback`
  - 使用 `useCallback` 优化 React hooks
  - Memory leak prevention
  - 防止内存泄漏
  - Efficient state management
  - 高效的状态管理

---

## 🚀 Quick Start / 快速开始

### Prerequisites / 前置要求

- [Bun](https://bun.sh) v1.3+ installed
- Ollama running locally with `qwen3:latest` model

```bash
# Install Ollama and pull qwen3 model
ollama pull qwen3:latest
```

### Installation / 安装

```bash
# Clone the repository
git clone git@github.com:charlie-cao/grokforge-ai-hub.git
cd grokforge-ai-hub

# Install dependencies
bun install
```

### Development / 开发

```bash
# Start development server with hot reload
bun dev
```

The app will be available at `http://localhost:3000` (or the port shown in console).

应用将在 `http://localhost:3000` 可用（或控制台显示的端口）。

### Production / 生产环境

```bash
# Build for production
bun run build

# Start production server
bun start
```

---

## 📁 Project Structure / 项目结构

```
grokforge-ai-hub/
├── src/
│   ├── App.tsx              # Main application component
│   ├── APITester.tsx        # API testing component
│   ├── components/
│   │   └── ui/              # Shadcn UI components
│   ├── lib/
│   │   └── utils.ts         # Utility functions (Qwen3 API)
│   ├── index.ts             # Server entry point
│   ├── frontend.tsx         # React app entry point
│   └── index.css            # Global styles
├── styles/
│   └── globals.css          # Tailwind CSS configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎯 Usage / 使用方法

### 1. Query Business Advice / 查询业务建议

1. Enter your business question in the textarea (e.g., "Fix time trap")
2. Click "Summon Qwen3 Wisdom" button
3. Wait for AI response

在文本框中输入业务问题（例如："Fix time trap"），点击 "Summon Qwen3 Wisdom" 按钮，等待 AI 响应。

### 2. Generate Agent Code / 生成代理代码

1. After receiving advice, click "🚀 Deploy Agent"
2. The system will generate Python automation code based on the advice
3. Code will appear in a styled code block

收到建议后，点击 "🚀 Deploy Agent"，系统将基于建议生成 Python 自动化代码，代码将显示在样式化的代码块中。

### 3. Download Code / 下载代码

1. Click "💾 Download Bot.py - Export your empire code!"
2. The `bot.py` file will be downloaded to your device

点击 "💾 Download Bot.py - Export your empire code!"，`bot.py` 文件将下载到您的设备。

---

## 🛠️ Tech Stack / 技术栈

- **Runtime**: [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- **Frontend**: [React 19](https://react.dev) - UI library
- **UI Components**: [Shadcn UI](https://ui.shadcn.com) - Beautiful component library
- **Styling**: [Tailwind CSS 4.1](https://tailwindcss.com) - Utility-first CSS
- **AI Model**: [Qwen3](https://qwenlm.github.io) via [Ollama](https://ollama.ai)
- **Language**: TypeScript - Type-safe JavaScript

---

## 🔧 Configuration / 配置

### Ollama API Configuration / Ollama API 配置

The app connects to Ollama API at `http://localhost:11434/api/generate`. Make sure Ollama is running:

应用连接到 `http://localhost:11434/api/generate` 的 Ollama API。确保 Ollama 正在运行：

```bash
# Check if Ollama is running
ollama serve

# Verify qwen3 model is available
ollama list
```

### Customization / 自定义

You can modify the model name in `src/lib/utils.ts`:

可以在 `src/lib/utils.ts` 中修改模型名称：

```typescript
model: "qwen3:latest", // Change to your preferred model
```

---

## 🎨 UI Features / 界面特性

- **Neon Gradient Buttons**: Purple-to-pink gradient with glow effects
- **Animated Header**: Subtle bounce animation on title
- **Dark Mode**: Toggle between light and dark themes
- **Loading States**: Spinning emoji indicators during API calls
- **Success Toasts**: Animated notifications for completed actions
- **Responsive Design**: Works perfectly on mobile and desktop

- **霓虹渐变按钮**: 紫色到粉色的渐变，带发光效果
- **动画标题**: 标题上的轻微弹跳动画
- **深色模式**: 在浅色和深色主题之间切换
- **加载状态**: API 调用期间的旋转表情符号指示器
- **成功提示**: 完成操作的动画通知
- **响应式设计**: 在移动设备和桌面设备上完美运行

---

## 📝 API Endpoints / API 端点

The server includes example API endpoints:

服务器包含示例 API 端点：

- `GET /api/hello` - Hello world endpoint
- `PUT /api/hello` - Hello world endpoint (PUT method)
- `GET /api/hello/:name` - Personalized hello endpoint

---

## 🐛 Troubleshooting / 故障排除

### Ollama Connection Issues / Ollama 连接问题

If you see connection errors, ensure:

如果看到连接错误，请确保：

1. Ollama is running: `ollama serve`
2. Qwen3 model is installed: `ollama pull qwen3:latest`
3. Port 11434 is not blocked by firewall

### Build Issues / 构建问题

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lock
bun install
```

---

## 🤝 Contributing / 贡献

Contributions are welcome! Please feel free to submit a Pull Request.

欢迎贡献！请随时提交 Pull Request。

---

## 📄 License / 许可证

This project is private and proprietary.

本项目为私有和专有项目。

---

## 🙏 Acknowledgments / 致谢

- [Bun](https://bun.sh) - Amazing JavaScript runtime
- [React](https://react.dev) - UI library
- [Shadcn UI](https://ui.shadcn.com) - Beautiful components
- [Ollama](https://ollama.ai) - Local AI model hosting
- [Qwen3](https://qwenlm.github.io) - Powerful AI model

---

<div align="center">

**Built with ❤️ for solo entrepreneurs**

**为独立创业者打造 ❤️**

[Report Bug](https://github.com/charlie-cao/grokforge-ai-hub/issues) · [Request Feature](https://github.com/charlie-cao/grokforge-ai-hub/issues)

</div>
