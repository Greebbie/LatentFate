import { z } from "zod";

export const readingResultSchema = z.object({
  overview: z.string().describe("2-3 sentence summary of the reading"),
  state_analysis: z.object({
    dynamics: z.string().describe("Current dynamics at play"),
    tensions: z
      .array(z.string())
      .describe("Key tensions or conflicts identified"),
    patterns: z.array(z.string()).describe("Recurring patterns observed"),
  }),
  card_interpretations: z.array(
    z.object({
      card_id: z.string(),
      position_id: z.string(),
      reversed: z.boolean(),
      interpretation: z
        .string()
        .describe("Position-specific interpretation of this card"),
      key_insight: z.string().describe("One-line key insight"),
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
  branches: z.array(
    z.object({
      id: z.string(),
      action: z.string().describe("Short action label"),
      action_description: z
        .string()
        .describe("Detailed description of this action path"),
      likelihood: likelihoodSchema,
      timeline: z.object({
        h24: z.string().describe("What happens within 24 hours"),
        d3: z.string().describe("What happens within 3 days"),
        d7: z.string().describe("What happens within 7 days"),
        d30: z.string().describe("What happens within 30 days"),
      }),
      trigger_conditions: z
        .array(z.string())
        .describe("What makes this path more likely"),
      risks: z.array(z.string()).describe("Risks associated with this path"),
    })
  ),
  high_confidence_trends: z
    .array(z.string())
    .describe("Trends that hold across most branches"),
  weak_signals: z
    .array(z.string())
    .describe("Subtle indicators worth watching"),
  uncertainty_notes: z
    .array(z.string())
    .describe("Explicit acknowledgments of uncertainty"),
  disclaimer: z
    .string()
    .describe("Reminder that this is narrative projection, not prophecy"),
});

export type ProjectionResult = z.infer<typeof projectionResultSchema>;
