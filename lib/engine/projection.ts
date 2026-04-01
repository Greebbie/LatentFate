import type { LLMProvider } from "@/lib/providers/types";
import type { DrawnCard } from "@/lib/tarot/types";
import {
  projectionResultSchema,
  type ProjectionResult,
  type ReadingResult,
} from "./schemas";
import { buildProjectionPrompt } from "./prompts";

export interface ProjectionInput {
  question: string;
  background?: string;
  cards: DrawnCard[];
  reading: ReadingResult;
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

  return provider.chatStructured({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    schema: projectionResultSchema,
    schemaName: "ProjectionResult",
    model,
    temperature: 0.7,
  });
}
