import type { ZodSchema } from "zod";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatParams {
  messages: Message[];
  model?: string;
  temperature?: number;
}

export interface StructuredChatParams<T> extends ChatParams {
  schema: ZodSchema<T>;
  schemaName?: string;
}

export interface LLMProvider {
  id: string;
  name: string;
  defaultModel: string;
  availableModels: string[];

  chat(params: ChatParams): Promise<string>;
  chatStructured<T>(params: StructuredChatParams<T>): Promise<T>;
}

export interface ProviderConfig {
  providerId: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export class TruncatedResponseError extends Error {
  constructor(finishReason: string) {
    super(`LLM response truncated (finish_reason: ${finishReason})`);
    this.name = "TruncatedResponseError";
  }
}
