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
    const isInputValidation = error instanceof z.ZodError;
    const errorMsg = error instanceof Error ? error.message : "";
    const isJsonExtraction = errorMsg.includes("Failed to extract JSON");
    const isSchemaValidation =
      !isInputValidation &&
      (errorMsg.includes("expected") ||
        errorMsg.includes("Required") ||
        errorMsg.includes("invalid"));

    let message: string;
    let status: number;

    if (isInputValidation) {
      message = `Validation error: ${error.issues.map((e: z.ZodIssue) => e.message).join(", ")}`;
      status = 400;
    } else if (isJsonExtraction) {
      message = "推演结果解析失败，模型输出格式异常，请重试";
      status = 502;
    } else if (isSchemaValidation) {
      message = "推演结果结构不完整，模型输出缺少必要字段，请重试";
      status = 502;
    } else {
      message = errorMsg || "An unexpected error occurred";
      status = 500;
    }

    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
