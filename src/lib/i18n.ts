/**
 * Internationalization (i18n) for Demo6
 * Supports Chinese and English
 */

export type Language = "zh" | "en";

export interface Translations {
  // Header
  title: string;
  subtitle: string;
  queueStats: string;
  waiting: string; // For queue stats
  processing: string;
  completed: string;
  failed: string;
  connected: string;
  queueServerDisconnected: string;

  // Sidebar - Tech Stack
  techStack: string;
  features: string;
  technology: string;
  architecture: string;
  coreFeatures: string;
  bunjs: string;
  bunjsDesc: string;
  bullmq: string;
  bullmqDesc: string;
  redis: string;
  redisDesc: string;
  ollama: string;
  ollamaDesc: string;
  sse: string;
  sseDesc: string;
  queueService: string;
  queueServiceDesc: string;
  redisService: string;
  redisServiceDesc: string;
  ollamaService: string;
  ollamaServiceDesc: string;

  // Features
  performanceMetrics: string;
  avgResponseTime: string;
  totalRequests: string;
  successRate: string;
  throughput: string;
  taskHistory: string;
  queueSettings: string;
  taskPriority: string;
  priorityLow: string;
  priorityMedium: string;
  priorityHigh: string;
  concurrency: string;
  maxRetries: string;
  rateLimit: string;
  noHistory: string;
  taskHistoryRecords: string;
  taskQueueManagement: string;
  realTimeProgress: string;
  priorityQueue: string;
  autoRetry: string;
  rateLimitFeature: string;
  concurrentProcessing: string;
  historyRecords: string;
  streamingResponse: string;
  performanceMonitoring: string;

  // Chat
  startChat: string;
  startChatDesc: string;
  feature1: string;
  feature2: string;
  feature3: string;
  feature4: string;
  you: string;
  aiAssistant: string;
  generatingQuestion: string;
  highPriority: string;
  queuePosition: string;
  queuePositionText: string;
  waitingInQueue: string;
  generatingResponse: string;
  generatingQuestionActive: string;
  generationFailed: string;
  waitingMessage: string;
  processingPercent: string;
  send: string;
  refresh: string;
  messageQueueInfo: string;
  priority: string;
  priorityText: string;
  aiGenerateQuestion: string;
  aiGenerateQuestionDesc: string;
  inputPlaceholder: string;
  enterToSend: string;

  // Status
  statusWaiting: string;
  statusProcessing: string;
  statusCompleted: string;
  statusFailed: string;
  queueAhead: string;
  tasks: string;
}

