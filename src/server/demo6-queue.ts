/**
 * Demo6: Queue-based AI Chat Service
 * Uses BullMQ + Redis for job queue management
 * Integrates with Ollama for AI generation
 * Provides SSE endpoints for real-time queue status
 */

import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";

// Redis connection
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Queue configuration
const chatQueue = new Queue("ai-chat-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 100,
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
    },
  },
});

// Job data interface
export interface ChatJobData {
  userId: string;
  prompt: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  model?: string;
}

export interface ChatJobResult {
  success: boolean;
  response: string;
  timestamp: number;
  jobId: string;
}

// Stream Ollama response
async function* streamOllamaResponse(
  prompt: string,
  model: string = "qwen3:latest",
  systemPrompt?: string
): AsyncGenerator<string, void, unknown> {
  const ollamaHost = process.env.OLLAMA_HOST || "localhost";
  const ollamaPort = process.env.OLLAMA_PORT || "11434";
  const apiUrl = process.env.OLLAMA_URL || `http://${ollamaHost}:${ollamaPort}/api/generate`;
  const fullPrompt = systemPrompt
    ? `${systemPrompt}\n\n${prompt.trim()}`
    : prompt.trim();

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: fullPrompt,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Failed to get readable stream");
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            const chunk = data.response || "";
            if (chunk) {
              yield chunk;
            }
            if (data.done) {
              return;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Worker: Process AI chat jobs
const worker = new Worker<ChatJobData, ChatJobResult>(
  "ai-chat-queue",
  async (job: Job<ChatJobData, ChatJobResult>) => {
    const { userId, prompt, conversationHistory, model = "qwen3:latest" } = job.data;

    try {
      // Update progress: Starting
      await job.updateProgress(10);

      // Build conversation context
      const systemPrompt = "You are a helpful AI assistant. Answer questions concisely and helpfully.";

      // Update progress: Generating
      await job.updateProgress(30);

      // Stream response from Ollama
      let fullResponse = "";
      const stream = streamOllamaResponse(prompt, model, systemPrompt);

      for await (const chunk of stream) {
        fullResponse += chunk;
        // Update progress based on response length (estimate)
        const progress = Math.min(30 + (fullResponse.length / 1000) * 60, 90);
        await job.updateProgress(progress);
      }

      // Update progress: Complete
      await job.updateProgress(100);

      const result: ChatJobResult = {
        success: true,
        response: fullResponse,
        timestamp: Date.now(),
        jobId: job.id!,
      };

      console.log(`✅ Job ${job.id} completed for user ${userId}`);
      return result;
    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error);
      await job.updateProgress(0);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3, // Process 3 jobs concurrently
    limiter: {
      max: 10, // Max 10 jobs
      duration: 60000, // Per minute (rate limiting)
    },
  }
);

// Worker event listeners
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

// Add chat task to queue
export async function addChatTask(data: ChatJobData): Promise<string> {
  const job = await chatQueue.add(
    "generate-chat",
    data,
    {
      priority: 10,
      jobId: `${data.userId}-${Date.now()}`,
    }
  );
  console.log(`📝 Task queued: ${job.id} for user ${data.userId}`);
  return job.id!;
}

// Get job status
export async function getJobStatus(jobId: string) {
  const job = await chatQueue.getJob(jobId);
  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress || 0;
  const result = job.returnvalue;
  const failedReason = job.failedReason;

  return {
    jobId: job.id!,
    state: state as string,
    progress: typeof progress === "number" ? progress : 0,
    result,
    failedReason,
    data: job.data,
  };
}

// Get queue statistics
export async function getQueueStats() {
  const [waiting, active, completed, failed] = await Promise.all([
    chatQueue.getWaitingCount(),
    chatQueue.getActiveCount(),
    chatQueue.getCompletedCount(),
    chatQueue.getFailedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    total: waiting + active,
  };
}

// Cleanup function
export async function cleanup() {
  await worker.close();
  await chatQueue.close();
  await redisConnection.quit();
}

// Export queue and worker for external access
export { chatQueue, worker, redisConnection };

