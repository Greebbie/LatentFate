import type { LLMProvider, ProviderConfig } from "./types";
import { ClaudeProvider } from "./claude";
import { OpenAIProvider } from "./openai";
import { OllamaProvider } from "./ollama";
import { MiniMaxProvider } from "./minimax";
import { QwenProvider } from "./qwen";

export type { LLMProvider, ProviderConfig, Message, ChatParams, StructuredChatParams } from "./types";

export function createProvider(config: ProviderConfig): LLMProvider {
  switch (config.providerId) {
    case "claude": {
      if (!config.apiKey) {
        throw new Error("Claude provider requires an API key");
      }
      return new ClaudeProvider(config.apiKey);
    }
    case "openai": {
      if (!config.apiKey) {
        throw new Error("OpenAI provider requires an API key");
      }
      return new OpenAIProvider(config.apiKey);
    }
    case "minimax": {
      if (!config.apiKey) {
        throw new Error("MiniMax provider requires an API key");
      }
      return new MiniMaxProvider(config.apiKey);
    }
    case "qwen": {
      if (!config.apiKey) {
        throw new Error("Qwen provider requires an API key (DashScope)");
      }
      return new QwenProvider(config.apiKey);
    }
    case "ollama": {
      return new OllamaProvider(config.baseUrl ?? "http://localhost:11434");
    }
    default:
      throw new Error(`Unknown provider: ${config.providerId}`);
  }
}

export const PROVIDER_OPTIONS = [
  {
    id: "claude",
    name: "Anthropic Claude",
    requiresApiKey: true,
    defaultModel: "claude-sonnet-4-20250514",
    models: [
      "claude-opus-4-20250514",
      "claude-sonnet-4-20250514",
      "claude-haiku-4-20250414",
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    requiresApiKey: true,
    defaultModel: "gpt-4o",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini"],
  },
  {
    id: "minimax",
    name: "MiniMax",
    requiresApiKey: true,
    defaultModel: "MiniMax-M1",
    models: ["MiniMax-M1", "MiniMax-M1-40k", "MiniMax-M2.7"],
  },
  {
    id: "qwen",
    name: "Qwen (通义千问)",
    requiresApiKey: true,
    defaultModel: "qwen3-235b-a22b",
    models: [
      "qwen3-235b-a22b",
      "qwen3-30b-a3b",
      "qwen3-32b",
      "qwen3-14b",
      "qwen-plus",
      "qwen-turbo",
    ],
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    requiresApiKey: false,
    defaultModel: "llama3.1",
    models: ["llama3.1", "llama3.2", "mistral", "qwen2.5", "deepseek-r1"],
  },
] as const;
