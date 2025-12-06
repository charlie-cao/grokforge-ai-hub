/**
 * Internationalization (i18n) for Demo7
 * Scheduled Tasks with AI Chat
 */

export type Language = "zh" | "en";

export interface Demo7Translations {
  // Header
  title: string;
  subtitle: string;
  
  // Status
  schedulerStatus: string;
  schedulerRunning: string;
  schedulerStopped: string;
  interval: string;
  lastExecution: string;
  nextExecution: string;
  
  // Table
  prompt: string;
  response: string;
  model: string;
  status: string;
  createdAt: string;
  errorMessage: string;
  noRecords: string;
  loading: string;
  
  // Status values
  statusSuccess: string;
  statusError: string;
  
  // Actions
  refresh: string;
  autoRefresh: string;
  sortByTime: string;
  sortNewest: string;
  sortOldest: string;
  
  // Info
  info: string;
  infoDescription: string;
  infoFeatures: string;
  feature1: string;
  feature2: string;
  feature3: string;
  
  // Stats
  totalRecords: string;
  successCount: string;
  errorCount: string;
}

const translations: Record<Language, Demo7Translations> = {
  zh: {
    title: "Demo7: 定时任务 AI 对话",
    subtitle: "服务启动后自动每分钟执行 AI 对话任务，并记录聊天历史",
    
    schedulerStatus: "调度器状态",
    schedulerRunning: "运行中",
    schedulerStopped: "已停止",
    interval: "执行间隔：每分钟",
    lastExecution: "上次执行",
    nextExecution: "下次执行",
    
    prompt: "提示词",
    response: "AI 回复",
    model: "模型",
    status: "状态",
    createdAt: "创建时间",
    errorMessage: "错误信息",
    noRecords: "暂无记录",
    loading: "加载中...",
    
    statusSuccess: "成功",
    statusError: "错误",
    
    refresh: "刷新",
    autoRefresh: "自动刷新",
    sortByTime: "按时间排序",
    sortNewest: "最新在前",
    sortOldest: "最旧在前",
    
    info: "关于",
    infoDescription: "Demo7 演示了如何使用 Bun 定时器创建自动执行的 AI 对话任务。服务启动后会立即执行一次，然后每分钟自动执行一次。",
    infoFeatures: "特性：",
    feature1: "使用 Bun 原生定时器（setInterval）",
    feature2: "调用 Ollama AI 模型生成回复",
    feature3: "使用 Bun SQLite 存储聊天记录",
    
    totalRecords: "总记录数",
    successCount: "成功",
    errorCount: "失败",
  },
  en: {
    title: "Demo7: Scheduled AI Chat Tasks",
    subtitle: "Automatically executes AI chat tasks every minute after server starts, and stores chat history",
    
    schedulerStatus: "Scheduler Status",
    schedulerRunning: "Running",
    schedulerStopped: "Stopped",
    interval: "Interval: Every minute",
    lastExecution: "Last Execution",
    nextExecution: "Next Execution",
    
    prompt: "Prompt",
    response: "AI Response",
    model: "Model",
    status: "Status",
    createdAt: "Created At",
    errorMessage: "Error Message",
    noRecords: "No records yet",
    loading: "Loading...",
    
    statusSuccess: "Success",
    statusError: "Error",
    
    refresh: "Refresh",
    autoRefresh: "Auto Refresh",
    sortByTime: "Sort by Time",
    sortNewest: "Newest First",
    sortOldest: "Oldest First",
    
    info: "About",
    infoDescription: "Demo7 demonstrates how to use Bun's native timer to create automatically executed AI chat tasks. It executes immediately when the server starts, then automatically executes every minute.",
    infoFeatures: "Features:",
    feature1: "Uses Bun's native timer (setInterval)",
    feature2: "Calls Ollama AI model to generate responses",
    feature3: "Uses Bun SQLite to store chat history",
    
    totalRecords: "Total Records",
    successCount: "Success",
    errorCount: "Error",
  },
};

export function useDemo7Translations(language: Language): Demo7Translations {
  return translations[language];
}

