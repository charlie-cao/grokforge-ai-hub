/**
 * Internationalization (i18n) for Home Page
 * Demo Showcase Hub
 */

export type Language = "zh" | "en";

export interface HomeTranslations {
  // Header
  title: string;
  subtitle: string;
  
  // Demo descriptions
  demo1Title: string;
  demo1Desc: string;
  demo1Tech: string;
  
  demo2Title: string;
  demo2Desc: string;
  demo2Tech: string;
  
  demo3Title: string;
  demo3Desc: string;
  demo3Tech: string;
  
  demo4Title: string;
  demo4Desc: string;
  demo4Tech: string;
  
  demo5Title: string;
  demo5Desc: string;
  demo5Tech: string;
  
  demo6Title: string;
  demo6Desc: string;
  demo6Tech: string;
  
  demo7Title: string;
  demo7Desc: string;
  demo7Tech: string;
  
  demo8Title: string;
  demo8Desc: string;
  demo8Tech: string;
  
  // Common
  viewDemo: string;
  techStack: string;
  status: string;
  statusComplete: string;
  statusFeatured: string;
  totalDemos: string;
}

const translations: Record<Language, HomeTranslations> = {
  zh: {
    title: "GrokForge AI Hub",
    subtitle: "Bun 生态系统的综合演示集合 - 展示现代 AI 驱动开发的最佳实践",
    
    demo1Title: "Demo 1: 图标库与主题库展示",
    demo1Desc: "展示 Bun 友好的图标库、UI 组件库和主题系统，包括 Lucide Icons 和 shadcn/ui",
    demo1Tech: "Lucide Icons, shadcn/ui, Tailwind CSS",
    
    demo2Title: "Demo 2: Bun SQLite + Drizzle ORM",
    demo2Desc: "演示 Bun 内置 SQLite 数据库和 Drizzle ORM 的使用，包括 CRUD 操作和关联查询",
    demo2Tech: "Bun SQLite, Drizzle ORM, TypeScript",
    
    demo3Title: "Demo 3: React Flow + AI 对话",
    demo3Desc: "展示 React Flow 流程图编辑器和实时 AI 对话功能，支持流式响应",
    demo3Tech: "React Flow, Ollama, SSE",
    
    demo4Title: "Demo 4: 技术栈整合展示",
    demo4Desc: "综合展示多种现代前端工具的组合使用，包括流程图、富文本编辑器和代码编辑器",
    demo4Tech: "React Flow, Tiptap, Monaco, RGL, Zustand, Jotai",
    
    demo5Title: "Demo 5: 多标签技术栈演示",
    demo5Desc: "通过多标签页面组织展示所有技术栈功能，提供详细的使用说明",
    demo5Tech: "所有上述工具 + Shadcn UI",
    
    demo6Title: "Demo 6: 企业级队列式 AI 对话系统",
    demo6Desc: "生产就绪的企业级 AI 对话系统，使用 BullMQ 队列管理和实时状态监控",
    demo6Tech: "Bun.js, BullMQ, Redis, Ollama, SSE",
    
    demo7Title: "Demo 7: 定时 AI 对话任务",
    demo7Desc: "使用 Bun 定时器自动执行 AI 对话任务，独立进程运行，每分钟生成聊天记录",
    demo7Tech: "Bun.js, Bun SQLite, Drizzle ORM, Ollama",
    
    demo8Title: "Demo 8: AI 智能对话助手",
    demo8Desc: "智能 AI 对话系统，支持痛点分析和代码生成，包含可视化分析画布",
    demo8Tech: "React, Ollama, tldraw, AI Agents",
    
    viewDemo: "查看演示",
    techStack: "技术栈",
    status: "状态",
    statusComplete: "已完成",
    statusFeatured: "特色",
    totalDemos: "总演示数",
  },
  en: {
    title: "GrokForge AI Hub",
    subtitle: "Comprehensive demo collection for Bun ecosystem - showcasing best practices in modern AI-driven development",
    
    demo1Title: "Demo 1: Icon & Theme Libraries",
    demo1Desc: "Showcase of Bun-friendly icon libraries, UI component libraries, and theme systems including Lucide Icons and shadcn/ui",
    demo1Tech: "Lucide Icons, shadcn/ui, Tailwind CSS",
    
    demo2Title: "Demo 2: Bun SQLite + Drizzle ORM",
    demo2Desc: "Demonstrates Bun's built-in SQLite database and Drizzle ORM usage, including CRUD operations and relations",
    demo2Tech: "Bun SQLite, Drizzle ORM, TypeScript",
    
    demo3Title: "Demo 3: React Flow + AI Chat",
    demo3Desc: "Showcases React Flow diagram editor with real-time AI chat functionality, supporting streaming responses",
    demo3Tech: "React Flow, Ollama, SSE",
    
    demo4Title: "Demo 4: Integrated Tech Stack",
    demo4Desc: "Comprehensive showcase of combined modern frontend tools including flow diagrams, rich text editors, and code editors",
    demo4Tech: "React Flow, Tiptap, Monaco, RGL, Zustand, Jotai",
    
    demo5Title: "Demo 5: Multi-tab Tech Stack Demo",
    demo5Desc: "Organized presentation of all tech stack features through multi-tab pages with detailed usage instructions",
    demo5Tech: "All above + Shadcn UI",
    
    demo6Title: "Demo 6: Enterprise Queue-based AI Chat System",
    demo6Desc: "Production-ready enterprise AI chat system with BullMQ queue management and real-time status monitoring",
    demo6Tech: "Bun.js, BullMQ, Redis, Ollama, SSE",
    
    demo7Title: "Demo 7: Scheduled AI Chat Tasks",
    demo7Desc: "Automated AI chat tasks using Bun timers, running as independent process, generating chat records every minute",
    demo7Tech: "Bun.js, Bun SQLite, Drizzle ORM, Ollama",
    
    demo8Title: "Demo 8: AI Smart Chat Assistant",
    demo8Desc: "Intelligent AI chat system supporting pain point analysis and code generation, with visual analysis canvas",
    demo8Tech: "React, Ollama, tldraw, AI Agents",
    
    viewDemo: "View Demo",
    techStack: "Tech Stack",
    status: "Status",
    statusComplete: "Complete",
    statusFeatured: "Featured",
    totalDemos: "Total Demos",
  },
};

export function useHomeTranslations(language: Language): HomeTranslations {
  return translations[language];
}

