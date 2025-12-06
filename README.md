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
- 💼 **LinkedIn / 领英**: *Coming soon / 即将推出*
- 📧 **Email / 邮箱**: *pplboy@gmail.com*
- 🐦 **Twitter/X**: *Coming soon / 即将推出*

---

## 🎯 Project Overview / 项目概览

This repository contains **7 comprehensive demos** showcasing different aspects of AI-powered development:

本仓库包含 **7 个综合演示**，展示 AI 驱动开发的不同方面：

### 📦 Demo Collection / 演示集合

| Demo | Description / 描述 | Tech Stack / 技术栈 | Status / 状态 |
|------|-------------|------------|--------|
| **Demo 1** | Interactive canvas with tldraw / 使用 tldraw 的交互式画布 | tldraw, React | ✅ Complete / 完成 |
| **Demo 2** | Flow-based analysis with React Flow / 基于 React Flow 的流程分析 | React Flow, React | ✅ Complete / 完成 |
| **Demo 3** | Rich React Flow features + Agent Chat / 丰富的 React Flow 功能 + 智能体对话 | React Flow, Ollama, SSE | ✅ Complete / 完成 |
| **Demo 4** | Integrated tech stack showcase / 技术栈整合展示 | React Flow, Tiptap, Monaco, RGL, Zustand, Jotai, Zod | ✅ Complete / 完成 |
| **Demo 5** | Multi-tab tech stack demo / 多标签技术栈演示 | All above + Shadcn UI | ✅ Complete / 完成 |
| **Demo 6** | **Queue-based AI Chat System / 基于队列的 AI 对话系统** | Bun.js, BullMQ, Redis, Ollama, SSE | ⭐ **Featured / 特色** |
| **Demo 7** | **Scheduled AI Chat Tasks / 定时 AI 对话任务** | Bun.js, Bun SQLite, Ollama, Drizzle ORM | ✅ Complete / 完成 |

### ⭐ Featured: Demo6 - Enterprise AI Chat Queue System / 特色：Demo6 - 企业级 AI 对话队列系统

**Demo6** is the crown jewel of this collection - a production-ready, enterprise-grade queue-based AI chat system built in just **2 hours** using vibecoding.

**Demo6** 是这个集合中的亮点 - 一个生产就绪的企业级队列式 AI 对话系统，使用 vibecoding 仅用 **2 小时**构建。

👉 **[Read Full Demo6 Documentation (English)](docs/DEMO6_EN.md)**  
👉 **[阅读完整 Demo6 文档（中文）](docs/DEMO6_CN.md)**

详细的 Demo6 设置，请参阅 [Demo6 快速开始指南](docs/DEMO6_QUICKSTART.md)。

For detailed Demo6 setup, see [Demo6 Quick Start Guide](docs/DEMO6_QUICKSTART.md).

**Key Features / 核心特性:**
- 🚀 **Queue Management / 队列管理** - Priority-based task queuing with BullMQ / 基于优先级的任务队列（BullMQ）
- 📊 **Real-time Monitoring / 实时监控** - Live progress tracking via SSE / 通过 SSE 实时进度追踪
- 🔄 **Auto Retry / 自动重试** - Intelligent retry mechanism / 智能重试机制
- 📈 **Performance Metrics / 性能指标** - Response time, throughput, success rate / 响应时间、吞吐量、成功率
- 🌐 **i18n Support / 国际化支持** - Full Chinese/English interface / 完整的中英文界面
- ⚡ **High Performance / 高性能** - Bun.js runtime, <1s startup / Bun.js 运行时，<1 秒启动

---

## 🚀 Quick Start / 快速开始

### Prerequisites / 前置要求

