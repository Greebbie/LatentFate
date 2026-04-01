import type { DrawnCard } from "@/lib/tarot/types";
import type { ReadingResult } from "./schemas";

function formatCards(cards: DrawnCard[]): string {
  return cards
    .map((drawn) => {
      const orientation = drawn.reversed ? "Reversed" : "Upright";
      const meaning = drawn.reversed
        ? drawn.card.reversed
        : drawn.card.upright;
      return [
        `Position: ${drawn.position.label} (${drawn.position.labelZh})`,
        `Card: ${drawn.card.name} (${drawn.card.nameZh}) — ${orientation}`,
        `Position Semantics: ${drawn.position.semantics}`,
        `Keywords: ${meaning.keywords.join(", ")}`,
        `Meaning: ${meaning.meaning}`,
        `Symbolism: ${drawn.card.symbolism}`,
      ].join("\n");
    })
    .join("\n\n");
}

const READING_SCHEMA = `{
  "overview": "2-3句总结",
  "state_analysis": {
    "dynamics": "当前的关系/事态动力学分析",
    "tensions": ["核心张力1", "核心张力2"],
    "patterns": ["识别的模式1", "识别的模式2"]
  },
  "card_interpretations": [
    {
      "card_id": "牌的id",
      "position_id": "位置id (past/present/future)",
      "reversed": false,
      "interpretation": "这张牌在此位置的具体解读",
      "key_insight": "一句话核心洞察"
    }
  ]
}`;

const PROJECTION_SCHEMA = `{
  "branches": [
    {
      "id": "branch_1",
      "action": "行动标签（如：主动联系）",
      "action_description": "这条路径的详细描述",
      "likelihood": "highly_likely 或 possible 或 unlikely 或 speculative",
      "timeline": {
        "h24": "24小时内会发生什么",
        "d3": "3天内会发生什么",
        "d7": "7天内会发生什么",
        "d30": "30天内会发生什么"
      },
      "trigger_conditions": ["触发条件1", "触发条件2"],
      "risks": ["风险1", "风险2"]
    }
  ],
  "high_confidence_trends": ["跨所有分支都成立的趋势1"],
  "weak_signals": ["值得关注的微弱信号1"],
  "uncertainty_notes": ["不确定性说明1"],
  "disclaimer": "这是叙事性推演，不是统计概率预测。"
}`;

export function buildReadingPrompt(
  question: string,
  background: string | undefined,
  cards: DrawnCard[]
): { system: string; user: string } {
  const system = `You are the analysis engine of LatentFate, a symbolic forecasting system. You interpret tarot cards as symbolic inputs — not as mystical prophecy, but as a structured framework for pattern recognition and behavioral analysis.

Your role in this step is READING: analyze the drawn cards in context of the question to produce a structured state analysis.

Rules:
- Ground interpretations in the card symbolism and position semantics provided
- Identify relationship dynamics, tensions, and recurring patterns
- Be specific and concrete, not vague or generic
- Use the card's upright or reversed meaning based on its orientation
- Consider how cards interact with each other, not just individually
- Write in Chinese (中文) for all analysis content
- Do NOT use probability numbers — use qualitative language
- Do NOT include any thinking or explanation — output ONLY the JSON

You MUST respond with ONLY a JSON object matching this EXACT structure:
${READING_SCHEMA}

Fill in every field. The card_interpretations array must have one entry per card drawn.`;

  const user = `## 问题
${question}
${background ? `\n## 背景\n${background}` : ""}

## 采样结果
${formatCards(cards)}

输出JSON:`;

  return { system, user };
}

export function buildProjectionPrompt(
  question: string,
  background: string | undefined,
  cards: DrawnCard[],
  reading: ReadingResult
): { system: string; user: string } {
  const system = `You are the projection engine of LatentFate, a symbolic forecasting system. Based on a completed Reading (state analysis), you generate branching projections of possible futures.

Your role in this step is PROJECTION: simulate different action paths and their likely outcomes across time windows.

Rules:
- Generate 2-4 distinct action branches (different strategies the querent could take)
- For each branch, project outcomes at 4 time windows: 24h, 3 days, 7 days, 30 days
- Assign qualitative likelihood: highly_likely, possible, unlikely, or speculative
- Identify trigger conditions (what makes each path more likely)
- Note risks for each path
- Identify trends that hold across all branches (high confidence)
- Flag weak signals — subtle indicators worth watching
- Be honest about uncertainty — mark what's speculative
- Write in Chinese (中文) for all projection content
- Do NOT use probability numbers or percentages
- Do NOT include any thinking or explanation — output ONLY the JSON

You MUST respond with ONLY a JSON object matching this EXACT structure:
${PROJECTION_SCHEMA}

The branches array must have 2-4 entries. Every field must be filled.`;

  const user = `## 问题
${question}
${background ? `\n## 背景\n${background}` : ""}

## Reading 结果
${JSON.stringify(reading, null, 2)}

## 采样结果
${formatCards(cards)}

输出JSON:`;

  return { system, user };
}
