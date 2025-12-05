import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { modelManager } from "./models";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Prompt Helper: Generate Qwen3 prompt from user pain point
 */
export const PROMPT_HELPER_SYSTEM_PROMPT = `You are PromptHelper: From user pain, gen 1 concise Qwen3 prompt for bot. Output ONLY the prompt, no explanations, no markdown. Example: Input "找客户" → Output "生成营销leads: AI solo founder in SF"`;

export async function generatePromptFromPain(painPoint: string): Promise<string> {
  if (!painPoint.trim()) {
    throw new Error("Pain point cannot be empty");
  }

  try {
    const response = await modelManager.query(
      `User pain point: "${painPoint.trim()}"`,
      {
        systemPrompt: PROMPT_HELPER_SYSTEM_PROMPT,
      }
    );
    
    return response.content.trim();
  } catch (error) {
    console.error("Prompt generation error:", error);
    throw error;
  }
}
