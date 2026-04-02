import type { LLMProvider } from "@/lib/providers/types";
import type { DrawnCard } from "@/lib/tarot/types";
import { readingResultSchema, type ReadingResult } from "./schemas";
import { buildReadingPrompt } from "./prompts";

export interface ReadingInput {
  question: string;
  background?: string;
  cards: DrawnCard[];
}

export async function performReading(
  input: ReadingInput,
  provider: LLMProvider,
  model?: string
): Promise<ReadingResult> {
  const { system, user } = buildReadingPrompt(
    input.question,
    input.background,
    input.cards
  );

  return provider.chatStructured({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    schema: readingResultSchema,
    schemaName: "ReadingResult",
    model,
    temperature: 0.8,
  });
}
