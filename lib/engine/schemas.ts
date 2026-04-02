import { z } from "zod";

export const readingResultSchema = z.object({
  overview: z
    .string()
    .describe(
      "3-5 sentence narrative weaving all cards into a cohesive story about the querent's situation. Must reference specific cards by name."
    ),
  core_tension: z
    .string()
    .describe(
      "One sentence identifying the central conflict or friction point revealed by this card combination"
    ),
  state_analysis: z.object({
    dynamics: z
      .string()
      .describe("Current relationship/situation dynamics, 2-3 sentences"),
    elemental_interaction: z
      .string()
      .describe(
        "How the elements/suits of the drawn cards interact and what this means for the situation"
      ),
    tensions: z
      .array(z.string())
      .min(1)
      .max(4)
      .describe(
        "Specific tensions or conflicts, each grounded in card symbolism"
      ),
    patterns: z
      .array(z.string())
      .min(1)
      .max(4)
      .describe("Recurring patterns observed across the cards"),
  }),
  narrative_arc: z
    .string()
    .describe(
      "The story told by Past → Present → Future: what trajectory is unfolding, and what is its momentum?"
    ),
  card_interpretations: z.array(
    z.object({
      card_id: z.string(),
      position_id: z.string(),
      reversed: z.boolean(),
      interpretation: z
        .string()
        .describe(
          "This card's meaning in this position, referencing its symbolism and how it relates to the other drawn cards"
        ),
      relation_to_other_cards: z
        .string()
        .describe(
          "How this card interacts with or contrasts against the other cards in the spread"
        ),
      key_insight: z
        .string()
        .describe("One vivid sentence capturing the core message"),
    })
  ),
});

export type ReadingResult = z.infer<typeof readingResultSchema>;

export const likelihoodSchema = z.enum([
  "highly_likely",
  "possible",
  "unlikely",
  "speculative",
]);

export type Likelihood = z.infer<typeof likelihoodSchema>;

export const projectionResultSchema = z.object({
  predicted_behaviors: z
    .array(z.string())
    .min(1)
    .describe(
      "The other party's / situation's most likely behaviors regardless of which branch the querent takes."
    ),
  branches: z
    .array(
      z.object({
        id: z.string(),
        action: z.string(),
        action_description: z.string(),
        likelihood: likelihoodSchema,
        emotional_trajectory: z.string(),
        timeline: z.object({
          h24: z.string(),
          d3: z.string(),
          d7: z.string(),
          d30: z.string(),
        }),
        trigger_conditions: z.array(z.string()).min(1),
        risks: z.array(z.string()).min(1),
        turning_point: z.string(),
      })
    )
    .min(1),
  high_confidence_trends: z.array(z.string()).min(1),
  weak_signals: z.array(z.string()),
  uncertainty_notes: z.array(z.string()),
  disclaimer: z.string(),
});

export type ProjectionResult = z.infer<typeof projectionResultSchema>;

/* ── Two-phase projection schemas ── */

export const projectionSkeletonSchema = z.object({
  predicted_behaviors: z.array(z.string()).min(1),
  branches: z
    .array(
      z.object({
        id: z.string(),
        action: z.string(),
        action_description: z.string(),
        likelihood: likelihoodSchema,
      })
    )
    .min(2),
  high_confidence_trends: z.array(z.string()).min(1),
  weak_signals: z.array(z.string()),
  uncertainty_notes: z.array(z.string()),
  disclaimer: z.string(),
});

export type ProjectionSkeleton = z.infer<typeof projectionSkeletonSchema>;

export const branchDetailSchema = z.object({
  emotional_trajectory: z.string(),
  timeline: z.object({
    h24: z.string(),
    d3: z.string(),
    d7: z.string(),
    d30: z.string(),
  }),
  trigger_conditions: z.array(z.string()).min(1),
  risks: z.array(z.string()).min(1),
  turning_point: z.string(),
});

export type BranchDetail = z.infer<typeof branchDetailSchema>;
