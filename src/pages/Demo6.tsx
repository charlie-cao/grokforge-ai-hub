/**
 * Demo6: Queue-based AI Chat with Real-time Status
 * Advanced features: Batch processing, Priority management, History, Performance monitoring
 * Technology stack: Bun.js + BullMQ + Redis + Ollama + SSE
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations, type Language } from "@/lib/i18n";
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
  Languages,
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
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("demo6-language");
    return (saved === "en" ? "en" : "zh") as Language;
  });
  const { t, format } = useTranslations(language);

  const toggleLanguage = useCallback(() => {
    const newLang = language === "zh" ? "en" : "zh";
    setLanguage(newLang);
    localStorage.setItem("demo6-language", newLang);
  }, [language]);

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
  const consecutiveFailuresRef = useRef<number>(0);
  const pollIntervalRef = useRef<number | null>(null);

  // Suppress unhandled promise rejections for AbortError and fetch errors
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      // Suppress AbortError (user aborted requests)
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        event.preventDefault(); // Suppress the error
        return;
      }
      
      // Suppress fetch-related errors
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message || '');
        if (
          message.includes('fetch') || 
          message.includes('Failed to fetch') || 
          message.includes('queue') ||
          message.includes('aborted') ||
          message.includes('AbortError')
        ) {
          event.preventDefault(); // Suppress the error
          return;
        }
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch queue statistics
  const fetchQueueStats = useCallback(async () => {
    // If we've had too many consecutive failures, stop polling frequently
    if (consecutiveFailuresRef.current > 5) {
      return; // Stop polling if server is clearly not available
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {
        // Ignore abort errors - controller might already be aborted
      }
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      let response: Response | null = null;
      
      try {
        response = await fetch(`${QUEUE_API_URL}/api/queue/stats`, {
          signal: abortController.signal,
          // Remove Cache-Control header to avoid CORS issues
        }).catch((fetchError: any) => {
          // Handle network errors (connection refused, timeout, etc.)
          if (fetchError.name === 'AbortError') {
            return null; // Request was cancelled
          }
          // Return null for any network error - we'll handle it below
          return null;
        });
      } catch (fetchError: any) {
        // This catch should rarely be hit due to .catch() above
        if (fetchError.name === 'AbortError') {
          return; // Request was cancelled, ignore silently
        }
        // Network error - server might not be running
        consecutiveFailuresRef.current++;
        setQueueServerConnected(false);
        return; // Exit silently, no error thrown
      }

      // Handle case where fetch returned null (network error)
      if (!response) {
        consecutiveFailuresRef.current++;
        setQueueServerConnected(false);
        return; // Exit silently
      }

      if (!response) {
        return; // Should not happen, but safety check
      }

      if (response.ok) {
        try {
          const stats = await response.json();
          setQueueStats(stats);
          setQueueServerConnected(true);
          consecutiveFailuresRef.current = 0; // Reset failure counter on success
          
        // Update queue positions for waiting messages
        setMessages((prev) => {
          const waitingMessages = prev.filter(
            (m) => m.status === "waiting" && m.jobId
          );
          
          if (waitingMessages.length > 0) {
            // Calculate queue position based on actual queue stats
            return prev.map((msg) => {
              if (msg.status === "waiting" && msg.jobId) {
                // Find position in waiting list (by timestamp)
                const waitingList = waitingMessages
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .map((m, idx) => ({ ...m, index: idx }));
                
                const msgInList = waitingList.find((m) => m.id === msg.id);
                const positionInWaiting = msgInList ? msgInList.index + 1 : waitingList.length;
                
                // Total position = active jobs + position in waiting list
                const totalPosition = (stats.active || 0) + positionInWaiting;
                
                return {
                  ...msg,
                  queuePosition: totalPosition,
                };
              }
              return msg;
            });
          }
          return prev;
        });
        } catch (jsonError) {
          // JSON parse error - ignore silently
          consecutiveFailuresRef.current++;
          setQueueServerConnected(false);
        }
      } else {
        consecutiveFailuresRef.current++;
        setQueueServerConnected(false);
      }
    } catch (error: any) {
      // Catch any other unexpected errors
      if (error.name === 'AbortError') {
        return; // Request was cancelled, ignore silently
      }
      consecutiveFailuresRef.current++;
      setQueueServerConnected(false);
      // Silently handle - don't log, don't throw
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  // Wrapper to ensure no unhandled promise rejections
  const safeFetchQueueStats = useCallback(() => {
    // Use void to explicitly ignore the promise
    void fetchQueueStats().catch(() => {
      // All errors should already be handled in fetchQueueStats
      // This is just a safety net - silently ignore
    });
  }, [fetchQueueStats]);

  // Poll queue stats with adaptive interval
  useEffect(() => {
    const poll = () => {
      safeFetchQueueStats();
      
      // Adaptive polling: if server is not connected, poll less frequently
      const interval = consecutiveFailuresRef.current > 5 ? 10000 : 2000; // 10s if many failures, 2s otherwise
      
      if (pollIntervalRef.current) {
        clearTimeout(pollIntervalRef.current);
      }
      
      pollIntervalRef.current = window.setTimeout(poll, interval);
    };

    // Initial poll
    poll();

    return () => {
      if (pollIntervalRef.current) {
        clearTimeout(pollIntervalRef.current);
      }
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

          // Update message status and queue position
          setMessages((prev) => {
            // Calculate queue position for all waiting messages
            const allWaiting = prev.filter(
              (m) => m.status === "waiting" && m.jobId
            );
            const waitingList = allWaiting.sort((a, b) => a.timestamp - b.timestamp);
            
            return prev.map((msg) => {
              if (msg.jobId === jobId) {
                // Calculate queue position for waiting messages
                let queuePosition: number | undefined = undefined;
                if (status.state === "waiting") {
                  const positionInWaiting = waitingList.findIndex((m) => m.jobId === jobId) + 1;
                  queuePosition = (queueStats?.active || 0) + positionInWaiting;
                }
                
                return {
                  ...msg,
                  status: status.state,
                  progress: status.progress,
                  queuePosition,
                  ...(status.state === "completed" && status.result
                    ? { content: status.result.response }
                    : {}),
                };
              } else if (msg.status === "waiting" && msg.jobId) {
                // Update queue position for other waiting messages
                const positionInWaiting = waitingList.findIndex((m) => m.id === msg.id) + 1;
                const queuePosition = (queueStats?.active || 0) + positionInWaiting;
                return {
                  ...msg,
                  queuePosition,
                };
              }
              return msg;
            });
          });

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
      // Silently handle SSE errors - don't log to avoid noise
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
      let response: Response | null = null;
      try {
        response = await fetch(`${QUEUE_API_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "demo-user",
            prompt: language === "zh" 
              ? `请生成一个有趣、有深度的问题，涵盖以下主题之一：技术开发、商业策略、创意设计、科学探索、哲学思考、生活建议。问题应该：
1. 简洁明了（不超过30字）
2. 引人思考
3. 适合与AI助手讨论
4. 不要包含引号或特殊格式

只输出问题本身，不要任何解释或前缀。`
              : `Generate an interesting and thought-provoking question covering one of these topics: technology development, business strategy, creative design, scientific exploration, philosophical thinking, life advice. The question should:
1. Be concise (no more than 30 words)
2. Be thought-provoking
3. Be suitable for discussion with an AI assistant
4. Not include quotes or special formatting

Output only the question itself, no explanations or prefixes.`,
            conversationHistory: [],
            priority: selectedPriority,
          }),
        }).catch((fetchError: any) => {
          // Handle AbortError and network errors
          if (fetchError.name === 'AbortError') {
            return null; // Request was cancelled
          }
          return null; // Network error
        });
      } catch (fetchError: any) {
        // This catch should rarely be hit due to .catch() above
        if (fetchError.name === 'AbortError') {
          // Remove generating message and exit silently
          setMessages((prev) => prev.filter((msg) => msg.id !== generatingMessageId));
          return;
        }
        // Network error - queue server might not be running
        setMessages((prev) => prev.filter((msg) => msg.id !== generatingMessageId));
        // Use fallback question
        const fallbackQuestions = language === "zh" ? [
          "如何提高代码质量和可维护性？",
          "人工智能将如何改变我们的工作方式？",
          "什么是微服务架构的最佳实践？",
          "如何平衡工作与生活？",
          "区块链技术的实际应用场景有哪些？",
        ] : [
          "How to improve code quality and maintainability?",
          "How will AI change our way of working?",
          "What are the best practices for microservices architecture?",
          "How to balance work and life?",
          "What are the practical applications of blockchain technology?",
        ];
        const randomQuestion =
          fallbackQuestions[
            Math.floor(Math.random() * fallbackQuestions.length)
          ] || (language === "zh" ? "如何提高代码质量和可维护性？" : "How to improve code quality and maintainability?");
        setInput(randomQuestion);
        return;
      }

      if (!response || !response.ok) {
        // Remove generating message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== generatingMessageId));
        // Use fallback question
        const fallbackQuestions = language === "zh" ? [
          "如何提高代码质量和可维护性？",
          "人工智能将如何改变我们的工作方式？",
          "什么是微服务架构的最佳实践？",
          "如何平衡工作与生活？",
          "区块链技术的实际应用场景有哪些？",
        ] : [
          "How to improve code quality and maintainability?",
          "How will AI change our way of working?",
          "What are the best practices for microservices architecture?",
          "How to balance work and life?",
          "What are the practical applications of blockchain technology?",
        ];
        const randomQuestion =
          fallbackQuestions[
            Math.floor(Math.random() * fallbackQuestions.length)
          ] || (language === "zh" ? "如何提高代码质量和可维护性？" : "How to improve code quality and maintainability?");
        setInput(randomQuestion);
        return;
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
                      const fallbackQuestions = language === "zh" ? [
                        "如何提高代码质量和可维护性？",
                        "人工智能将如何改变我们的工作方式？",
                        "什么是微服务架构的最佳实践？",
                        "如何平衡工作与生活？",
                        "区块链技术的实际应用场景有哪些？",
                        "如何培养创新思维？",
                        "云原生架构的核心优势是什么？",
                        "如何建立高效的团队协作机制？",
                      ] : [
                        "How to improve code quality and maintainability?",
                        "How will AI change our way of working?",
                        "What are the best practices for microservices architecture?",
                        "How to balance work and life?",
                        "What are the practical applications of blockchain technology?",
                        "How to cultivate innovative thinking?",
                        "What are the core advantages of cloud-native architecture?",
                        "How to establish efficient team collaboration mechanisms?",
                      ];
                      cleanQuestion =
                        fallbackQuestions[
                          Math.floor(Math.random() * fallbackQuestions.length)
                        ] || (language === "zh" ? "如何提高代码质量和可维护性？" : "How to improve code quality and maintainability?");
                    }

                    // Use setTimeout to avoid state update during render
                    setTimeout(() => {
                      setInput(cleanQuestion);
                    }, 0);
                    
                    // Remove generating message
                    return null;
                  }
                  // Calculate queue position for waiting messages
                  let queuePosition: number | undefined = undefined;
                  if (status.state === "waiting") {
                    // Get all waiting messages including this one
                    const allWaiting = prev.filter(
                      (m) => m.status === "waiting" && m.jobId
                    );
                    const waitingList = allWaiting
                      .sort((a, b) => a.timestamp - b.timestamp);
                    const positionInWaiting = waitingList.findIndex((m) => m.jobId === jobId) + 1;
                    queuePosition = (queueStats?.active || 0) + positionInWaiting;
                  }
                  
                  return {
                    ...msg,
                    status: status.state,
                    progress: status.progress,
                    queuePosition,
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
        // Silently handle SSE errors - don't log to avoid noise
        eventSource.close();
        eventSourcesRef.current.delete(jobId);
        // Remove generating message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== generatingMessageId));
      };

      eventSourcesRef.current.set(jobId, eventSource);
      safeFetchQueueStats();
    } catch (error: any) {
      // Silently handle all errors - don't log to avoid noise
      if (error.name === 'AbortError') {
        // Request was cancelled - remove message silently
        setMessages((prev) => prev.filter((msg) => msg.id !== generatingMessageId));
        return;
      }
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
        ] || "如何提高代码质量和可维护性？";
      setInput(randomQuestion);
    }
  }, [selectedPriority, queueStats, safeFetchQueueStats]);

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
            {t.statusWaiting}
          </Badge>
        );
      case "active":
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-blue-500">
            <Activity className="w-3 h-3 animate-spin" />
            {t.statusProcessing}
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-500">
            <CheckCircle2 className="w-3 h-3" />
            {t.statusCompleted}
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            {t.statusFailed}
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
                {t.title}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t.subtitle}
              </p>
            </div>

            {/* Queue Stats */}
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <Button
                onClick={toggleLanguage}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Languages className="w-4 h-4" />
                {language === "zh" ? "EN" : "中文"}
              </Button>

              {/* Connection Status */}
              {queueServerConnected === false && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {t.queueServerDisconnected}
                </Badge>
              )}
              {queueServerConnected === true && (
                <Badge variant="default" className="text-xs bg-green-500">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {t.connected}
                </Badge>
              )}
              
              {queueStats && (
                <div className="text-right">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.queueStats}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {t.waiting}: {queueStats.waiting}
                    </Badge>
                    <Badge variant="default" className="text-xs bg-blue-500">
                      <Activity className="w-3 h-3 mr-1" />
                      {t.processing}: {queueStats.active}
                    </Badge>
                    <Badge variant="default" className="text-xs bg-green-500">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {t.completed}: {queueStats.completed}
                    </Badge>
                    {queueStats.failed > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <XCircle className="w-3 h-3 mr-1" />
                        {t.failed}: {queueStats.failed}
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
              <TabsTrigger value="tech">{t.techStack}</TabsTrigger>
              <TabsTrigger value="features">{t.features}</TabsTrigger>
            </TabsList>

            <TabsContent value="tech" className="space-y-3 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    {t.technology}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.bunjs}</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      {t.bunjsDesc}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.bullmq}</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      {t.bullmqDesc}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.redis}</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      {t.redisDesc}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.ollama}</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      {t.ollamaDesc}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.sse}</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      {t.sseDesc}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    {t.architecture}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <Server className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-semibold">{t.queueService}</div>
                      <div className="text-slate-600 dark:text-slate-400">
                        {t.queueServiceDesc}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Database className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-semibold">{t.redisService}</div>
                      <div className="text-slate-600 dark:text-slate-400">
                        {t.redisServiceDesc}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-purple-500 mt-0.5" />
                    <div>
                      <div className="font-semibold">{t.ollamaService}</div>
                      <div className="text-slate-600 dark:text-slate-400">
                        {t.ollamaServiceDesc}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    {t.coreFeatures}
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
                    <span>{t.streamingResponse}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>{t.historyRecords}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>{t.performanceMonitoring}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-3 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {t.performanceMetrics}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">{t.avgResponseTime}</span>
                    <Badge variant="outline">
                      {performanceMetrics.avgResponseTime > 0
                        ? `${(performanceMetrics.avgResponseTime / 1000).toFixed(1)}s`
                        : "-"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">{t.totalRequests}</span>
                    <Badge variant="outline">{performanceMetrics.totalRequests}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">{t.successRate}</span>
                    <Badge
                      variant={performanceMetrics.successRate >= 95 ? "default" : "destructive"}
                      className={performanceMetrics.successRate >= 95 ? "bg-green-500" : ""}
                    >
                      {performanceMetrics.successRate}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">{t.throughput}</span>
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
                    {t.taskHistory}
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
                            ? t.statusCompleted
                            : job.state === "failed"
                            ? t.statusFailed
                            : t.statusProcessing}
                        </Badge>
                      </div>
                    ))}
                    {jobHistory.length === 0 && (
                      <div className="text-xs text-slate-400 text-center py-4">
                        {t.noHistory}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {t.queueSettings}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">
                      {t.taskPriority}
                    </label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs"
                    >
                      <option value={1}>{t.priorityLow}</option>
                      <option value={5}>{t.priorityMedium}</option>
                      <option value={10}>{t.priorityHigh}</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">并发处理数</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t.maxRetries}</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t.rateLimit}</span>
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
                  <h3 className="text-lg font-semibold mb-2">{t.startChat}</h3>
                  <p className="text-sm mb-4">
                    {t.startChatDesc}
                  </p>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div>{t.feature1}</div>
                    <div>{t.feature2}</div>
                    <div>{t.feature3}</div>
                    <div>{t.feature4}</div>
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
                            {t.you}
                          </>
                        ) : message.role === "generating" ? (
                          <>
                            <Sparkles className="w-4 h-4" />
                            {t.generatingQuestion}
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4" />
                            {t.aiAssistant}
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {message.priority && message.priority > 5 && (
                          <Badge variant="outline" className="text-xs">
                            {t.highPriority}
                          </Badge>
                        )}
                        {message.status && getStatusBadge(message.status)}
                        {message.queuePosition !== undefined && message.status === "waiting" && (
                          <Badge variant="secondary" className="text-xs">
                            {t.queuePosition}: {format("queuePositionText", { count: message.queuePosition })}
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
                          {format("processingPercent", { percent: Math.round(message.progress) })}
                        </div>
                      </div>
                    )}

                    {/* Message content */}
                    <div className="whitespace-pre-wrap">
                      {message.content || (
                        <span className="text-slate-400 italic">
                          {message.role === "generating"
                            ? message.status === "waiting"
                              ? message.queuePosition !== undefined && message.queuePosition > 0
                                ? format("waitingInQueue", { count: message.queuePosition })
                                : t.waitingMessage
                              : message.status === "active"
                              ? t.generatingQuestionActive
                              : message.status === "failed"
                              ? t.generationFailed
                              : t.waitingMessage
                            : message.status === "waiting"
                            ? message.queuePosition !== undefined && message.queuePosition > 0
                              ? format("waitingInQueue", { count: message.queuePosition })
                              : t.waitingMessage
                            : message.status === "active"
                            ? t.generatingResponse
                            : message.status === "failed"
                            ? t.generationFailed
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
                        {t.generationFailed}
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
                {t.aiGenerateQuestion}
              </Button>
            </div>

            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.inputPlaceholder}
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
                      {t.send}
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
                  {t.refresh}
                </Button>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
              <span>{t.messageQueueInfo}</span>
              <span>{t.priority}: {selectedPriority === 1 ? (language === "zh" ? "低" : "Low") : selectedPriority === 5 ? (language === "zh" ? "中" : "Medium") : (language === "zh" ? "高" : "High")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
