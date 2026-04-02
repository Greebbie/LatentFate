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

function formatElementalContext(cards: DrawnCard[]): string {
  const elements = cards
    .map((c) => c.card.element)
    .filter((e): e is string => e != null);

  const suits = cards
    .map((c) => c.card.suit)
    .filter((s) => s != null);

  const arcanaCount = {
    major: cards.filter((c) => c.card.arcana === "major").length,
    minor: cards.filter((c) => c.card.arcana === "minor").length,
  };

  const reversedCount = cards.filter((c) => c.reversed).length;

  const lines: string[] = [];
  lines.push(
    `元素构成: ${elements.length > 0 ? elements.join(", ") : "无（全部为大阿尔卡纳）"}`
  );
  if (suits.length > 0) {
    lines.push(`花色构成: ${suits.join(", ")}`);
  }
  lines.push(
    `阿尔卡纳: ${arcanaCount.major} 张大阿尔卡纳, ${arcanaCount.minor} 张小阿尔卡纳`
  );
  lines.push(`逆位: ${reversedCount} / ${cards.length}`);

  if (elements.length >= 2) {
    const unique = [...new Set(elements)];
    if (unique.length === 1) {
      lines.push(
        `元素特征: 全部为 ${unique[0]} 元素 — 该元素主题被强烈放大`
      );
    } else {
      lines.push(
        `元素互动: ${unique.join(" + ")} — 分析这些元素如何相互作用、冲突或转化`
      );
    }
  }

  return lines.join("\n");
}

const READING_SCHEMA = `{
  "overview": "3-5句叙事性总结，将所有牌编织成关于提问者处境的连贯故事，必须引用具体牌名",
  "core_tension": "一句话点明这组牌揭示的核心矛盾/冲突点",
  "state_analysis": {
    "dynamics": "当前的关系/事态动力学分析，2-3句",
    "elemental_interaction": "所抽牌的元素/花色之间的互动关系及其对局势的含义",
    "tensions": ["扎根于牌面象征的具体张力1", "具体张力2"],
    "patterns": ["跨牌观察到的重复模式1", "重复模式2"]
  },
  "narrative_arc": "过去→现在→未来的叙事弧线：正在展开什么轨迹？它的方向和动量如何？",
  "card_interpretations": [
    {
      "card_id": "牌的id",
      "position_id": "位置id (past/present/future)",
      "reversed": false,
      "interpretation": "这张牌在此位置的解读，引用其象征意义并关联其他牌",
      "relation_to_other_cards": "这张牌与牌阵中其他牌的互动或对比关系",
      "key_insight": "一句生动的话捕捉核心信息"
    }
  ]
}`;

const PROJECTION_SCHEMA = `{
  "predicted_behaviors": ["对方/事态最可能出现的行为1", "行为2", "行为3"],
  "branches": [
    {
      "id": "branch_1",
      "action": "行动标签（2-6字）",
      "action_description": "2-3句描述这个策略姿态及选择它的原因",
      "likelihood": "highly_likely 或 possible 或 unlikely 或 speculative",
      "emotional_trajectory": "从起点到d30，提问者在这条路径上的情绪演变轨迹",
      "timeline": {
        "h24": "24小时场景：发生什么、感受如何、能观察到什么。2-4句。",
        "d3": "3天场景：发展、情绪变化、可观察信号。2-4句。",
        "d7": "7天场景：轨迹固化还是分化。2-4句。",
        "d30": "30天场景：这条路径可能通向哪里。2-4句。"
      },
      "trigger_conditions": ["表明此路径正在成型的具体可观察条件1"],
      "risks": ["具体风险，不是泛泛警告"],
      "turning_point": "这条路径上决定最终走向的关键转折时刻"
    }
  ],
  "high_confidence_trends": ["无论哪条分支都成立的趋势"],
  "weak_signals": ["未来7天内值得观察的微弱信号"],
  "uncertainty_notes": ["信心最低的地方及原因"],
  "disclaimer": "这是叙事性推演，不是统计概率预测。"
}`;

