# GrokForge AI Hub 🚀

<div align="center">

**构建 AI 辅助开发的未来**

**Building the Future of AI-Assisted Development**

[![Bun](https://img.shields.io/badge/Bun-1.3+-000000?style=for-the-badge&logo=bun)](https://bun.sh)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

*一个全面的 AI 驱动演示和框架集合，用于现代开发工作流*

*A comprehensive collection of AI-powered demos and frameworks for modern development workflows*

[English](README.md) | [中文](#)

</div>

---

## 👨‍💻 关于我

<div align="center">

**Charlie Cao** | AI 开发者 & Vibecoding 实践者

**Charlie Cao** | AI Developer & Vibecoding Practitioner

</div>

你好！我是 **Charlie Cao**，一名热衷于探索 AI 与软件开发交汇点的开发者。这个仓库展示了我对 **vibecoding**（AI 辅助协作开发）和各种现代技术栈的实践。

Hi! I'm **Charlie Cao**, a developer passionate about exploring the intersection of AI and software development. This repository showcases my experiments with **vibecoding** (AI-assisted collaborative development) and various modern tech stacks.

### 什么是 Vibecoding？/ What is Vibecoding？

**Vibecoding** 是一种协作开发方式，开发者与 AI 助手和谐协作。这不是要取代开发者，而是通过智能协作增强他们的能力。

**Vibecoding** is a collaborative development approach where developers work in harmony with AI assistants. It's not about replacing developers, but amplifying their capabilities through intelligent collaboration.

**核心原则：** / **Key Principles:**
- 🤝 **协作而非替代** - AI 是伙伴，不是替代品
- 🚀 **加速且保证质量** - 快速原型，同时保持代码质量
- 🎓 **在实践中学习** - 在构建中学习新技术
- 🔄 **迭代而非完美** - 快速试错，持续改进

- 🤝 **Collaboration over replacement** - AI as a partner, not a replacement
- 🚀 **Acceleration with quality** - Fast prototyping while maintaining code quality
- 🎓 **Learning through doing** - Learn new technologies while building
- 🔄 **Iteration over perfection** - Fast trial and error, continuous improvement

### 联系我 / Connect with Me

- 🌐 **GitHub**: [@charlie-cao](https://github.com/charlie-cao)
- 💼 **LinkedIn**: *即将推出*
- 📧 **邮箱**: *your-email@example.com*
- 🐦 **Twitter/X**: *即将推出*

---

## 🎯 项目概览

本仓库包含 **6 个综合演示**，展示 AI 驱动开发的不同方面：

This repository contains **6 comprehensive demos** showcasing different aspects of AI-powered development:

### 📦 演示集合 / Demo Collection

| Demo | 描述 | 技术栈 | 状态 |
|------|------|--------|------|
| **Demo 1** | 使用 tldraw 的交互式画布 | tldraw, React | ✅ 完成 |
| **Demo 2** | 基于 React Flow 的流程分析 | React Flow, React | ✅ 完成 |
| **Demo 3** | 丰富的 React Flow 功能 + 智能体对话 | React Flow, Ollama, SSE | ✅ 完成 |
| **Demo 4** | 技术栈整合展示 | React Flow, Tiptap, Monaco, RGL, Zustand, Jotai, Zod | ✅ 完成 |
| **Demo 5** | 多标签技术栈演示 | 以上所有 + Shadcn UI | ✅ 完成 |
| **Demo 6** | **基于队列的 AI 对话系统** | Bun.js, BullMQ, Redis, Ollama, SSE | ⭐ **特色** |

### ⭐ 特色：Demo6 - 企业级 AI 对话队列系统

**Demo6** 是这个集合中的亮点 - 一个生产就绪的企业级队列式 AI 对话系统，使用 vibecoding 仅用 **2 小时**构建。

**Demo6** is the crown jewel of this collection - a production-ready, enterprise-grade queue-based AI chat system built in just **2 hours** using vibecoding.

👉 **[阅读完整 Demo6 文档（中文）](docs/DEMO6_CN.md)**  
👉 **[Read Full Demo6 Documentation (English)](docs/DEMO6_EN.md)**

**核心特性：** / **Key Features:**
- 🚀 **队列管理** - 基于优先级的任务队列（BullMQ）
- 📊 **实时监控** - 通过 SSE 实时进度追踪
- 🔄 **自动重试** - 智能重试机制
- 📈 **性能指标** - 响应时间、吞吐量、成功率
- 🌐 **国际化支持** - 完整的中英文界面
- ⚡ **高性能** - Bun.js 运行时，<1 秒启动

---

## 🚀 快速开始

### 前置要求

- [Bun](https://bun.sh) v1.3+ 已安装
- [Docker](https://www.docker.com) (用于 Demo6 的 Redis)
- [Ollama](https://ollama.ai) 已安装 `qwen3:latest` 模型

### 安装

```bash
# 克隆仓库
git clone https://github.com/charlie-cao/grokforge-ai-hub.git
cd grokforge-ai-hub

# 安装依赖
bun install
```

### 运行演示

#### 所有演示（主应用）

```bash
# 启动开发服务器
bun dev

# 访问 http://localhost:3000
# 导航到 /demo1, /demo2, /demo3, /demo4, /demo5, 或 /demo6
```

#### Demo6（队列系统）

```bash
# 启动 Redis（在单独终端）
docker-compose -f docker-compose.demo6.yml up -d

# 启动队列服务器（在单独终端）
bun run demo6:server

# 启动前端（在单独终端）
bun dev

# 访问 Demo6: http://localhost:3000/demo6
```

详细的 Demo6 设置，请参阅 [Demo6 快速开始指南](docs/DEMO6_QUICKSTART.md)。

For detailed Demo6 setup, see [Demo6 Quick Start Guide](docs/DEMO6_QUICKSTART.md).

---

## 🛠️ 技术栈

### 核心技术

- **运行时**: [Bun.js](https://bun.sh) - 超快 JavaScript 运行时
- **前端**: [React 19](https://react.dev) - 现代 UI 库
- **语言**: [TypeScript](https://www.typescriptlang.org) - 类型安全开发
- **样式**: [Tailwind CSS 4.1](https://tailwindcss.com) - 实用优先 CSS
- **UI 组件**: [Shadcn UI](https://ui.shadcn.com) - 精美、可访问的组件

### AI 与后端

- **AI 模型**: [Qwen3](https://qwenlm.github.io) via [Ollama](https://ollama.ai)
- **队列系统**: [BullMQ](https://docs.bullmq.io) - 基于 Redis 的现代队列
- **数据库**: [Redis](https://redis.io) - 内存数据存储
- **实时通信**: [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

### 高级库

- **画布/流程**: [React Flow](https://reactflow.dev), [tldraw](https://tldraw.com)
- **富文本**: [Tiptap](https://tiptap.dev)
- **代码编辑器**: [Monaco Editor](https://microsoft.github.io/monaco-editor)
- **布局**: [React Grid Layout](https://github.com/react-grid-layout/react-grid-layout)
- **状态管理**: [Zustand](https://zustand-demo.pmnd.rs), [Jotai](https://jotai.org)
- **验证**: [Zod](https://zod.dev)

---

## 📁 项目结构

```
grokforge-ai-hub/
├── src/
│   ├── pages/              # 演示页面 (Demo1-6)
│   ├── components/         # 可复用组件
│   │   └── ui/             # Shadcn UI 组件
│   ├── lib/                # 工具和配置
│   │   ├── i18n.ts         # 国际化
│   │   ├── models.ts       # AI 模型管理
│   │   └── utils.ts        # 辅助函数
│   ├── server/             # 后端服务器
│   │   ├── demo6-queue.ts  # 队列工作进程
│   │   └── demo6-server.ts # HTTP 服务器
│   └── index.ts            # 主服务器入口
├── docs/                   # 文档
│   ├── DEMO6_CN.md         # Demo6 中文文档
│   ├── DEMO6_EN.md         # Demo6 英文文档
│   └── TOOLS_EVALUATION.md # 技术栈评估
├── scripts/                # 工具脚本
├── docker-compose.demo6.yml # Redis 配置
└── README.md               # 本文件
```

---

## 🎨 演示亮点

### Demo 1: 交互式画布
- 使用 tldraw 实时画布编辑
- 动态形状创建和操作
- 流畅的用户交互

### Demo 2: 流程分析
- 基于 React Flow 的分析工作流
- 逐步流程可视化
- 点击生成功能

### Demo 3: 智能体对话
- 实时流式 AI 响应
- 多种自定义节点类型
- 交互式流程编辑

### Demo 4: 技术栈整合
- 现代工具综合展示
- React Flow + Tiptap + Monaco + RGL
- Zustand + Jotai + Zod 集成

### Demo 5: 多标签展示
- 有序的技术栈展示
- 详细的功能描述
- 交互式示例

### Demo 6: 企业级队列系统 ⭐
- 生产就绪的架构
- 实时状态监控
- 性能指标仪表板
- 完整的国际化支持

---

## 💡 核心收获

### Vibecoding 优势

1. **快速原型** - 几小时内构建完整系统，而不是几天
2. **代码质量** - AI 生成的代码结构清晰且类型安全
3. **学习效率** - 在构建中学习新技术
4. **迭代速度** - 快速试错，快速改进

### 技术洞察

- **Bun.js** 是 AI 后端的游戏规则改变者（启动速度快 4 倍）
- **BullMQ** 提供企业级队列管理
- **SSE** 非常适合单向实时更新
- **TypeScript** 确保整个技术栈的类型安全

---

## 📊 项目统计

- **演示总数**: 6
- **代码行数**: 15,000+
- **使用的技术**: 20+
- **开发时间**: 每个主要演示约 2 小时
- **语言**: TypeScript, Python (Pyodide)
- **架构**: Monorepo, 微服务 (Demo6)

---

## 🔮 路线图

### 短期 (1-2 周)
- [ ] 添加更多 AI 模型集成（OpenAI, Anthropic）
- [ ] 实现用户认证
- [ ] 添加对话历史持久化
- [ ] 性能优化

### 中期 (1-2 月)
- [ ] 批量任务处理
- [ ] 定时任务支持
- [ ] Webhook 集成
- [ ] 高级监控仪表板

### 长期 (3-6 月)
- [ ] 分布式部署
- [ ] 多租户架构
- [ ] 插件系统
- [ ] 可视化工作流编辑器

---

## 🤝 贡献

欢迎贡献！这个项目是一个学习之旅，我很乐意合作。

Contributions are welcome! This project is a learning journey, and I'd love to collaborate.

### 如何贡献

1. **Fork** 仓库
2. **创建** 功能分支 (`git checkout -b feature/amazing-feature`)
3. **提交** 更改 (`git commit -m 'Add amazing feature'`)
4. **推送** 到分支 (`git push origin feature/amazing-feature`)
5. **打开** Pull Request

### 贡献领域

- 🐛 Bug 修复
- ✨ 新功能
- 📚 文档改进
- 🎨 UI/UX 增强
- ⚡ 性能优化
- 🌐 额外语言支持

---

## 📚 文档

- **[Demo6 完整文档（中文）](docs/DEMO6_CN.md)** - Demo6 完整指南
- **[Demo6 Full Documentation (English)](docs/DEMO6_EN.md)** - Complete guide to Demo6
- **[Demo6 快速开始](docs/DEMO6_QUICKSTART.md)** - 快速设置指南
- **[技术栈评估](docs/TOOLS_EVALUATION.md)** - 详细技术分析

---

## 🐛 故障排除

### 常见问题

**Ollama 连接错误**
```bash
# 确保 Ollama 正在运行
ollama serve

# 验证模型已安装
ollama list
ollama pull qwen3:latest
```

**Redis 连接错误**
```bash
# 检查 Redis 是否运行
docker ps | grep redis

# 如果未运行，启动 Redis
docker-compose -f docker-compose.demo6.yml up -d
```

**端口冲突**
- 前端: 在 `src/index.ts` 中更改端口
- 队列服务器: 设置 `PORT` 环境变量
- Redis: 修改 `docker-compose.demo6.yml`

---

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 致谢

特别感谢：

- **[Bun.js 团队](https://bun.sh)** - 优秀的 JavaScript 运行时
- **[React 团队](https://react.dev)** - 强大的 UI 库
- **[Ollama 团队](https://ollama.ai)** - 本地 LLM 解决方案
- **[BullMQ 团队](https://docs.bullmq.io)** - 企业级队列系统
- **[Shadcn](https://ui.shadcn.com)** - 精美的 UI 组件
- **所有开源贡献者** - 让开发变得更好

Special thanks to:

- **[Bun.js Team](https://bun.sh)** - Amazing JavaScript runtime
- **[React Team](https://react.dev)** - Powerful UI library
- **[Ollama Team](https://ollama.ai)** - Local LLM solution
- **[BullMQ Team](https://docs.bullmq.io)** - Enterprise queue system
- **[Shadcn](https://ui.shadcn.com)** - Beautiful UI components
- **All open-source contributors** - Making development better

---

## 🌟 Star 历史

如果你觉得这个项目有帮助，请考虑给它一个 star！⭐

If you find this project helpful, please consider giving it a star! ⭐

---

<div align="center">

**用 ❤️ 构建 by [Charlie Cao](https://github.com/charlie-cao)**

**Built with ❤️ by [Charlie Cao](https://github.com/charlie-cao)**

*探索 AI 辅助开发的未来*

*Exploring the future of AI-assisted development*

[报告 Bug](https://github.com/charlie-cao/grokforge-ai-hub/issues) · [请求功能](https://github.com/charlie-cao/grokforge-ai-hub/issues) · [查看所有演示](http://localhost:3000)

</div>

