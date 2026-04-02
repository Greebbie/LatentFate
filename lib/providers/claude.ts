import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider, ChatParams, StructuredChatParams, Message } from "./types";
import { TruncatedResponseError } from "./types";
import { extractJSON } from "./parse-json";

export class ClaudeProvider implements LLMProvider {
  readonly id = "claude";
  readonly name = "Anthropic Claude";
  readonly defaultModel = "claude-sonnet-4-20250514";
  readonly availableModels = [
    "claude-opus-4-20250514",
    "claude-sonnet-4-20250514",
    "claude-haiku-4-20250414",
  ];

  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async chat(params: ChatParams): Promise<string> {
    const { systemMessage, userMessages } = this.splitMessages(params.messages);

    const response = await this.client.messages.create({
      model: params.model ?? this.defaultModel,
      max_tokens: 16384,
      temperature: params.temperature ?? 0.7,
      system: systemMessage,
      messages: userMessages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock?.text ?? "";
  }

  async chatStructured<T>(params: StructuredChatParams<T>): Promise<T> {
    const { systemMessage, userMessages } = this.splitMessages(params.messages);

    const response = await this.client.messages.create({
      model: params.model ?? this.defaultModel,
      max_tokens: 16384,
      temperature: params.temperature ?? 0.7,
      system: systemMessage,
      messages: userMessages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const rawResponse = textBlock?.text ?? "{}";
    const truncated = response.stop_reason === "max_tokens";

    try {
      const parsed = extractJSON(rawResponse);
      return params.schema.parse(parsed);
    } catch (parseError) {
      if (truncated) {
        throw new TruncatedResponseError("max_tokens");
      }
      throw parseError;
    }
  }

  private splitMessages(messages: Message[]): {
    systemMessage: string;
    userMessages: Array<{ role: "user" | "assistant"; content: string }>;
  } {
    const systemParts: string[] = [];
    const userMessages: Array<{ role: "user" | "assistant"; content: string }> =
      [];

    for (const msg of messages) {
      if (msg.role === "system") {
        systemParts.push(msg.content);
      } else {
        userMessages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }
    }

    return {
      systemMessage: systemParts.join("\n\n"),
      userMessages,
    };
  }
}