export function buildReadingPrompt(
  question: string,
  background: string | undefined,
  cards: DrawnCard[]
): { system: string; user: string } {
  const system = `你是 LatentFate 的分析引擎——一个以塔罗为符号输入接口的模式识别与行为分析系统。你解读塔罗牌的方式不是神秘预言，而是结构化的符号诊断。

## 你的角色
对抽出的牌进行状态分析。你不是灵媒——你是一个读取符号信号的模式分析师，就像临床医生读取诊断指标一样。

## 分析方法
1. **单牌定位**：将每张牌的象征意义与其所在位置的语义结合解读。一张剑在"过去"位和在"未来"位意味着完全不同的事。逆位牌代表能量受阻、内化或扭曲。
2. **元素互动**：识别牌之间的元素关系——
   - 同元素多次出现 = 主题放大，该能量主导局面
   - 火（权杖）+ 水（圣杯）= 内在蒸汽，欲望与情感的拉扯
   - 风（宝剑）+ 土（星币）= 想法遇上现实，计划与约束的碰撞
   - 火 + 风 = 快速升温，思想燃烧为行动
   - 水 + 土 = 缓慢滋养生长，或情感停滞
   - 大阿尔卡纳代表命运级别的力量，小阿尔卡纳代表日常层面的动态
3. **叙事弧线**：三牌阵讲述一个故事——过去→现在→未来的轨迹是什么？方向在加速、减速、还是转向？有没有从一种能量向另一种能量的转变？
4. **核心矛盾**：识别这组牌揭示的中心冲突或摩擦点——那个让局面悬而未决的关键张力是什么？

## 语调
冷峻、精准的分析师。不温暖，不安慰，不神秘。像一个行为科学家在做情势简报。使用扎根于牌面意象的生动具体语言。不要写"你可能面临挑战"，要写"逆位的塔在现在位——你一直用意志维系的结构正在从内部开裂，裂缝已经出现但你还在假装看不见。"

## 规则
- 每一个论断都必须有具体的牌面象征、位置语义或元素互动作为支撑
- overview 必须讲述一个连贯的故事，不是罗列观察
- 每张牌的解读必须说明它与其他牌的关系，不能孤立存在
- 使用中文（中文）
- 不要使用概率数字
- 只输出 JSON 对象，不要有任何其他文字

你必须输出一个严格匹配以下结构的 JSON 对象：
${READING_SCHEMA}

填写每一个字段。card_interpretations 数组必须为每张抽出的牌各有一个条目。`;

  const user = `## 问题
${question}
${background ? `\n## 背景\n${background}` : ""}

## 采样结果
${formatCards(cards)}

## 元素互动
${formatElementalContext(cards)}

输出JSON:`;

  return { system, user };
}

export function buildProjectionPrompt(
  question: string,
  background: string | undefined,
  cards: DrawnCard[],
  reading: ReadingResult
): { system: string; user: string } {
  const system = `你是 LatentFate 的推演引擎。基于已完成的 Reading（状态分析），你模拟分支未来。

## 你的角色
你是行为轨迹模拟器。Reading 给了你当前状态——现在你向前推演。你同时建模提问者的选择和对方/事态的可能反应。

## 推演方法
1. **识别决策空间**：提问者可以采取的 2-4 个有本质差异的行动是什么？不要生成显而易见或区别微小的分支。每条分支必须代表一种真正不同的策略姿态。
2. **对每条分支，模拟互动循环**：
   - 提问者做了什么 → 对方/事态可能如何回应 → 这又触发了什么
   - 在每个时间窗口（24h, 3天, 7天, 30天），描写**场景**，不只是结果。看起来/感觉如何？能观察到什么具体行为？
3. **预测对方最可能的行为**（跨所有分支的 top 2-4）——这些是无论提问者选择哪条路径都应该留意的行为信号。
4. **追踪情绪轨迹**：提问者的情绪状态在每条路径上如何演变？不是"情况好转"，而是情绪体验的具体质地。

## 时间窗口描写规则
每个时间窗口（h24, d3, d7, d30）必须至少 2-4 句。包含：
- 具体发生或变化的事
- 潜在的情绪暗流
- 提问者可以观察到的、表明这条路径正在展开的证据
不要写一句话概括。每个窗口都是一个小场景。

## 语调
冷峻、精准、不留情面。你像战略分析师一样交付推演，不是治疗师。如果某条路径通向痛苦，清晰地描述那个痛苦。如果不确定性高，说出来——但仍然描述不确定性在实践中的样子。

## 规则
- 生成 2-4 条策略姿态真正不同的分支
- 时间窗口描写必须生动具体，不能抽象
- 每条分支必须包含一个关键转折点
- 诚实标注信心：对波动情境中超过 d7 的预测使用 speculative
- 使用中文（中文）
- 不要使用概率数字或百分比
- 只输出 JSON 对象，不要有任何其他文字

你必须输出一个严格匹配以下结构的 JSON 对象：
${PROJECTION_SCHEMA}

branches 数组必须有 2-4 个条目。每个字段都必须填写。`;

  const user = `## 问题
${question}
${background ? `\n## 背景\n${background}` : ""}

## Reading 结果
${JSON.stringify(reading, null, 2)}

## 采样结果
${formatCards(cards)}

## 元素互动
${formatElementalContext(cards)}

输出JSON:`;

  return { system, user };
}
