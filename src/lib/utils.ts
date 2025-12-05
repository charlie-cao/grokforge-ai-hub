import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Query Qwen3 model via Ollama API
 * @param prompt - The user's prompt/question
 * @returns The response content from Qwen3
 * @throws Error if the API request fails or returns invalid data
 */
export async function queryQwen3(prompt: string): Promise<string> {
  if (!prompt.trim()) {
    throw new Error("Prompt cannot be empty");
  }

  try {
    console.log("Querying Qwen3 with prompt:", prompt);
    
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen3:latest",
        prompt: prompt.trim(),
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
