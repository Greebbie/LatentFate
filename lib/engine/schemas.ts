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
    .min(2)
    .max(4)
    .describe(
      "The other party's / situation's most likely behaviors regardless of which branch the querent takes. Behavioral signals to watch for."
    ),
  branches: z
    .array(
      z.object({
        id: z.string(),
        action: z.string().describe("Short action label (2-6 chars)"),
        action_description: z
          .string()
          .describe(
            "2-3 sentences describing this strategic posture and why someone might choose it"
          ),
        likelihood: likelihoodSchema,
        emotional_trajectory: z
          .string()
          .describe(
            "How the querent's emotional experience evolves along this path, from start to d30"
          ),
        timeline: z.object({
          h24: z
            .string()
            .describe(
              "24h scene: what happens, what it feels like, what you'd observe. 2-4 sentences."
            ),
          d3: z
            .string()
            .describe(
              "3-day scene: developments, emotional shifts, observable signals. 2-4 sentences."
            ),
          d7: z
            .string()
            .describe(
              "7-day scene: trajectory solidifying or diverging. 2-4 sentences."
            ),
          d30: z
            .string()
            .describe(
              "30-day scene: where this path likely leads. 2-4 sentences."
            ),
        }),
        trigger_conditions: z
          .array(z.string())
          .min(1)
          .max(4)
          .describe(
            "Specific, observable conditions that indicate this path is materializing"
          ),
        risks: z
          .array(z.string())
          .min(1)
          .max(3)
          .describe("Concrete risks, not generic warnings"),
        turning_point: z
          .string()
          .describe(
            "The critical moment or decision point within this path that determines its ultimate direction"
          ),
      })
    )
    .min(2)
    .max(4),
  high_confidence_trends: z
    .array(z.string())
    .min(1)
    .describe("Trends that hold regardless of which branch unfolds"),
  weak_signals: z
    .array(z.string())
    .describe("Subtle indicators worth monitoring over the next 7 days"),
  uncertainty_notes: z
    .array(z.string())
    .describe("Where confidence is lowest and why"),
  disclaimer: z
    .string()
    .describe("Reminder that this is narrative projection, not prophecy"),
});

export type ProjectionResult = z.infer<typeof projectionResultSchema>;
