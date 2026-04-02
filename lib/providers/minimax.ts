import OpenAI from "openai";
import type { LLMProvider, ChatParams, StructuredChatParams } from "./types";
import { TruncatedResponseError } from "./types";
import { extractJSON } from "./parse-json";

export class MiniMaxProvider implements LLMProvider {
  readonly id = "minimax";
  readonly name = "MiniMax";
  readonly defaultModel = "MiniMax-M1";
  readonly availableModels = [
    "MiniMax-M1",
    "MiniMax-M1-40k",
    "MiniMax-M2.7",
  ];

  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://api.minimax.chat/v1",
    });
  }

  async chat(params: ChatParams): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: params.model ?? this.defaultModel,
      max_tokens: 16384,
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
      messages: [
        ...params.messages.map((msg) => ({
          role: msg.role as "system" | "user" | "assistant",
          content: msg.content,
        })),
        { role: "user" as const, content: "只输出JSON。" },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const truncated = response.choices[0]?.finish_reason === "length";

    try {
      const parsed = extractJSON(content);
      return params.schema.parse(parsed);
    } catch (parseError) {
      if (truncated) {
        throw new TruncatedResponseError("length");
      }
      throw parseError;
    }
  }
}