- [Bun](https://bun.sh) v1.3+ installed / 已安装
- [Docker](https://www.docker.com) (for Demo6 Redis / 用于 Demo6 的 Redis)
- [Ollama](https://ollama.ai) with `qwen3:latest` model / 已安装 `qwen3:latest` 模型

### Installation / 安装

```bash
# Clone the repository / 克隆仓库
git clone https://github.com/charlie-cao/grokforge-ai-hub.git
cd grokforge-ai-hub

# Install dependencies / 安装依赖
bun install
```

### Running Demos / 运行演示

#### All Demos (Main App) / 所有演示（主应用）

```bash
# Start development server / 启动开发服务器
bun dev

# Access at http://localhost:3000 / 访问 http://localhost:3000
# Navigate to /demo1, /demo2, /demo3, /demo4, /demo5, or /demo6 / 导航到 /demo1, /demo2, /demo3, /demo4, /demo5, 或 /demo6
```

#### Demo6 (Queue System) / Demo6（队列系统）

```bash
# Start Redis (in separate terminal) / 启动 Redis（在单独终端）
docker-compose -f docker-compose.demo6.yml up -d

# Start queue server (in separate terminal) / 启动队列服务器（在单独终端）
bun run demo6:server

# Start frontend (in separate terminal) / 启动前端（在单独终端）
bun dev

# Access Demo6 at http://localhost:3000/demo6 / 访问 Demo6: http://localhost:3000/demo6
```

### 🐳 Docker Deployment / Docker 部署

#### Quick Deploy / 快速部署

```bash
# Development environment / 开发环境
docker-compose up -d

# Production environment / 生产环境
docker-compose -f docker-compose.prod.yml up -d

# Or use deployment script / 或使用部署脚本
./scripts/deploy.sh prod  # Linux/macOS
.\scripts\deploy.ps1 prod  # Windows PowerShell
```

#### Configuration / 配置

1. Copy environment file / 复制环境变量文件：
```bash
cp env.example .env
```

2. Edit `.env` with your settings / 编辑 `.env` 设置你的配置：
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

- **Runtime / 运行时**: [Bun.js](https://bun.sh) - Ultra-fast JavaScript runtime / 超快 JavaScript 运行时
- **Frontend / 前端**: [React 19](https://react.dev) - Modern UI library / 现代 UI 库
- **Language / 语言**: [TypeScript](https://www.typescriptlang.org) - Type-safe development / 类型安全开发
- **Styling / 样式**: [Tailwind CSS 4.1](https://tailwindcss.com) - Utility-first CSS / 实用优先 CSS
- **UI Components / UI 组件**: [Shadcn UI](https://ui.shadcn.com) - Beautiful, accessible components / 精美、可访问的组件

### AI & Backend / AI 与后端

- **AI Model / AI 模型**: [Qwen3](https://qwenlm.github.io) via [Ollama](https://ollama.ai)
- **Queue System / 队列系统**: [BullMQ](https://docs.bullmq.io) - Modern Redis-based queue / 基于 Redis 的现代队列
- **Database / 数据库**: [Redis](https://redis.io) - In-memory data store / 内存数据存储
- **Real-time / 实时通信**: [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

### Advanced Libraries / 高级库

- **Canvas/Flow / 画布/流程**: [React Flow](https://reactflow.dev), [tldraw](https://tldraw.com)
- **Rich Text / 富文本**: [Tiptap](https://tiptap.dev)
- **Code Editor / 代码编辑器**: [Monaco Editor](https://microsoft.github.io/monaco-editor)
- **Layout / 布局**: [React Grid Layout](https://github.com/react-grid-layout/react-grid-layout)
- **State Management / 状态管理**: [Zustand](https://zustand-demo.pmnd.rs), [Jotai](https://jotai.org)
- **Validation / 验证**: [Zod](https://zod.dev)

---

## 📁 Project Structure / 项目结构

```
grokforge-ai-hub/
├── src/
│   ├── pages/              # Demo pages (Demo1-6) / 演示页面 (Demo1-6)
│   ├── components/         # Reusable components / 可复用组件
│   │   └── ui/             # Shadcn UI components / Shadcn UI 组件
│   ├── lib/                # Utilities & configurations / 工具和配置
│   │   ├── i18n.ts         # Internationalization / 国际化
│   │   ├── models.ts       # AI model management / AI 模型管理
│   │   └── utils.ts        # Helper functions / 辅助函数
│   ├── server/             # Backend servers / 后端服务器
│   │   ├── demo6-queue.ts  # Queue worker / 队列工作进程
│   │   └── demo6-server.ts # HTTP server / HTTP 服务器
│   └── index.ts            # Main server entry / 主服务器入口
├── docs/                   # Documentation / 文档
│   ├── DEMO6_CN.md         # Demo6 Chinese docs / Demo6 中文文档
│   ├── DEMO6_EN.md         # Demo6 English docs / Demo6 英文文档
│   └── TOOLS_EVALUATION.md # Tech stack evaluation / 技术栈评估
├── scripts/                # Utility scripts / 工具脚本
├── docker-compose.demo6.yml # Redis configuration / Redis 配置
└── README.md               # This file / 本文件
```

---

## 🎨 Demo Highlights / 演示亮点

### Demo 1: Interactive Canvas / 交互式画布
- Real-time canvas editing with tldraw / 使用 tldraw 实时画布编辑
- Dynamic shape creation and manipulation / 动态形状创建和操作
- Smooth, fluid user interactions / 流畅的用户交互

### Demo 2: Flow Analysis / 流程分析
- React Flow-based analysis workflow / 基于 React Flow 的分析工作流
- Step-by-step process visualization / 逐步流程可视化
- Click-to-generate functionality / 点击生成功能

### Demo 3: Agent Chat / 智能体对话
- Real-time streaming AI responses / 实时流式 AI 响应
- Multiple custom node types / 多种自定义节点类型
- Interactive flow editing / 交互式流程编辑

### Demo 4: Tech Stack Integration / 技术栈整合
- Comprehensive showcase of modern tools / 现代工具综合展示
- React Flow + Tiptap + Monaco + RGL
- Zustand + Jotai + Zod integration / Zustand + Jotai + Zod 集成

### Demo 5: Multi-Tab Showcase / 多标签展示
- Organized tech stack presentation / 有序的技术栈展示
- Detailed feature descriptions / 详细的功能描述
- Interactive examples / 交互式示例

### Demo 6: Enterprise Queue System / 企业级队列系统 ⭐
- Production-ready architecture / 生产就绪的架构
- Real-time status monitoring / 实时状态监控
- Performance metrics dashboard / 性能指标仪表板
- Full i18n support / 完整的国际化支持

---

## 💡 Key Learnings / 核心收获

### Vibecoding Benefits / Vibecoding 优势

1. **Rapid Prototyping / 快速原型** - Build complete systems in hours, not days / 几小时内构建完整系统，而不是几天
2. **Code Quality / 代码质量** - AI-generated code is well-structured and type-safe / AI 生成的代码结构清晰且类型安全
3. **Learning Efficiency / 学习效率** - Learn new technologies while building / 在构建中学习新技术
4. **Iteration Speed / 迭代速度** - Fast trial and error, rapid improvement / 快速试错，快速改进

### Technical Insights / 技术洞察

- **Bun.js** is a game-changer for AI backends (4x faster startup) / 是 AI 后端的游戏规则改变者（启动速度快 4 倍）
- **BullMQ** provides enterprise-grade queue management / 提供企业级队列管理
- **SSE** is perfect for one-way real-time updates / 非常适合单向实时更新
- **TypeScript** ensures type safety across the stack / 确保整个技术栈的类型安全

---

## 📊 Project Statistics / 项目统计

- **Total Demos / 演示总数**: 6
- **Lines of Code / 代码行数**: ~15,000+
- **Technologies Used / 使用的技术**: 20+
- **Development Time / 开发时间**: ~2 hours per major demo / 每个主要演示约 2 小时
- **Languages / 语言**: TypeScript, Python (Pyodide)
- **Architecture / 架构**: Monorepo, Microservices (Demo6) / Monorepo, 微服务 (Demo6)

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

- 🐛 Bug fixes / Bug 修复
- ✨ New features / 新功能
- 📚 Documentation improvements / 文档改进
- 🎨 UI/UX enhancements / UI/UX 增强
- ⚡ Performance optimizations / 性能优化
- 🌐 Additional language support / 额外语言支持

---

## 📚 Documentation / 文档

- **[Demo6 Full Documentation (English)](docs/DEMO6_EN.md)** - Complete guide to Demo6
- **[Demo6 完整文档（中文）](docs/DEMO6_CN.md)** - Demo6 完整指南
- **[Demo6 Quick Start / Demo6 快速开始](docs/DEMO6_QUICKSTART.md)** - Quick setup guide / 快速设置指南
- **[Tech Stack Evaluation / 技术栈评估](docs/TOOLS_EVALUATION.md)** - Detailed tech analysis / 详细技术分析

---

## 🐛 Troubleshooting / 故障排除

### Common Issues / 常见问题

**Ollama Connection Error / Ollama 连接错误**
```bash
# Ensure Ollama is running / 确保 Ollama 正在运行
ollama serve

# Verify model is installed / 验证模型已安装
ollama list
ollama pull qwen3:latest
```

**Redis Connection Error / Redis 连接错误**
```bash
# Check if Redis is running / 检查 Redis 是否运行
docker ps | grep redis

# Start Redis if not running / 如果未运行，启动 Redis
docker-compose -f docker-compose.demo6.yml up -d
```

**Port Conflicts / 端口冲突**
- Frontend / 前端: Change port in `src/index.ts` / 在 `src/index.ts` 中更改端口
- Queue Server / 队列服务器: Set `PORT` environment variable / 设置 `PORT` 环境变量
- Redis: Modify `docker-compose.demo6.yml` / 修改 `docker-compose.demo6.yml`

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
