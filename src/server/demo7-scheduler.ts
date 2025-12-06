/**
 * Demo7: Scheduled Task Scheduler
 * Runs AI chat tasks every 5 minutes automatically
 * Stores results in SQLite database
 */

import { modelManager, defaultModelConfig } from "../lib/models";
import { db, initDatabase } from "../lib/demo7-db/db";
import { scheduledChats } from "../lib/demo7-db/schema";
import { desc, eq } from "drizzle-orm";

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
    
    console.log(`[Demo7] Executing scheduled task: "${prompt.substring(0, 50)}..."`);
    
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
    
    console.log(`✅ [Demo7] Scheduled task completed successfully`);
  } catch (error) {
    console.error(`❌ [Demo7] Scheduled task failed:`, error);
    
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
      console.error(`❌ [Demo7] Failed to save error to database:`, dbError);
    }
  }
}

/**
 * Start the scheduler (runs every 5 minutes)
 */
export async function startScheduler(): Promise<void> {
  if (isRunning) {
    console.log("⚠️ [Demo7] Scheduler is already running");
    return;
  }

  try {
    // Initialize database first
    await initDatabase();
    
    // Execute first task immediately
    await executeScheduledTask();
    
    // Schedule periodic tasks (5 minutes = 300000 ms)
    const INTERVAL_MS = 5 * 60 * 1000;
    schedulerInterval = setInterval(async () => {
      await executeScheduledTask();
    }, INTERVAL_MS);
    
    isRunning = true;
    console.log(`✅ [Demo7] Scheduler started (interval: 5 minutes)`);
  } catch (error) {
    console.error(`❌ [Demo7] Failed to start scheduler:`, error);
    throw error;
  }
}

/**
 * Stop the scheduler
 */
export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    isRunning = false;
    console.log(`🛑 [Demo7] Scheduler stopped`);
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): { isRunning: boolean; intervalMinutes: number } {
  return {
    isRunning,
    intervalMinutes: 1,
  };
}

/**
 * Get all scheduled chat records
 */
export async function getScheduledChats(limit: number = 100) {
  return await db
    .select()
    .from(scheduledChats)
    .orderBy(desc(scheduledChats.createdAt))
    .limit(limit);
}

/**
 * Get a single scheduled chat record
 */
export async function getScheduledChat(id: number) {
  const results = await db
    .select()
    .from(scheduledChats)
    .where(eq(scheduledChats.id, id))
    .limit(1);
  
  return results[0] || null;
}

