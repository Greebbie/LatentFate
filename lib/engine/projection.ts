import type { LLMProvider } from "@/lib/providers/types";
import { TruncatedResponseError } from "@/lib/providers/types";
import type { DrawnCard } from "@/lib/tarot/types";
import {
  projectionResultSchema,
  type ProjectionResult,
  type ReadingResult,
} from "./schemas";
import { buildProjectionPrompt } from "./prompts";

const MAX_ATTEMPTS = 3;
const BASE_TEMPERATURE = 0.5;

export interface ProjectionInput {
  question: string;
  background?: string;
  cards: DrawnCard[];
  reading: ReadingResult;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof TruncatedResponseError) return true;
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("failed to extract json") ||
      msg.includes("expected") ||
      msg.includes("required") ||
      msg.includes("invalid")
    );
  }
  return false;
}

export async function performProjection(
  input: ProjectionInput,
  provider: LLMProvider,
  model?: string
): Promise<ProjectionResult> {
  const { system, user } = buildProjectionPrompt(
    input.question,
    input.background,
    input.cards,
    input.reading
  );

  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await provider.chatStructured({
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        schema: projectionResultSchema,
        schemaName: "ProjectionResult",
        model,
        temperature: BASE_TEMPERATURE - attempt * 0.1,
      });
    } catch (error: unknown) {
      lastError = error;
      if (!isRetryableError(error) || attempt === MAX_ATTEMPTS - 1) {
        throw error;
      }
    }
  }

  throw lastError;
}
