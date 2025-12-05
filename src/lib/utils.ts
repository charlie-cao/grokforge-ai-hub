import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Query Qwen3 model via Ollama API
 * @param prompt - The user's prompt/question
 * @param systemPrompt - Optional system prompt for specialized bots
 * @returns The response content from Qwen3
 * @throws Error if the API request fails or returns invalid data
 */
export async function queryQwen3(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  if (!prompt.trim()) {
    throw new Error("Prompt cannot be empty");
  }

  try {
    // Prepend system prompt if provided
    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\n${prompt.trim()}`
      : prompt.trim();

    console.log("Querying Qwen3 with prompt:", fullPrompt);
    
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen3:latest",
        prompt: fullPrompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Ollama API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Qwen3 response received");
    
    // Handle different possible response formats
    const content = data.response || data.content || data.text;
    if (!content) {
      throw new Error("No response content found in API response");
    }
    
    return typeof content === "string" ? content : String(content);
  } catch (error) {
    console.error("Error querying Qwen3:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unknown error: ${String(error)}`);
  }
}

/**
 * Default system prompt for general queries
 */
export const DEFAULT_SYSTEM_PROMPT = "";

/**
 * LeadsBot system prompt for Apollo integration
 */
export const LEADS_BOT_SYSTEM_PROMPT = `You are GrokForge LeadsBot: Build Python agent (<100 lines, requests+csv only, NO markdown). Input: pain point like 'generate marketing leads: AI solo founder in SF'. Output: Clean code: 1. input Apollo API key. 2. GET https://api.apollo.io/v1/people/match params={q_vars={'keywords':'AI solo founder','location':'San Francisco','title':'Founder OR CEO'}, page=1, per_page=10}. 3. Parse to CSV 'leads.csv' (name,email,company). 4. If <5 leads, log alt LinkedIn. 5. Print summary. Error: 429 sleep(60)+retry. if name=='main': run once. pip install requests && python leads_bot.py`;
