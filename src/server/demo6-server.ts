/**
 * Demo6: HTTP Server for Queue-based AI Chat
 * Provides REST API and SSE endpoints
 */

import { serve } from "bun";
import { addChatTask, getJobStatus, getQueueStats, cleanup } from "./demo6-queue";
import type { ChatJobData } from "./demo6-queue";

const PORT = parseInt(process.env.PORT || "3001");

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle CORS preflight
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// SSE endpoint: Stream job status
async function handleSSE(jobId: string, request: Request): Promise<Response> {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected", jobId })}\n\n`)
      );

      // Heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "heartbeat" })}\n\n`)
          );
        } catch (e) {
          clearInterval(heartbeatInterval);
        }
      }, 15000); // Every 15 seconds

      // Poll job status
      const pollInterval = setInterval(async () => {
        try {
          const status = await getJobStatus(jobId);

          if (!status) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "error", message: "Job not found" })}\n\n`)
            );
            clearInterval(pollInterval);
            clearInterval(heartbeatInterval);
            controller.close();
            return;
          }

          // Send status update
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "status",
                jobId: status.jobId,
                state: status.state,
                progress: status.progress,
                result: status.result,
                failedReason: status.failedReason,
              })}\n\n`
            )
          );

          // Close if job is completed or failed
          if (status.state === "completed" || status.state === "failed") {
            clearInterval(pollInterval);
            clearInterval(heartbeatInterval);
            
            // Wait a bit before closing to ensure last message is sent
            setTimeout(() => {
              controller.close();
            }, 100);
          }
        } catch (error) {
          console.error("SSE polling error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: error instanceof Error ? error.message : "Unknown error",
              })}\n\n`
            )
          );
          clearInterval(pollInterval);
          clearInterval(heartbeatInterval);
          controller.close();
        }
      }, 500); // Poll every 500ms

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(pollInterval);
        clearInterval(heartbeatInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...corsHeaders,
    },
  });
}

// Stream job result (for streaming response content)
async function handleStreamResult(jobId: string, request: Request): Promise<Response> {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let lastProgress = 0;

      const pollInterval = setInterval(async () => {
        try {
          const status = await getJobStatus(jobId);

          if (!status) {
            clearInterval(pollInterval);
            controller.close();
            return;
          }

          // If job is processing, check if we can get partial results
          // Note: For true streaming, we'd need to modify the worker to emit chunks
          // For now, we'll send progress updates

          if (status.state === "completed" && status.result) {
            // Send final result
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "chunk",
                  content: status.result.response,
                  done: true,
                })}\n\n`
              )
            );
            clearInterval(pollInterval);
            controller.close();
          } else if (status.state === "active" && status.progress > lastProgress) {
            // Send progress update (simulated chunk)
            lastProgress = status.progress;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "progress",
                  progress: status.progress,
                })}\n\n`
              )
            );
          } else if (status.state === "failed") {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  message: status.failedReason || "Job failed",
                })}\n\n`
              )
            );
            clearInterval(pollInterval);
            controller.close();
          }
        } catch (error) {
          console.error("Stream polling error:", error);
          clearInterval(pollInterval);
          controller.close();
        }
      }, 200); // Poll more frequently for streaming

      request.signal.addEventListener("abort", () => {
        clearInterval(pollInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...corsHeaders,
    },
  });
}

// Start HTTP server
const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return handleCORS();
    }

    // Health check
    if (url.pathname === "/health") {
      return Response.json({ status: "ok", timestamp: Date.now() }, {
        headers: corsHeaders,
      });
    }

    // Get queue statistics
    if (url.pathname === "/api/queue/stats" && req.method === "GET") {
      try {
        const stats = await getQueueStats();
        return Response.json(stats, { headers: corsHeaders });
      } catch (error) {
        return Response.json(
          { error: error instanceof Error ? error.message : "Unknown error" },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Get job status
    if (url.pathname.startsWith("/api/job/") && req.method === "GET") {
      const jobId = url.pathname.split("/")[3];
      try {
        const status = await getJobStatus(jobId);
        if (!status) {
          return Response.json({ error: "Job not found" }, {
            status: 404,
            headers: corsHeaders,
          });
        }
        return Response.json(status, { headers: corsHeaders });
      } catch (error) {
        return Response.json(
          { error: error instanceof Error ? error.message : "Unknown error" },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // SSE endpoint: Stream job status
    if (url.pathname.startsWith("/stream/status/") && req.method === "GET") {
      const jobId = url.pathname.split("/")[3];
      return handleSSE(jobId, req);
    }

    // SSE endpoint: Stream job result
    if (url.pathname.startsWith("/stream/result/") && req.method === "GET") {
      const jobId = url.pathname.split("/")[3];
      return handleStreamResult(jobId, req);
    }

    // Add chat task
    if (url.pathname === "/api/chat" && req.method === "POST") {
      try {
        const body = (await req.json()) as Partial<ChatJobData>;
        
        if (!body.prompt || !body.userId) {
          return Response.json(
            { error: "Missing required fields: userId, prompt" },
            { status: 400, headers: corsHeaders }
          );
        }

        const jobData: ChatJobData = {
          userId: body.userId,
          prompt: body.prompt,
          conversationHistory: body.conversationHistory || [],
          model: body.model || "qwen3:latest",
        };

        const jobId = await addChatTask(jobData);

        return Response.json(
          {
            success: true,
            jobId,
            message: "Task queued successfully",
          },
          { headers: corsHeaders }
        );
      } catch (error) {
        console.error("Error adding chat task:", error);
        return Response.json(
          {
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // 404
    return Response.json({ error: "Not found" }, {
      status: 404,
      headers: corsHeaders,
    });
  },
});

console.log(`🚀 Demo6 Queue Server running at http://localhost:${PORT}`);
console.log(`📊 Queue stats: http://localhost:${PORT}/api/queue/stats`);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");
  await cleanup();
  server.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down server...");
  await cleanup();
  server.stop();
  process.exit(0);
});

