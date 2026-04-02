<p align="center">
  <img width="1482" height="1356" alt="LatentFate" src="https://github.com/user-attachments/assets/74953cfa-1ce4-47d6-8855-dee0cd18c7c1" />
</p>

<h1 align="center">LatentFate</h1>

<p align="center">
  <strong>Everything can be predicted. We learned that from machine learning.</strong><br/>
  <sub>Tarot is the interface. Prediction is the engine.</sub>
</p>

---

78 张塔罗牌。每一张都是一个被蒸馏了几百年的人类处境原型。

恋人、高塔、命运之轮、倒吊人——这不是玄学，这是模式。和所有训练数据一样，只不过这份数据集存在了 600 年，标注者是全人类。

LatentFate 把塔罗当作符号输入接口，做了一件很自然的事：采样，读取状态，然后推演轨迹。和你用过的任何一个 sequence model 没有本质区别——给定当前状态向量，输出后续最可能的路径。

只不过这次推演的是你的命运。

> *Results are projections, not prophecies.*

---
### I highly reconmmand Minimax M2.7 for trying :) 
## What It Does

### Reading — 状态诊断

引擎不会告诉你"你最近运势不错"。它会告诉你：

> 逆位的塔在现在位——你一直用意志维系的结构正在从内部开裂，裂缝已经出现但你还在假装看不见。权杖七的防御姿态和星币四的收缩能量形成了一个自我强化的循环：你越是防守，就越没有能量去创造新的连接。

每张牌在牌阵的叙事弧线中找到自己的位置。火遇水是蒸汽还是熄灭，风遇土是飞翔还是坠落。最终提炼出一个核心矛盾——那个让局面悬而未决的东西。

### Projection — 轨迹推演

不是给你一个答案。是给你一张命运的路径图：

- **2-4 条分支路径** — 真正不同的命运走向
- **对方最可能的行为** — 无论你选哪条路，对方大概率会怎么做
- **24h / 3d / 7d / 30d** — 每个时间窗口是一段场景描写，不是一句话
- **情绪轨迹** — 你会经历什么样的情绪演变
- **关键转折点** — 那个决定一切走向的时刻
- **弱信号** — 命运提前泄露的线索

---

## Why It's Different

| | Every other tarot AI | LatentFate |
|---|---|---|
| What it does | Interprets cards | State diagnosis + trajectory simulation |
| Output | A paragraph of prose | Structured branching analysis |
| Conclusion | One answer | 2-4 divergent fate paths |
| Time | None | 24h / 3d / 7d / 30d |
| The other person | Ignored | Predicted behaviors |
| Emotions | Not tracked | Emotional arc per branch |
| Uncertainty | Disguised | Explicitly marked |

---

## How It Works

1. **Ask** — 输入问题和背景
2. **Sample** — 78 个匿名种子漂浮在潜空间中。点击，噪声退散，牌面显现
3. **Read** — 引擎分析元素互动、叙事弧线、跨牌关系，输出状态诊断
4. **Project** — 引擎模拟 2-4 条分支未来，配有时间线、情绪轨迹、转折点

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to **Settings** to configure your LLM provider.

### Supported Providers

| Provider | Models | Notes |
|----------|--------|-------|
| **Anthropic Claude** | Opus 4, Sonnet 4, Haiku 4 | Best quality |
| **OpenAI** | GPT-4o, GPT-4.1 | Strong alternative |
| **MiniMax** | M1, M2.7 | Chinese-optimized |
| **Qwen** | qwen3-235b, qwen-plus | Alibaba Cloud |
| **Ollama** | Any local model | Free, private |

API keys are stored in localStorage only.

---

## Tech Stack

- **Framework**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + Framer Motion
- **Validation**: Zod 4 (structured LLM output)
- **Cards**: 78 custom holographic wireframe tarot cards
- **Storage**: Client-side only (localStorage)
- **LLM**: Multi-provider abstraction with structured output parsing

## Project Structure

```
app/                    # Next.js App Router
  page.tsx              # Home — question input
  reading/page.tsx      # Sampling + Reading phase
  result/page.tsx       # Projection results
  settings/page.tsx     # Provider configuration
  api/                  # Reading & Projection API endpoints
lib/
  engine/               # Core engine (prompts, schemas, pipelines)
  providers/            # Multi-provider LLM abstraction
  tarot/                # 78-card data, spreads, sampler
components/             # UI components (sampler, cards, results)
data/cards.json         # Complete 78-card tarot dataset
public/cards/           # AI-generated card artwork
```

---

## Disclaimer

This is an entertainment project. All readings and projections are AI-generated narrative simulations — not real predictions, not professional advice, not statements of fact. The future cannot actually be predicted by drawing cards. But you already knew that.

---

## License

MIT

---

<p align="center">
  <em>Everything can be predicted. The only question is whether you're ready to see it.</em>
</p>
