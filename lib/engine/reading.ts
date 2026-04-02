import type { LLMProvider } from "@/lib/providers/types";
import type { DrawnCard } from "@/lib/tarot/types";
import { readingResultSchema, type ReadingResult } from "./schemas";
import { buildReadingPrompt } from "./prompts";

const MAX_ATTEMPTS = 2;

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

  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await provider.chatStructured({
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        schema: readingResultSchema,
        schemaName: "ReadingResult",
        model,
        temperature: 0.8 - attempt * 0.2,
      });
    } catch (error: unknown) {
      lastError = error;
      if (attempt === MAX_ATTEMPTS - 1) {
        throw error;
      }
    }
  }

  throw lastError;
}
