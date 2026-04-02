import type { LLMProvider } from "@/lib/providers/types";
import type { DrawnCard } from "@/lib/tarot/types";
import {
  projectionSkeletonSchema,
  branchDetailSchema,
  type ProjectionResult,
  type ReadingResult,
} from "./schemas";
import { buildSkeletonPrompt, buildBranchDetailPrompt } from "./prompts";

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
  // Phase 1: Generate skeleton (small output — branch framework + trends)
  const { system: skelSystem, user: skelUser } = buildSkeletonPrompt(
    input.question,
    input.background,
    input.cards,
    input.reading
  );

  const skeleton = await provider.chatStructured({
    messages: [
      { role: "system", content: skelSystem },
      { role: "user", content: skelUser },
    ],
    schema: projectionSkeletonSchema,
    schemaName: "ProjectionSkeleton",
    model,
    temperature: 0.5,
  });

  // Phase 2: Generate branch details in parallel (each call is small)
  const detailPromises = skeleton.branches.map((branch) => {
    const { system, user } = buildBranchDetailPrompt(
      input.question,
      input.background,
      input.cards,
      input.reading,
      branch,
      skeleton.branches
    );

    return provider.chatStructured({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      schema: branchDetailSchema,
      schemaName: "BranchDetail",
      model,
      temperature: 0.5,
    });
  });

  const details = await Promise.all(detailPromises);

  // Merge skeleton + details into final result
  return {
    predicted_behaviors: skeleton.predicted_behaviors,
    branches: skeleton.branches.map((branch, i) => ({
      ...branch,
      ...details[i],
    })),
    high_confidence_trends: skeleton.high_confidence_trends,
    weak_signals: skeleton.weak_signals,
    uncertainty_notes: skeleton.uncertainty_notes,
    disclaimer: skeleton.disclaimer,
  };
}