const translations: Record<Language, Translations> = {
  zh: {
    title: "Demo6: AI 对话队列系统",
    subtitle: "基于 Bun.js + BullMQ + Redis + Ollama 的企业级队列式 AI 对话平台",
    queueStats: "实时队列统计",
    waiting: "等待",
    processing: "处理",
    completed: "完成",
    failed: "失败",
    connected: "已连接",
    queueServerDisconnected: "队列服务器未连接",
    techStack: "技术栈",
    features: "功能",
    technology: "技术构成",
    architecture: "架构设计",
    coreFeatures: "核心功能",
    bunjs: "Bun.js",
    bunjsDesc: "高性能 JavaScript 运行时，原生支持 TypeScript、WebSocket、SSE，启动速度比 Node.js 快 4x",
    bullmq: "BullMQ",
    bullmqDesc: "基于 Redis 的现代队列系统，支持优先级、延迟、重试、速率限制",
    redis: "Redis",
    redisDesc: "内存数据库，作为队列后端，提供持久化和高可用性",
    ollama: "Ollama",
    ollamaDesc: "本地大语言模型服务，使用 qwen3:latest 模型，支持流式生成",
    sse: "SSE",
    sseDesc: "Server-Sent Events 实现实时状态推送，无需 WebSocket，自动重连",
    queueService: "队列服务 (Port 3001)",
    queueServiceDesc: "独立的 Bun 服务器，处理任务入队、状态查询、SSE 推送",
    redisService: "Redis (Port 6379)",
    redisServiceDesc: "存储队列数据、任务状态、支持持久化",
    ollamaService: "Ollama (Port 11434)",
    ollamaServiceDesc: "本地 LLM 服务，Worker 进程异步调用生成响应",
    performanceMetrics: "性能指标",
    avgResponseTime: "平均响应时间",
    totalRequests: "总请求数",
    successRate: "成功率",
    throughput: "吞吐量",
    taskHistory: "任务历史",
    queueSettings: "队列设置",
    taskPriority: "任务优先级",
    priorityLow: "低 (1)",
    priorityMedium: "中 (5)",
    priorityHigh: "高 (10)",
    concurrency: "并发处理数",
    maxRetries: "最大重试次数",
    rateLimit: "速率限制",
    startChat: "开始 AI 对话",
    startChatDesc: "输入你的问题，消息将进入队列系统，实时显示处理状态和进度",
    feature1: "✨ 支持优先级队列管理",
    feature2: "⚡ 实时进度追踪",
    feature3: "🔄 自动重试机制",
    feature4: "📊 性能监控",
    you: "你",
    aiAssistant: "AI 助手",
    generatingQuestion: "生成问题中",
    highPriority: "高优先级",
    queuePosition: "队列",
    queuePositionText: "前{count}个",
    waitingInQueue: "队列中，前面还有 {count} 个任务...",
    generatingResponse: "正在生成响应...",
    generatingQuestionActive: "正在生成问题...",
    generationFailed: "生成失败",
    waitingMessage: "等待队列处理...",
    processingPercent: "处理中: {percent}%",
    send: "发送",
    refresh: "刷新",
    messageQueueInfo: "消息将进入队列，支持并发处理，实时显示进度",
    priority: "优先级",
    priorityText: "{level}",
    aiGenerateQuestion: "AI 生成问题",
    aiGenerateQuestionDesc: "点击生成随机问题，涵盖技术、商业、创意等主题",
    inputPlaceholder: "输入你的问题... (按 Enter 发送，Shift+Enter 换行)",
    enterToSend: "按 Enter 发送，Shift+Enter 换行",
    statusWaiting: "队列中",
    statusProcessing: "生成中",
    statusCompleted: "完成",
    statusFailed: "失败",
    queueAhead: "队列中，前面还有",
    tasks: "个任务...",
    noHistory: "暂无历史记录",
    taskHistoryRecords: "任务历史记录（最近 50 条）",
    taskQueueManagement: "任务队列管理（等待/处理/完成）",
    realTimeProgress: "实时进度追踪（0-100%）",
    priorityQueue: "优先级队列（高/中/低）",
    autoRetry: "自动重试机制（失败自动重试 3 次）",
    rateLimitFeature: "速率限制（防止 API 过载）",
    concurrentProcessing: "并发处理（同时处理 3 个任务）",
    historyRecords: "任务历史记录（最近 50 条）",
    streamingResponse: "流式响应（SSE 实时推送）",
    performanceMonitoring: "性能监控（响应时间、成功率）",
  },
  en: {
    title: "Demo6: AI Chat Queue System",
    subtitle: "Enterprise-grade queue-based AI chat platform built with Bun.js + BullMQ + Redis + Ollama",
    queueStats: "Real-time Queue Stats",
    waiting: "Waiting",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
    connected: "Connected",
    queueServerDisconnected: "Queue Server Disconnected",
    techStack: "Tech Stack",
    features: "Features",
    technology: "Technology",
    architecture: "Architecture",
    coreFeatures: "Core Features",
    bunjs: "Bun.js",
    bunjsDesc: "High-performance JavaScript runtime with native TypeScript, WebSocket, SSE support, 4x faster startup than Node.js",
    bullmq: "BullMQ",
    bullmqDesc: "Modern queue system based on Redis, supports priority, delay, retry, rate limiting",
    redis: "Redis",
    redisDesc: "In-memory database serving as queue backend, provides persistence and high availability",
    ollama: "Ollama",
    ollamaDesc: "Local large language model service using qwen3:latest model, supports streaming generation",
    sse: "SSE",
    sseDesc: "Server-Sent Events for real-time status push, no WebSocket needed, auto-reconnect",
    queueService: "Queue Service (Port 3001)",
    queueServiceDesc: "Standalone Bun server handling task queuing, status queries, SSE push",
    redisService: "Redis (Port 6379)",
    redisServiceDesc: "Stores queue data, task status, supports persistence",
    ollamaService: "Ollama (Port 11434)",
    ollamaServiceDesc: "Local LLM service, Worker processes asynchronously call to generate responses",
    performanceMetrics: "Performance Metrics",
    avgResponseTime: "Avg Response Time",
    totalRequests: "Total Requests",
    successRate: "Success Rate",
    throughput: "Throughput",
    taskHistory: "Task History",
    queueSettings: "Queue Settings",
    taskPriority: "Task Priority",
    priorityLow: "Low (1)",
    priorityMedium: "Medium (5)",
    priorityHigh: "High (10)",
    concurrency: "Concurrency",
    maxRetries: "Max Retries",
    rateLimit: "Rate Limit",
    startChat: "Start AI Chat",
    startChatDesc: "Enter your question, messages will enter the queue system with real-time status and progress",
    feature1: "✨ Priority queue management",
    feature2: "⚡ Real-time progress tracking",
    feature3: "🔄 Auto retry mechanism",
    feature4: "📊 Performance monitoring",
    you: "You",
    aiAssistant: "AI Assistant",
    generatingQuestion: "Generating Question",
    highPriority: "High Priority",
    queuePosition: "Queue",
    queuePositionText: "{count} ahead",
    waitingInQueue: "⏳ In queue, {count} tasks ahead...",
    generatingResponse: "⚙️ Generating response...",
    generatingQuestionActive: "⚙️ Generating question...",
    generationFailed: "❌ Generation failed",
    waitingMessage: "⏳ Waiting for queue processing...",
    processingPercent: "Processing: {percent}%",
    send: "Send",
    refresh: "Refresh",
    messageQueueInfo: "Messages will enter queue, support concurrent processing, real-time progress display",
    priority: "Priority",
    priorityText: "{level}",
    aiGenerateQuestion: "AI Generate Question",
    aiGenerateQuestionDesc: "Click to generate random questions covering tech, business, creative topics",
    inputPlaceholder: "Enter your question... (Press Enter to send, Shift+Enter for new line)",
    enterToSend: "Press Enter to send, Shift+Enter for new line",
    statusWaiting: "In Queue",
    statusProcessing: "Processing",
    statusCompleted: "Completed",
    statusFailed: "Failed",
    queueAhead: "In queue,",
    tasks: "tasks ahead...",
    noHistory: "No history records",
    taskHistoryRecords: "Task History (Last 50)",
    taskQueueManagement: "Task queue management (Waiting/Processing/Completed)",
    realTimeProgress: "Real-time progress tracking (0-100%)",
    priorityQueue: "Priority queue (High/Medium/Low)",
    autoRetry: "Auto retry mechanism (3 retries on failure)",
    rateLimitFeature: "Rate limiting (prevent API overload)",
    concurrentProcessing: "Concurrent processing (3 tasks simultaneously)",
    historyRecords: "Task History (Last 50)",
    streamingResponse: "Streaming response (SSE real-time push)",
    performanceMonitoring: "Performance monitoring (response time, success rate)",
  },
};

export function useTranslations(lang: Language) {
  const t = translations[lang];
  
  return {
    t,
    lang,
    // Helper function to format strings with placeholders
    format: (key: keyof Translations, params?: Record<string, string | number>) => {
      let text = t[key];
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          text = text.replace(`{${key}}`, String(value));
        });
      }
      return text;
    },
  };
}

