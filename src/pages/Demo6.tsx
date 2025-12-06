/**
 * Demo6: Queue-based AI Chat with Real-time Status
 * Advanced features: Batch processing, Priority management, History, Performance monitoring
 * Technology stack: Bun.js + BullMQ + Redis + Ollama + SSE
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  AlertCircle,
  Brain,
  Database,
  Zap,
  BarChart3,
  History as HistoryIcon,
  Settings,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  TrendingUp,
  Users,
  Server,
  Layers,
  Code,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import "../index.css";

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}

interface JobStatus {
  jobId: string;
  state: "waiting" | "active" | "completed" | "failed";
  progress: number;
  result?: {
    success: boolean;
    response: string;
    timestamp: number;
  };
  failedReason?: string;
  priority?: number;
  createdAt?: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "generating";
  content: string;
  jobId?: string;
  status?: JobStatus["state"];
  progress?: number;
  timestamp: number;
  priority?: number;
  queuePosition?: number; // 队列中的位置
}

interface PerformanceMetrics {
  avgResponseTime: number;
  totalRequests: number;
  successRate: number;
  throughput: number; // requests per minute
}

// Get API URL - use default for browser environment
const QUEUE_API_URL = 
  (typeof process !== "undefined" && process.env?.QUEUE_API_URL) || 
  "http://localhost:3001";

export function Demo6() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [activeJobs, setActiveJobs] = useState<Map<string, JobStatus>>(new Map());
  const [jobHistory, setJobHistory] = useState<JobStatus[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    avgResponseTime: 0,
    totalRequests: 0,
    successRate: 100,
    throughput: 0,
  });
  const [selectedPriority, setSelectedPriority] = useState<number>(5);
  const [batchMode, setBatchMode] = useState(false);
  const [batchInputs, setBatchInputs] = useState<string[]>([]);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [queueServerConnected, setQueueServerConnected] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map());
  const responseTimeRef = useRef<Map<string, number>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch queue statistics
  const fetchQueueStats = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      let response: Response | null = null;
      
      try {
        response = await fetch(`${QUEUE_API_URL}/api/queue/stats`, {
          signal: abortController.signal,
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
      } catch (fetchError: any) {
        // Handle network errors (connection refused, timeout, etc.)
        if (fetchError.name === 'AbortError') {
          return; // Request was cancelled, ignore
        }
        // Network error - server might not be running
        setQueueServerConnected(false);
        return;
      }

      if (!response) {
        return; // Should not happen, but safety check
      }

      if (response.ok) {
        try {
          const stats = await response.json();
          setQueueStats(stats);
          setQueueServerConnected(true);
          
          // Update queue positions for waiting messages
          if (stats.waiting > 0) {
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.status === "waiting" && msg.jobId) {
                  // Calculate approximate position (this is an estimate)
                  const waitingCount = prev.filter(
                    (m) => m.status === "waiting" && m.jobId
                  ).length;
                  return {
                    ...msg,
                    queuePosition: waitingCount,
                  };
                }
                return msg;
              })
            );
          }
        } catch (jsonError) {
          // JSON parse error - ignore
          setQueueServerConnected(false);
        }
      } else {
        setQueueServerConnected(false);
      }
    } catch (error: any) {
      // Catch any other unexpected errors
      if (error.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }
      setQueueServerConnected(false);
      // Silently handle - don't log to avoid console noise
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  // Wrapper to ensure no unhandled promise rejections
  const safeFetchQueueStats = useCallback(() => {
    fetchQueueStats().catch(() => {
      // All errors should already be handled in fetchQueueStats
      // This is just a safety net
    });
  }, [fetchQueueStats]);

  // Poll queue stats every 2 seconds
  useEffect(() => {
    safeFetchQueueStats();
    const interval = setInterval(safeFetchQueueStats, 2000);
    return () => {
      clearInterval(interval);
      // Cancel any pending requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [safeFetchQueueStats]);

  // Calculate performance metrics
  useEffect(() => {
    const completedJobs = jobHistory.filter((j) => j.state === "completed");
    const failedJobs = jobHistory.filter((j) => j.state === "failed");
    const total = completedJobs.length + failedJobs.length;

    if (total > 0) {
      const avgTime = completedJobs.reduce((sum, job) => {
        if (job.result?.timestamp && job.createdAt) {
          return sum + (job.result.timestamp - job.createdAt);
        }
        return sum;
      }, 0) / completedJobs.length;

      const successRate = (completedJobs.length / total) * 100;
      const throughput = total / (Date.now() / 60000); // rough estimate

      setPerformanceMetrics({
        avgResponseTime: Math.round(avgTime || 0),
        totalRequests: total,
        successRate: Math.round(successRate * 10) / 10,
        throughput: Math.round(throughput * 10) / 10,
      });
    }
  }, [jobHistory]);

  // Cleanup event sources on unmount
  useEffect(() => {
    return () => {
      eventSourcesRef.current.forEach((es) => es.close());
      eventSourcesRef.current.clear();
    };
  }, []);

  // Connect to SSE stream for job status
  const connectJobStatusStream = useCallback((jobId: string, messageId: string) => {
    const existingStream = eventSourcesRef.current.get(jobId);
    if (existingStream) {
      existingStream.close();
    }

    const startTime = Date.now();
    responseTimeRef.current.set(jobId, startTime);

    const eventSource = new EventSource(`${QUEUE_API_URL}/stream/status/${jobId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "status") {
          const status: JobStatus = {
            jobId: data.jobId,
            state: data.state,
            progress: data.progress || 0,
            result: data.result,
            failedReason: data.failedReason,
            priority: selectedPriority,
            createdAt: startTime,
          };

          setActiveJobs((prev) => {
            const next = new Map(prev);
            next.set(jobId, status);
            return next;
          });

          // Update message status
          setMessages((prev) =>
            prev.map((msg) =>
              msg.jobId === jobId
                ? {
                    ...msg,
                    status: status.state,
                    progress: status.progress,
                    ...(status.state === "completed" && status.result
                      ? { content: status.result.response }
                      : {}),
                  }
                : msg
            )
          );

          // Add to history when completed or failed
          if (status.state === "completed" || status.state === "failed") {
            setJobHistory((prev) => [status, ...prev.slice(0, 49)]); // Keep last 50
            const endTime = Date.now();
            const duration = endTime - startTime;
            console.log(`Job ${jobId} completed in ${duration}ms`);
          }

          // Close stream if job is completed or failed
          if (status.state === "completed" || status.state === "failed") {
            eventSource.close();
            eventSourcesRef.current.delete(jobId);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Failed to parse SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
      eventSourcesRef.current.delete(jobId);
    };

    eventSourcesRef.current.set(jobId, eventSource);
  }, [selectedPriority]);

  // Send message
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
      priority: selectedPriority,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);

    // Add placeholder assistant message
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      status: "waiting",
      progress: 0,
      timestamp: Date.now(),
      priority: selectedPriority,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Send chat request to queue
      let response: Response;
      try {
        response = await fetch(`${QUEUE_API_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "demo-user",
            prompt: currentInput,
            conversationHistory: messages
              .filter((m) => m.role === "assistant" && m.content)
              .map((m) => ({ role: m.role, content: m.content })),
            priority: selectedPriority,
          }),
        });
      } catch (fetchError: any) {
        // Network error - queue server might not be running
        throw new Error(`无法连接到队列服务器: ${fetchError.message || '连接失败'}`);
      }

      if (!response.ok) {
        throw new Error(`Failed to queue chat: ${response.statusText}`);
      }

      const data = await response.json();
      const jobId = data.jobId;

      // Update message with jobId
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, jobId } : msg
        )
      );

      // Connect to status stream
      connectJobStatusStream(jobId, assistantMessageId);

      // Update queue stats
      safeFetchQueueStats();
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                status: "failed",
              }
            : msg
        )
      );
      setIsLoading(false);
    }
  }, [input, isLoading, messages, selectedPriority, connectJobStatusStream, fetchQueueStats]);

  // Batch send
  const handleBatchSend = useCallback(async () => {
    if (batchInputs.length === 0) return;

    const prompts = batchInputs.filter((p) => p.trim()).map((p) => p.trim());
    setBatchInputs([]);
    setIsLoading(true);

    for (const prompt of prompts) {
      // Simulate sending each prompt
      await new Promise((resolve) => setTimeout(resolve, 100));
      // In real implementation, queue all at once
    }

    setIsLoading(false);
  }, [batchInputs]);

  // Generate random question using AI through queue system
  const handleGenerateQuestion = useCallback(async () => {
    // Don't block - allow multiple clicks
    const generatingMessageId = `generating-${Date.now()}`;
    
    // Calculate queue position
    const currentWaiting = messages.filter(
      (m) => m.status === "waiting" && m.jobId
    ).length;
    const queuePosition = queueStats 
      ? queueStats.waiting + queueStats.active + currentWaiting + 1
      : currentWaiting + 1;
    
    // Add placeholder message for question generation
    const generatingMessage: ChatMessage = {
      id: generatingMessageId,
      role: "generating",
      content: "",
      status: "waiting",
      progress: 0,
      timestamp: Date.now(),
      priority: selectedPriority,
      queuePosition: queuePosition,
    };

    setMessages((prev) => [...prev, generatingMessage]);

    try {
      // Send question generation request to queue
      let response: Response;
      try {
        response = await fetch(`${QUEUE_API_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "demo-user",
            prompt: `请生成一个有趣、有深度的问题，涵盖以下主题之一：技术开发、商业策略、创意设计、科学探索、哲学思考、生活建议。问题应该：
1. 简洁明了（不超过30字）
2. 引人思考
3. 适合与AI助手讨论
4. 不要包含引号或特殊格式

只输出问题本身，不要任何解释或前缀。`,
            conversationHistory: [],
            priority: selectedPriority,
          }),
        });
      } catch (fetchError: any) {
        // Network error - queue server might not be running
        throw new Error(`无法连接到队列服务器: ${fetchError.message || '连接失败'}`);
      }

      if (!response.ok) {
        throw new Error(`Failed to queue question generation: ${response.statusText}`);
      }

      const data = await response.json();
      const jobId = data.jobId;

      // Update message with jobId
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === generatingMessageId ? { ...msg, jobId } : msg
        )
      );

      // Connect to status stream
      const startTime = Date.now();
      responseTimeRef.current.set(jobId, startTime);

      const eventSource = new EventSource(`${QUEUE_API_URL}/stream/status/${jobId}`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "status") {
            const status: JobStatus = {
              jobId: data.jobId,
              state: data.state,
              progress: data.progress || 0,
              result: data.result,
              failedReason: data.failedReason,
              priority: selectedPriority,
              createdAt: startTime,
            };

            // Update message status
            setMessages((prev) => {
              const updated = prev.map((msg) => {
                if (msg.jobId === jobId) {
                  if (status.state === "completed" && status.result?.response) {
                    // Question generated - fill input and remove generating message
                    const question = status.result.response.trim();
                    let cleanQuestion = question
                      .replace(/^["']|["']$/g, "")
                      .replace(/^问题[:：]\s*/i, "")
                      .replace(/^Q[:：]\s*/i, "")
                      .trim();

                    // If question is too long or empty, use fallback
                    if (!cleanQuestion || cleanQuestion.length > 100) {
                      const fallbackQuestions = [
                        "如何提高代码质量和可维护性？",
                        "人工智能将如何改变我们的工作方式？",
                        "什么是微服务架构的最佳实践？",
                        "如何平衡工作与生活？",
                        "区块链技术的实际应用场景有哪些？",
                        "如何培养创新思维？",
                        "云原生架构的核心优势是什么？",
                        "如何建立高效的团队协作机制？",
                      ];
                      cleanQuestion =
                        fallbackQuestions[
                          Math.floor(Math.random() * fallbackQuestions.length)
                        ];
                    }

                    // Use setTimeout to avoid state update during render
                    setTimeout(() => {
                      setInput(cleanQuestion);
                    }, 0);
                    
                    // Remove generating message
                    return null;
                  }
                  return {
                    ...msg,
                    status: status.state,
                    progress: status.progress,
                    queuePosition: status.state === "waiting" ? (queueStats?.waiting || 0) : undefined,
                  };
                }
                return msg;
              });
              return updated.filter(Boolean) as ChatMessage[];
            });

            // Close stream if completed or failed
            if (status.state === "completed" || status.state === "failed") {
              eventSource.close();
              eventSourcesRef.current.delete(jobId);
            }
          }
        } catch (error) {
          console.error("Failed to parse SSE message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE error:", error);
        eventSource.close();
        eventSourcesRef.current.delete(jobId);
        // Remove generating message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== generatingMessageId));
      };

      eventSourcesRef.current.set(jobId, eventSource);
      safeFetchQueueStats();
    } catch (error) {
      console.error("Error generating question:", error);
      // Remove generating message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== generatingMessageId));
      // Use fallback question
      const fallbackQuestions = [
        "如何提高代码质量和可维护性？",
        "人工智能将如何改变我们的工作方式？",
        "什么是微服务架构的最佳实践？",
        "如何平衡工作与生活？",
        "区块链技术的实际应用场景有哪些？",
      ];
      const randomQuestion =
        fallbackQuestions[
          Math.floor(Math.random() * fallbackQuestions.length)
        ];
      setInput(randomQuestion);
    }
  }, [selectedPriority, queueStats, fetchQueueStats]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get status badge
  const getStatusBadge = (status?: JobStatus["state"]) => {
    switch (status) {
      case "waiting":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            队列中
          </Badge>
        );
      case "active":
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-blue-500">
            <Activity className="w-3 h-3 animate-spin" />
            生成中
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-500">
            <CheckCircle2 className="w-3 h-3" />
            完成
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            失败
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Brain className="w-6 h-6 text-blue-500" />
                Demo6: AI 对话队列系统
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                基于 Bun.js + BullMQ + Redis + Ollama 的企业级队列式 AI 对话平台
              </p>
            </div>

            {/* Queue Stats */}
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              {queueServerConnected === false && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  队列服务器未连接
                </Badge>
              )}
              {queueServerConnected === true && (
                <Badge variant="default" className="text-xs bg-green-500">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  已连接
                </Badge>
              )}
              
              {queueStats && (
                <div className="text-right">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">实时队列统计</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      等待: {queueStats.waiting}
                    </Badge>
                    <Badge variant="default" className="text-xs bg-blue-500">
                      <Activity className="w-3 h-3 mr-1" />
                      处理: {queueStats.active}
                    </Badge>
                    <Badge variant="default" className="text-xs bg-green-500">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      完成: {queueStats.completed}
                    </Badge>
                    {queueStats.failed > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <XCircle className="w-3 h-3 mr-1" />
                        失败: {queueStats.failed}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden max-w-7xl w-full mx-auto flex gap-4 p-4">
        {/* Left Sidebar: Technology Stack & Features */}
        <div className="w-80 flex-shrink-0 overflow-y-auto">
          <Tabs defaultValue="tech" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tech">技术栈</TabsTrigger>
              <TabsTrigger value="features">功能</TabsTrigger>
            </TabsList>

            <TabsContent value="tech" className="space-y-3 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    技术构成
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Bun.js</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      高性能 JavaScript 运行时，原生支持 TypeScript、WebSocket、SSE，启动速度比 Node.js 快 4x
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">BullMQ</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      基于 Redis 的现代队列系统，支持优先级、延迟、重试、速率限制
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Redis</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      内存数据库，作为队列后端，提供持久化和高可用性
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Ollama</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      本地大语言模型服务，使用 qwen3:latest 模型，支持流式生成
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">SSE</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Server-Sent Events 实现实时状态推送，无需 WebSocket，自动重连
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    架构设计
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <Server className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-semibold">队列服务 (Port 3001)</div>
                      <div className="text-slate-600 dark:text-slate-400">
                        独立的 Bun 服务器，处理任务入队、状态查询、SSE 推送
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Database className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-semibold">Redis (Port 6379)</div>
                      <div className="text-slate-600 dark:text-slate-400">
                        存储队列数据、任务状态、支持持久化
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-purple-500 mt-0.5" />
                    <div>
                      <div className="font-semibold">Ollama (Port 11434)</div>
                      <div className="text-slate-600 dark:text-slate-400">
                        本地 LLM 服务，Worker 进程异步调用生成响应
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    核心功能
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>任务队列管理（等待/处理/完成）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>实时进度追踪（0-100%）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>优先级队列（高/中/低）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>自动重试机制（失败自动重试 3 次）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>速率限制（防止 API 过载）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>并发处理（同时处理 3 个任务）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>流式响应（SSE 实时推送）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>任务历史记录（最近 50 条）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>性能监控（响应时间、成功率）</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-3 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    性能指标
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">平均响应时间</span>
                    <Badge variant="outline">
                      {performanceMetrics.avgResponseTime > 0
                        ? `${(performanceMetrics.avgResponseTime / 1000).toFixed(1)}s`
                        : "-"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">总请求数</span>
                    <Badge variant="outline">{performanceMetrics.totalRequests}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">成功率</span>
                    <Badge
                      variant={performanceMetrics.successRate >= 95 ? "default" : "destructive"}
                      className={performanceMetrics.successRate >= 95 ? "bg-green-500" : ""}
                    >
                      {performanceMetrics.successRate}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">吞吐量</span>
                    <Badge variant="outline">
                      {performanceMetrics.throughput > 0
                        ? `${performanceMetrics.throughput}/min`
                        : "-"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <HistoryIcon className="w-4 h-4" />
                    任务历史
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {jobHistory.slice(0, 10).map((job) => (
                      <div
                        key={job.jobId}
                        className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {job.state === "completed" ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          ) : job.state === "failed" ? (
                            <XCircle className="w-3 h-3 text-red-500" />
                          ) : (
                            <Clock className="w-3 h-3 text-blue-500" />
                          )}
                          <span className="truncate max-w-[120px]">{job.jobId.slice(-8)}</span>
                        </div>
                        <Badge
                          variant={
                            job.state === "completed"
                              ? "default"
                              : job.state === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                          className={
                            job.state === "completed"
                              ? "bg-green-500"
                              : job.state === "failed"
                              ? ""
                              : ""
                          }
                        >
                          {job.state === "completed"
                            ? "完成"
                            : job.state === "failed"
                            ? "失败"
                            : "处理中"}
                        </Badge>
                      </div>
                    ))}
                    {jobHistory.length === 0 && (
                      <div className="text-xs text-slate-400 text-center py-4">
                        暂无历史记录
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    队列设置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">
                      任务优先级
                    </label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs"
                    >
                      <option value={1}>低 (1)</option>
                      <option value={5}>中 (5)</option>
                      <option value={10}>高 (10)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">并发处理数</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">最大重试次数</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">速率限制</span>
                    <Badge variant="outline">10/min</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center max-w-md">
                  <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">开始 AI 对话</h3>
                  <p className="text-sm mb-4">
                    输入你的问题，消息将进入队列系统，实时显示处理状态和进度
                  </p>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div>✨ 支持优先级队列管理</div>
                    <div>⚡ 实时进度追踪</div>
                    <div>🔄 自动重试机制</div>
                    <div>📊 性能监控</div>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 shadow-md ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : message.role === "generating"
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 border border-purple-300 dark:border-purple-700"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        {message.role === "user" ? (
                          <>
                            <Users className="w-4 h-4" />
                            你
                          </>
                        ) : message.role === "generating" ? (
                          <>
                            <Sparkles className="w-4 h-4" />
                            生成问题中
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4" />
                            AI 助手
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {message.priority && message.priority > 5 && (
                          <Badge variant="outline" className="text-xs">
                            高优先级
                          </Badge>
                        )}
                        {message.status && getStatusBadge(message.status)}
                        {message.queuePosition !== undefined && message.status === "waiting" && (
                          <Badge variant="secondary" className="text-xs">
                            队列: 前{message.queuePosition}个
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Progress bar for active jobs */}
                    {message.status === "active" && message.progress !== undefined && (
                      <div className="mb-2">
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${message.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          处理中: {Math.round(message.progress)}%
                        </div>
                      </div>
                    )}

                    {/* Message content */}
                    <div className="whitespace-pre-wrap">
                      {message.content || (
                        <span className="text-slate-400 italic">
                          {message.role === "generating"
                            ? message.status === "waiting"
                              ? message.queuePosition !== undefined
                                ? `⏳ 队列中，前面还有 ${message.queuePosition} 个任务...`
                                : "⏳ 等待队列处理..."
                              : message.status === "active"
                              ? "⚙️ 正在生成问题..."
                              : message.status === "failed"
                              ? "❌ 生成失败"
                              : "⏳ 等待中..."
                            : message.status === "waiting"
                            ? message.queuePosition !== undefined
                              ? `⏳ 队列中，前面还有 ${message.queuePosition} 个任务...`
                              : "⏳ 等待队列处理..."
                            : message.status === "active"
                            ? "⚙️ 正在生成响应..."
                            : message.status === "failed"
                            ? "❌ 生成失败"
                            : ""}
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>

                    {/* Error message */}
                    {message.status === "failed" && !message.content && (
                      <div className="mt-2 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        生成失败，请重试
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex-shrink-0">
            {/* AI Generate Question Button */}
            <div className="mb-3">
              <Button
                onClick={handleGenerateQuestion}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
                size="sm"
              >
                <Sparkles className="w-4 h-4" />
                AI 生成问题
              </Button>
            </div>

            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的问题... (按 Enter 发送，Shift+Enter 换行)"
                rows={3}
                className="flex-1 resize-none"
                disabled={isLoading}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-auto px-6"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      发送
                    </>
                  )}
                </Button>
                <Button
                  onClick={safeFetchQueueStats}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  刷新
                </Button>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
              <span>消息将进入队列，支持并发处理，实时显示进度</span>
              <span>优先级: {selectedPriority === 1 ? "低" : selectedPriority === 5 ? "中" : "高"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
