import OpenAI from "openai";
import type { LLMProvider, ChatParams, StructuredChatParams } from "./types";
import { TruncatedResponseError } from "./types";
import { extractJSON } from "./parse-json";

export class QwenProvider implements LLMProvider {
  readonly id = "qwen";
  readonly name = "Qwen (通义千问)";
  readonly defaultModel = "qwen3-235b-a22b";
  readonly availableModels = [
    "qwen3-235b-a22b",
    "qwen3-30b-a3b",
    "qwen3-32b",
    "qwen3-14b",
    "qwen-plus",
    "qwen-turbo",
  ];

  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });
  }

  async chat(params: ChatParams): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: params.model ?? this.defaultModel,
      max_tokens: 8192,
      temperature: params.temperature ?? 0.7,
      messages: params.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    return response.choices[0]?.message?.content ?? "";
  }

  async chatStructured<T>(params: StructuredChatParams<T>): Promise<T> {
    const response = await this.client.chat.completions.create({
      model: params.model ?? this.defaultModel,
      max_tokens: 16384,
      temperature: params.temperature ?? 0.7,
      response_format: { type: "json_object" },
      messages: params.messages.map((msg) => ({
        role: msg.role as "system" | "user" | "assistant",
        content: msg.content,
      })),
    });

    if (response.choices[0]?.finish_reason === "length") {
      throw new TruncatedResponseError("length");
    }

    const content = response.choices[0]?.message?.content ?? "{}";
    const parsed = extractJSON(content);
    return params.schema.parse(parsed);
  }
}
