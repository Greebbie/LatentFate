import { NextResponse } from "next/server";
import { z } from "zod";
import { createProvider } from "@/lib/providers";
import { performProjection } from "@/lib/engine/projection";
import { readingResultSchema } from "@/lib/engine/schemas";
import type { DrawnCard } from "@/lib/tarot/types";

const requestSchema = z.object({
  question: z.string().min(1),
  background: z.string().optional(),
  cards: z.array(
    z.object({
      card: z.object({
        id: z.string(),
        number: z.number(),
        name: z.string(),
        nameZh: z.string(),
        arcana: z.enum(["major", "minor"]),
        suit: z
          .enum(["wands", "cups", "swords", "pentacles"])
          .nullable(),
        element: z.string().nullable(),
        upright: z.object({
          keywords: z.array(z.string()),
          meaning: z.string(),
        }),
        reversed: z.object({
          keywords: z.array(z.string()),
          meaning: z.string(),
        }),
        symbolism: z.string(),
        glyph: z.string(),
      }),
      position: z.object({
        id: z.string(),
        label: z.string(),
        labelZh: z.string(),
        semantics: z.string(),
        index: z.number(),
      }),
      reversed: z.boolean(),
    })
  ),
  reading: readingResultSchema,
  providerId: z.string(),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  model: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);

    const provider = createProvider({
      providerId: parsed.providerId,
      apiKey: parsed.apiKey,
      baseUrl: parsed.baseUrl,
    });

    const result = await performProjection(
      {
        question: parsed.question,
        background: parsed.background,
        cards: parsed.cards as DrawnCard[],
        reading: parsed.reading,
      },
      provider,
      parsed.model
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message =
      error instanceof z.ZodError
        ? `Validation error: ${error.issues.map((e) => e.message).join(", ")}`
        : error instanceof Error
          ? error.message
          : "An unexpected error occurred";

    const status = error instanceof z.ZodError ? 400 : 500;

    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
