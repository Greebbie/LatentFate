# LatentFate — Project Brief

> **Everything can be predicted. We learned that from machine learning.**
>
> *Results are projections, not prophecies.*

---

## 一句话定位

**LatentFate 不是 AI 塔罗解牌器，而是一个以塔罗为符号输入接口的未来行为与关系轨迹推演引擎。**

**Tarot is the interface. Prediction is the engine.**

---

## 项目概述

一个开源的 tarot-powered symbolic forecasting engine。用户通过塔罗牌抽牌提供符号输入，系统基于牌阵语义建立当前状态模型，然后对未来行为、关系轨迹、事件走向进行分支推演。

核心流程分两阶段：

1. **Reading（解牌）**：基于牌阵对当前状态做结构化解读，输出关系动力学 snapshot
2. **Projection（推演）**：基于 Reading 结果 + 用户输入的具体事件/决策点，运行分支模拟，输出不同路径、时间窗口、相对可能性

---

## 核心差异化（vs 普通塔罗 AI 项目）

普通塔罗项目：提问 → 抽牌 → 按牌义生成解读文案 → 结束

LatentFate：

| 维度 | 普通塔罗 AI | LatentFate |
|------|------------|------------|
| 核心功能 | 解牌（文案生成） | 解牌 + 事件推演（分支模拟） |
| 输出格式 | 散文段落 | 结构化输出（见下方 schema） |
| 结论形式 | 单一结论 | if/else 分支路径 |
| 时间维度 | 无 | 24h / 3d / 7d / 30d 窗口 |
| 不确定性 | 装成绝对预言 | 明确标注 confidence level |
| 可验证性 | 无 | forecast tracker（可回访标记） |

---

## 技术架构（三层）

### 外层 — Tarot Interface（塔罗交互层）

- 抽牌界面，保留仪式感和可玩性
- 支持不同牌阵（如凯尔特十字、三牌阵、关系阵等）
- 正逆位识别

### 中层 — Symbolic Semantic System（符号语义层）

- 78 张塔罗牌数据（大小阿尔卡纳）
- 每张牌的正位/逆位含义
- 不同牌阵的 position semantics（每个位置代表什么）
- 不同问题类型的 spread 模板（感情、事业、决策等）

### 内层 — Projection Engine（推演引擎）

- 当前关系/事件状态抽取（Reading 阶段）
- 行为趋势预测
- 时间窗口推演（24h / 3d / 7d / 30d）
- 分支模拟（不同策略 → 不同路径）
- 不确定性标注
- Forecast tracker（预测记录 + 可回访验证）

---

## 结构化输出 Schema

每次完整推演的输出应包含以下结构：

```
1. Reading（解牌）
   - 牌阵总览（抽到的牌、位置、正逆位）
   - 当前状态/关系动力学分析

2. Projection（推演）
   - 事件/决策点描述
   - 对方/事态最可能出现的行为（top 3）
   - 时间窗口
     - 24h 内
     - 3 天内
     - 7 天内
     - 30 天内
   - 行为触发条件
   - 分支模拟
     - 方案 A（如：主动联系）→ 路径描述 + 可能性等级
     - 方案 B（如：保持沉默）→ 路径描述 + 可能性等级
     - 方案 C（如：直接摊牌）→ 路径描述 + 可能性等级
   - 不确定性标注
     - high-confidence trend
     - weak signal
     - projection-heavy interpretation
     - speculative branch

3. Forecast Points（可验证预测点）
   - 系统生成的具体预测条目
   - 用户后续可回访标记：发生了 / 没发生 / 部分发生
```

---

## 项目气质与设计原则

- **冷、现代、克制**：不是土味玄学产品
- **半哲学、半 ML、半叙事模拟**：世界观是"模式识别 + 符号推演"，不是"通灵"
- **诚实**：所有输出都应明确这是 narrative projection，不是 statistical probability
- **结构化优先**：输出尽量结构化，避免大段散文
- **不确定性是 feature**：明确区分不同 confidence level，这是项目最核心的气质之一

---

## 不要做的事

- ❌ 普通 AI 塔罗解牌网页（抽牌 → 长文案 → 结束）
- ❌ 只强调"神准""玄学""治愈"
- ❌ 只是 UI 好看但逻辑没新意
- ❌ 输出具体概率数字（如"73%"），用定性等级代替（highly likely / possible / unlikely / speculative）
- ❌ 假装预测是统计学意义上的概率

---

## 技术栈建议

- **语言**：TypeScript / Python（根据实际选型）
- **LLM 调用**：通过 structured prompt pipeline 调用 LLM，分 Reading 和 Projection 两阶段
- **塔罗数据**：内置 78 张牌 + 牌阵 + position semantics 的 JSON 数据
- **Forecast Tracker**：本地存储或轻量 DB，记录预测点 + 用户回访标记
- **开源**：GitHub 公开仓库，MIT License

---

## 项目名

**LatentFate**

Repo name: `latentfate`

Tagline: *Everything can be predicted. We learned that from machine learning.*

Disclaimer: *Results are projections, not prophecies.*
