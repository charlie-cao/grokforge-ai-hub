# GrokForge AI Hub 🚀

<div align="center">

**Building the Future of AI-Assisted Development**

**构建 AI 辅助开发的未来**

[![Bun](https://img.shields.io/badge/Bun-1.3+-000000?style=for-the-badge&logo=bun)](https://bun.sh)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

*A comprehensive collection of AI-powered demos and frameworks for modern development workflows*

*AI 驱动的现代开发工作流演示和框架集合*

[English](#english) | [中文](#中文)

</div>

---

## 👨‍💻 About Me / 关于我

<div align="center">

**Charlie Cao** | AI Developer & Vibecoding Practitioner

**Charlie Cao** | AI 开发者 & Vibecoding 实践者

</div>

Hi! I'm **Charlie Cao**, a developer passionate about exploring the intersection of AI and software development. This repository showcases my experiments with **vibecoding** (AI-assisted collaborative development) and various modern tech stacks.

你好！我是 **Charlie Cao**，一名热衷于探索 AI 与软件开发交汇点的开发者。这个仓库展示了我对 **vibecoding**（AI 辅助协作开发）和各种现代技术栈的实践。

### What is Vibecoding? / 什么是 Vibecoding？

**Vibecoding** is a collaborative development approach where developers work in harmony with AI assistants. It's not about replacing developers, but amplifying their capabilities through intelligent collaboration.

**Vibecoding** 是一种协作开发方式，开发者与 AI 助手和谐协作。这不是要取代开发者，而是通过智能协作增强他们的能力。

**Key Principles / 核心原则:**
- 🤝 **Collaboration over replacement** - AI as a partner, not a replacement
- 🚀 **Acceleration with quality** - Fast prototyping while maintaining code quality
- 🎓 **Learning through doing** - Learn new technologies while building
- 🔄 **Iteration over perfection** - Fast trial and error, continuous improvement

- 🤝 **协作而非替代** - AI 是伙伴，不是替代品
- 🚀 **加速且保证质量** - 快速原型，同时保持代码质量
- 🎓 **在实践中学习** - 在构建中学习新技术
- 🔄 **迭代而非完美** - 快速试错，持续改进

### Connect with Me / 联系我

- 🌐 **GitHub**: [@charlie-cao](https://github.com/charlie-cao)
- 💼 **LinkedIn**: *Coming soon*
- 📧 **Email**: *your-email@example.com*
- 🐦 **Twitter/X**: *Coming soon*

---

## 🎯 Project Overview / 项目概览

This repository contains **6 comprehensive demos** showcasing different aspects of AI-powered development:

本仓库包含 **6 个综合演示**，展示 AI 驱动开发的不同方面：

### 📦 Demo Collection / 演示集合

| Demo | Description | Tech Stack | Status |
|------|-------------|------------|--------|
| **Demo 1** | Interactive canvas with tldraw | tldraw, React | ✅ Complete |
| **Demo 2** | Flow-based analysis with React Flow | React Flow, React | ✅ Complete |
| **Demo 3** | Rich React Flow features + Agent Chat | React Flow, Ollama, SSE | ✅ Complete |
| **Demo 4** | Integrated tech stack showcase | React Flow, Tiptap, Monaco, RGL, Zustand, Jotai, Zod | ✅ Complete |
| **Demo 5** | Multi-tab tech stack demo | All above + Shadcn UI | ✅ Complete |
| **Demo 6** | **Queue-based AI Chat System** | Bun.js, BullMQ, Redis, Ollama, SSE | ⭐ **Featured** |

### ⭐ Featured: Demo6 - Enterprise AI Chat Queue System

**Demo6** is the crown jewel of this collection - a production-ready, enterprise-grade queue-based AI chat system built in just **2 hours** using vibecoding.

**Demo6** 是这个集合中的亮点 - 一个生产就绪的企业级队列式 AI 对话系统，使用 vibecoding 仅用 **2 小时**构建。

👉 **[Read Full Demo6 Documentation (English)](docs/DEMO6_EN.md)**  
👉 **[阅读完整 Demo6 文档（中文）](docs/DEMO6_CN.md)**

**Key Features / 核心特性:**
- 🚀 **Queue Management** - Priority-based task queuing with BullMQ
- 📊 **Real-time Monitoring** - Live progress tracking via SSE
- 🔄 **Auto Retry** - Intelligent retry mechanism
- 📈 **Performance Metrics** - Response time, throughput, success rate
- 🌐 **i18n Support** - Full Chinese/English interface
- ⚡ **High Performance** - Bun.js runtime, <1s startup

---

## 🚀 Quick Start / 快速开始

### Prerequisites / 前置要求

- [Bun](https://bun.sh) v1.3+ installed
- [Docker](https://www.docker.com) (for Demo6 Redis)
- [Ollama](https://ollama.ai) with `qwen3:latest` model

### Installation / 安装

```bash
# Clone the repository
git clone https://github.com/charlie-cao/grokforge-ai-hub.git
cd grokforge-ai-hub

# Install dependencies
bun install
```

### Running Demos / 运行演示

#### All Demos (Main App) / 所有演示（主应用）

```bash
# Start development server
bun dev

# Access at http://localhost:3000
# Navigate to /demo1, /demo2, /demo3, /demo4, /demo5, or /demo6
```

#### Demo6 (Queue System) / Demo6（队列系统）

```bash
# Start Redis (in separate terminal)
docker-compose -f docker-compose.demo6.yml up -d

# Start queue server (in separate terminal)
bun run demo6:server

# Start frontend (in separate terminal)
bun dev

# Access Demo6 at http://localhost:3000/demo6
```

For detailed Demo6 setup, see [Demo6 Quick Start Guide](docs/DEMO6_QUICKSTART.md).

详细的 Demo6 设置，请参阅 [Demo6 快速开始指南](docs/DEMO6_QUICKSTART.md)。

### 🐳 Docker Deployment / Docker 部署

#### Quick Deploy / 快速部署

```bash
# Development environment
docker-compose up -d

# Production environment
docker-compose -f docker-compose.prod.yml up -d

# Or use deployment script
./scripts/deploy.sh prod  # Linux/macOS
.\scripts\deploy.ps1 prod  # Windows PowerShell
```

#### Configuration / 配置

1. Copy environment file:
```bash
cp env.example .env
```

2. Edit `.env` with your settings:
```env
APP_PORT=3000
REDIS_PASSWORD=your-secure-password
OLLAMA_HOST=ollama
CORS_ORIGIN=https://yourdomain.com
```

For detailed deployment guide, see:
- **[Deployment Guide (English)](docs/DEPLOYMENT_EN.md)**
- **[部署指南（中文）](docs/DEPLOYMENT_CN.md)**

---

## 🛠️ Tech Stack / 技术栈

### Core Technologies / 核心技术

- **Runtime**: [Bun.js](https://bun.sh) - Ultra-fast JavaScript runtime
- **Frontend**: [React 19](https://react.dev) - Modern UI library
- **Language**: [TypeScript](https://www.typescriptlang.org) - Type-safe development
- **Styling**: [Tailwind CSS 4.1](https://tailwindcss.com) - Utility-first CSS
- **UI Components**: [Shadcn UI](https://ui.shadcn.com) - Beautiful, accessible components

### AI & Backend / AI 与后端

- **AI Model**: [Qwen3](https://qwenlm.github.io) via [Ollama](https://ollama.ai)
- **Queue System**: [BullMQ](https://docs.bullmq.io) - Modern Redis-based queue
- **Database**: [Redis](https://redis.io) - In-memory data store
- **Real-time**: [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

### Advanced Libraries / 高级库

- **Canvas/Flow**: [React Flow](https://reactflow.dev), [tldraw](https://tldraw.com)
- **Rich Text**: [Tiptap](https://tiptap.dev)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor)
- **Layout**: [React Grid Layout](https://github.com/react-grid-layout/react-grid-layout)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs), [Jotai](https://jotai.org)
- **Validation**: [Zod](https://zod.dev)

---

## 📁 Project Structure / 项目结构

```
grokforge-ai-hub/
├── src/
│   ├── pages/              # Demo pages (Demo1-6)
│   ├── components/         # Reusable components
│   │   └── ui/             # Shadcn UI components
│   ├── lib/                # Utilities & configurations
│   │   ├── i18n.ts         # Internationalization
│   │   ├── models.ts       # AI model management
│   │   └── utils.ts        # Helper functions
│   ├── server/             # Backend servers
│   │   ├── demo6-queue.ts  # Queue worker
│   │   └── demo6-server.ts # HTTP server
│   └── index.ts            # Main server entry
├── docs/                   # Documentation
│   ├── DEMO6_CN.md         # Demo6 Chinese docs
│   ├── DEMO6_EN.md         # Demo6 English docs
│   └── TOOLS_EVALUATION.md # Tech stack evaluation
├── scripts/                # Utility scripts
├── docker-compose.demo6.yml # Redis configuration
└── README.md               # This file
```

---

## 🎨 Demo Highlights / 演示亮点

### Demo 1: Interactive Canvas / 交互式画布
- Real-time canvas editing with tldraw
- Dynamic shape creation and manipulation
- Smooth, fluid user interactions

### Demo 2: Flow Analysis / 流程分析
- React Flow-based analysis workflow
- Step-by-step process visualization
- Click-to-generate functionality

### Demo 3: Agent Chat / 智能体对话
- Real-time streaming AI responses
- Multiple custom node types
- Interactive flow editing

### Demo 4: Tech Stack Integration / 技术栈整合
- Comprehensive showcase of modern tools
- React Flow + Tiptap + Monaco + RGL
- Zustand + Jotai + Zod integration

### Demo 5: Multi-Tab Showcase / 多标签展示
- Organized tech stack presentation
- Detailed feature descriptions
- Interactive examples

### Demo 6: Enterprise Queue System / 企业级队列系统 ⭐
- Production-ready architecture
- Real-time status monitoring
- Performance metrics dashboard
- Full i18n support

---

## 💡 Key Learnings / 核心收获

### Vibecoding Benefits / Vibecoding 优势

1. **Rapid Prototyping** - Build complete systems in hours, not days
2. **Code Quality** - AI-generated code is well-structured and type-safe
3. **Learning Efficiency** - Learn new technologies while building
4. **Iteration Speed** - Fast trial and error, rapid improvement

### Technical Insights / 技术洞察

- **Bun.js** is a game-changer for AI backends (4x faster startup)
- **BullMQ** provides enterprise-grade queue management
- **SSE** is perfect for one-way real-time updates
- **TypeScript** ensures type safety across the stack

---

## 📊 Project Statistics / 项目统计

- **Total Demos**: 6
- **Lines of Code**: ~15,000+
- **Technologies Used**: 20+
- **Development Time**: ~2 hours per major demo
- **Languages**: TypeScript, Python (Pyodide)
- **Architecture**: Monorepo, Microservices (Demo6)

---

## 🔮 Roadmap / 路线图

### Short-term / 短期 (1-2 weeks)
- [ ] Add more AI model integrations (OpenAI, Anthropic)
- [ ] Implement user authentication
- [ ] Add conversation history persistence
- [ ] Performance optimizations

### Medium-term / 中期 (1-2 months)
- [ ] Batch task processing
- [ ] Scheduled task support
- [ ] Webhook integrations
- [ ] Advanced monitoring dashboard

### Long-term / 长期 (3-6 months)
- [ ] Distributed deployment
- [ ] Multi-tenant architecture
- [ ] Plugin system
- [ ] Visual workflow editor

---

## 🤝 Contributing / 贡献

Contributions are welcome! This project is a learning journey, and I'd love to collaborate.

欢迎贡献！这个项目是一个学习之旅，我很乐意合作。

### How to Contribute / 如何贡献

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Areas for Contribution / 贡献领域

- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🌐 Additional language support

---

## 📚 Documentation / 文档

- **[Demo6 Full Documentation (English)](docs/DEMO6_EN.md)** - Complete guide to Demo6
- **[Demo6 完整文档（中文）](docs/DEMO6_CN.md)** - Demo6 完整指南
- **[Demo6 Quick Start](docs/DEMO6_QUICKSTART.md)** - Quick setup guide
- **[Tech Stack Evaluation](docs/TOOLS_EVALUATION.md)** - Detailed tech analysis

---

## 🐛 Troubleshooting / 故障排除

### Common Issues / 常见问题

**Ollama Connection Error / Ollama 连接错误**
```bash
# Ensure Ollama is running
ollama serve

# Verify model is installed
ollama list
ollama pull qwen3:latest
```

**Redis Connection Error / Redis 连接错误**
```bash
# Check if Redis is running
docker ps | grep redis

# Start Redis if not running
docker-compose -f docker-compose.demo6.yml up -d
```

**Port Conflicts / 端口冲突**
- Frontend: Change port in `src/index.ts`
- Queue Server: Set `PORT` environment variable
- Redis: Modify `docker-compose.demo6.yml`

---

## 📄 License / 许可证

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

---

## 🙏 Acknowledgments / 致谢

Special thanks to:

- **[Bun.js Team](https://bun.sh)** - Amazing JavaScript runtime
- **[React Team](https://react.dev)** - Powerful UI library
- **[Ollama Team](https://ollama.ai)** - Local LLM solution
- **[BullMQ Team](https://docs.bullmq.io)** - Enterprise queue system
- **[Shadcn](https://ui.shadcn.com)** - Beautiful UI components
- **All open-source contributors** - Making development better

特别感谢：

- **[Bun.js 团队](https://bun.sh)** - 优秀的 JavaScript 运行时
- **[React 团队](https://react.dev)** - 强大的 UI 库
- **[Ollama 团队](https://ollama.ai)** - 本地 LLM 解决方案
- **[BullMQ 团队](https://docs.bullmq.io)** - 企业级队列系统
- **[Shadcn](https://ui.shadcn.com)** - 精美的 UI 组件
- **所有开源贡献者** - 让开发变得更好

---

## 🌟 Star History / Star 历史

If you find this project helpful, please consider giving it a star! ⭐

如果你觉得这个项目有帮助，请考虑给它一个 star！⭐

---

<div align="center">

**Built with ❤️ by [Charlie Cao](https://github.com/charlie-cao)**

**用 ❤️ 构建 by [Charlie Cao](https://github.com/charlie-cao)**

*Exploring the future of AI-assisted development*

*探索 AI 辅助开发的未来*

[Report Bug](https://github.com/charlie-cao/grokforge-ai-hub/issues) · [Request Feature](https://github.com/charlie-cao/grokforge-ai-hub/issues) · [View All Demos](http://localhost:3000)

</div>
