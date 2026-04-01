import type { LLMProvider, ChatParams, StructuredChatParams } from "./types";
import { extractJSON } from "./parse-json";

interface OllamaMessage {
  role: string;
  content: string;
}

interface OllamaChatResponse {
  message: {
    role: string;
    content: string;
  };
}

export class OllamaProvider implements LLMProvider {
  readonly id = "ollama";
  readonly name = "Ollama (Local)";
  readonly defaultModel = "llama3.1";
  readonly availableModels = [
    "llama3.1",
    "llama3.2",
    "mistral",
    "qwen2.5",
    "deepseek-r1",
  ];

  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:11434") {
    this.baseUrl = baseUrl;
  }

  async chat(params: ChatParams): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: params.model ?? this.defaultModel,
        messages: params.messages.map(
          (msg): OllamaMessage => ({
            role: msg.role,
            content: msg.content,
          })
        ),
        stream: false,
        options: {
          temperature: params.temperature ?? 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Ollama request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as OllamaChatResponse;
    return data.message.content;
  }

  async chatStructured<T>(params: StructuredChatParams<T>): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: params.model ?? this.defaultModel,
        messages: [
          ...params.messages.map(
            (msg): OllamaMessage => ({
              role: msg.role,
              content: msg.content,
            })
          ),
          {
            role: "user",
            content:
              "Respond ONLY with valid JSON matching the required schema. No markdown, no explanation — just the JSON object.",
          },
        ],
        stream: false,
        format: "json",
        options: {
          temperature: params.temperature ?? 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Ollama request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as OllamaChatResponse;
    const parsed = extractJSON(data.message.content);
    return params.schema.parse(parsed);
  }
}
