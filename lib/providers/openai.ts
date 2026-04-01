import OpenAI from "openai";
import type { LLMProvider, ChatParams, StructuredChatParams } from "./types";
import { extractJSON } from "./parse-json";

export class OpenAIProvider implements LLMProvider {
  readonly id = "openai";
  readonly name = "OpenAI";
  readonly defaultModel = "gpt-4o";
  readonly availableModels = [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4.1",
    "gpt-4.1-mini",
  ];

  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async chat(params: ChatParams): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: params.model ?? this.defaultModel,
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
      temperature: params.temperature ?? 0.7,
      response_format: { type: "json_object" },
      messages: [
        ...params.messages.map((msg) => ({
          role: msg.role as "system" | "user" | "assistant",
          content: msg.content,
        })),
        {
          role: "user" as const,
          content:
            "Respond ONLY with valid JSON matching the required schema. No markdown, no explanation — just the JSON object.",
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const parsed = extractJSON(content);
    return params.schema.parse(parsed);
  }
}
