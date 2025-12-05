/**
 * Model Provider Interface
 * Supports multiple AI models (Ollama, OpenAI, Anthropic, etc.)
 */

export interface ModelConfig {
  name: string;
  provider: "ollama" | "openai" | "anthropic" | "custom";
  apiUrl?: string;
  apiKey?: string;
  model: string;
  systemPrompt?: string;
}

export interface ModelResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface ModelProvider {
  query(prompt: string, config: ModelConfig): Promise<ModelResponse>;
}

/**
 * Ollama Model Provider (Default)
 */
export class OllamaProvider implements ModelProvider {
  async query(prompt: string, config: ModelConfig): Promise<ModelResponse> {
    if (!prompt.trim()) {
      throw new Error("Prompt cannot be empty");
    }

    const apiUrl = config.apiUrl || "http://localhost:11434/api/generate";
    const fullPrompt = config.systemPrompt
      ? `${config.systemPrompt}\n\n${prompt.trim()}`
      : prompt.trim();

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        prompt: fullPrompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Ollama API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.response || data.content || data.text;
    
    if (!content) {
      throw new Error("No response content found in API response");
    }

    return {
      content: typeof content === "string" ? content : String(content),
      model: config.model,
    };
  }
}

/**
 * Model Manager - Handles multiple model providers
 */
export class ModelManager {
  private providers: Map<string, ModelProvider> = new Map();
  private defaultConfig: ModelConfig;

  constructor(defaultConfig: ModelConfig) {
    this.defaultConfig = defaultConfig;
    // Register default Ollama provider
    this.registerProvider("ollama", new OllamaProvider());
  }

  registerProvider(name: string, provider: ModelProvider) {
    this.providers.set(name, provider);
  }

  getProvider(providerName: string): ModelProvider {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }
    return provider;
  }

  async query(
    prompt: string,
    config?: Partial<ModelConfig>
  ): Promise<ModelResponse> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const provider = this.getProvider(finalConfig.provider);
    return provider.query(prompt, finalConfig);
  }
}

// Default model configuration
export const defaultModelConfig: ModelConfig = {
  name: "Qwen3",
  provider: "ollama",
  apiUrl: "http://localhost:11434/api/generate",
  model: "qwen3:latest",
};

// System prompts
export const LEADS_BOT_SYSTEM_PROMPT = `You are GrokForge LeadsBot: Build Python agent (<100 lines, requests+csv only, NO markdown). Input: pain point like 'generate marketing leads: AI solo founder in SF'. Output: Clean code: 1. input Apollo API key. 2. GET https://api.apollo.io/v1/people/match params={q_vars={'keywords':'AI solo founder','location':'San Francisco','title':'Founder OR CEO'}, page=1, per_page=10}. 3. Parse to CSV 'leads.csv' (name,email,company). 4. If <5 leads, log alt LinkedIn. 5. Print summary. Error: 429 sleep(60)+retry. if name=='main': run once. pip install requests && python leads_bot.py`;

export const DECISION_BOT_SYSTEM_PROMPT = `You are GrokForge DecisionBot: Build Python agent (<100 lines, NO markdown). Input: pain like 'decision loneliness for solo founder'. Output: Clean code: 1. input dilemma. 2. Sim 3 perspectives (CEO/COO/Investor) via simple if-else advice. 3. Log to decision_log.txt. 4. Print summary + next steps. if name=='main': run once.`;

// Create default model manager instance
export const modelManager = new ModelManager(defaultModelConfig);

