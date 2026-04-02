import type { DrawnCard } from "@/lib/tarot/types";
import type { ReadingResult, ProjectionSkeleton } from "./schemas";

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

const SKELETON_SCHEMA = `{
  "predicted_behaviors": ["对方/事态最可能出现的行为1", "行为2"],
  "branches": [
    {
      "id": "branch_1",
      "action": "行动标签（2-6字）",
      "action_description": "2-3句描述这个策略姿态及选择它的原因",
      "likelihood": "highly_likely 或 possible 或 unlikely 或 speculative"
    }
  ],
  "high_confidence_trends": ["无论哪条分支都成立的趋势"],
  "weak_signals": ["未来7天内值得观察的微弱信号"],
  "uncertainty_notes": ["信心最低的地方及原因"],
  "disclaimer": "叙事性推演，不是统计概率预测"
}`;

const BRANCH_DETAIL_SCHEMA = `{
  "emotional_trajectory": "从起点到d30，提问者在这条路径上的情绪演变轨迹",
  "timeline": {
    "h24": "24小时场景：发生什么、感受如何、能观察到什么。2-3句。",
    "d3": "3天场景：发展、情绪变化、可观察信号。2-3句。",
    "d7": "7天场景：轨迹固化还是分化。2-3句。",
    "d30": "30天场景：这条路径可能通向哪里。2-3句。"
  },
  "trigger_conditions": ["表明此路径正在成型的具体可观察条件"],
  "risks": ["具体风险"],
  "turning_point": "这条路径上决定最终走向的关键转折时刻"
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

export function buildSkeletonPrompt(
  question: string,
  background: string | undefined,
  cards: DrawnCard[],
  reading: ReadingResult
): { system: string; user: string } {
  const system = `你是 LatentFate 的推演引擎。基于已完成的 Reading，你识别提问者面前的决策空间。

## 任务
分析提问者可以采取的 2-3 个有本质差异的策略姿态，以及跨分支的行为预测和趋势判断。
这是第一阶段——只需要分支框架和总体分析，详细时间线将在下一阶段生成。

## 方法
1. **识别决策空间**：2-3 个真正不同的策略姿态。不要生成显而易见或区别微小的分支。
2. **预测行为信号**：无论提问者选择哪条路径都应留意的 2-3 个行为信号。
3. **标注信心**：诚实标注每条分支的 likelihood。

## 语调
冷峻、精准的战略分析师。

## 规则
- branches 数组必须有 2-3 个条目
- 使用中文
- 只输出 JSON

输出结构：
${SKELETON_SCHEMA}`;

  const user = `## 问题
${question}
${background ? `\n## 背景\n${background}` : ""}

## Reading 结果
${JSON.stringify(reading)}

## 采样结果
${formatCards(cards)}

## 元素互动
${formatElementalContext(cards)}

输出JSON:`;

  return { system, user };
}

export function buildBranchDetailPrompt(
  question: string,
  background: string | undefined,
  cards: DrawnCard[],
  reading: ReadingResult,
  branch: ProjectionSkeleton["branches"][number],
  allBranches: ProjectionSkeleton["branches"]
): { system: string; user: string } {
  const system = `你是 LatentFate 的推演引擎。你正在为一条特定的策略分支生成详细的时间线推演。

## 任务
基于给定的策略姿态和 Reading 上下文，模拟这条路径在不同时间窗口的具体展开。

## 描写规则
每个时间窗口（h24, d3, d7, d30）写 2-3 句：
- 具体发生或变化的事
- 潜在的情绪暗流
- 提问者可以观察到的证据
每个窗口都是一个小场景，不是一句话概括。

## 语调
冷峻、精准、不留情面。战略分析师，不是治疗师。

## 规则
- 时间窗口描写必须生动具体
- 必须包含一个关键转折点
- 对波动情境中超过 d7 的预测保持谨慎
- 使用中文
- 只输出 JSON

输出结构：
${BRANCH_DETAIL_SCHEMA}`;

  const otherBranches = allBranches
    .filter((b) => b.id !== branch.id)
    .map((b) => `- ${b.action}: ${b.action_description}`)
    .join("\n");

  const user = `## 问题
${question}
${background ? `\n## 背景\n${background}` : ""}

## 当前分支
行动: ${branch.action}
描述: ${branch.action_description}
可能性: ${branch.likelihood}

## 其他分支（供对比）
${otherBranches}

## Reading 上下文
${reading.overview}
核心矛盾: ${reading.core_tension}
叙事弧线: ${reading.narrative_arc}

## 牌面
${formatCards(cards)}

输出JSON:`;

  return { system, user };
}
