/**
 * Demo7: Standalone Scheduler Server
 * Runs as an independent process, separated from the main HTTP server
 * Uses Bun's native timer for scheduling tasks
 */

import { modelManager, defaultModelConfig } from "../lib/models";
import { db, initDatabase } from "../lib/demo7-db/db";
import { scheduledChats } from "../lib/demo7-db/schema";

// Prompts pool - random prompts for variety
const PROMPTS = [
  "Say something interesting about technology.",
  "What's a fun fact about programming?",
  "Tell me a short joke about developers.",
  "What's an interesting insight about AI?",
  "Share a helpful tip about productivity.",
  "What's something cool about the universe?",
  "Tell me something positive to start the day.",
];

let schedulerInterval: Timer | null = null;
let isRunning = false;

/**
 * Execute a single scheduled AI chat task
 */
async function executeScheduledTask(): Promise<void> {
  try {
    // Pick a random prompt
    const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [Demo7] Executing scheduled task: "${prompt.substring(0, 50)}..."`);
    
    // Call AI model
    const response = await modelManager.query(prompt, {
      ...defaultModelConfig,
      systemPrompt: "You are a helpful AI assistant. Keep your responses concise and engaging (1-3 sentences).",
    });
    
    // Save to database
    await db.insert(scheduledChats).values({
      prompt,
      response: response.content,
      model: response.model,
      status: "success",
      createdAt: new Date(),
    });
    
    console.log(`[${timestamp}] ✅ [Demo7] Scheduled task completed successfully`);
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ [Demo7] Scheduled task failed:`, error);
    
    // Save error to database
    try {
      const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
      await db.insert(scheduledChats).values({
        prompt,
        response: "",
        model: defaultModelConfig.model,
        status: "error",
        errorMessage: error instanceof Error ? error.message : String(error),
        createdAt: new Date(),
      });
    } catch (dbError) {
      console.error(`[${timestamp}] ❌ [Demo7] Failed to save error to database:`, dbError);
    }
  }
}

/**
 * Start the scheduler (runs every 5 minutes)
 */
async function startScheduler(): Promise<void> {
  if (isRunning) {
    console.log("⚠️ [Demo7] Scheduler is already running");
    return;
  }

  try {
    // Initialize database first
    console.log("🔧 [Demo7] Initializing database...");
    await initDatabase();
    
    // Execute first task immediately
    console.log("🚀 [Demo7] Executing initial task...");
    await executeScheduledTask();
    
    // Schedule periodic tasks (1 minute = 60000 ms)
    const INTERVAL_MS = 1 * 60 * 1000;
    schedulerInterval = setInterval(async () => {
      await executeScheduledTask();
    }, INTERVAL_MS);
    
    isRunning = true;
    console.log(`✅ [Demo7] Scheduler started successfully`);
    console.log(`📅 [Demo7] Interval: Every 1 minute (${INTERVAL_MS / 1000}s)`);
    console.log(`💡 [Demo7] Press Ctrl+C to stop the scheduler`);
  } catch (error) {
    console.error(`❌ [Demo7] Failed to start scheduler:`, error);
    process.exit(1);
  }
}

/**
 * Stop the scheduler gracefully
 */
function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    isRunning = false;
    console.log(`🛑 [Demo7] Scheduler stopped`);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n⚠️  [Demo7] Received SIGINT, shutting down gracefully...");
  stopScheduler();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n⚠️  [Demo7] Received SIGTERM, shutting down gracefully...");
  stopScheduler();
  process.exit(0);
});

// Start the scheduler
console.log("=".repeat(60));
console.log("🚀 Demo7: Scheduled AI Chat Tasks Scheduler");
console.log("=".repeat(60));
console.log("");
startScheduler().catch((error) => {
  console.error("❌ Failed to start scheduler:", error);
  process.exit(1);
});

