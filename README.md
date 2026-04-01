# LatentFate

> **Everything can be predicted. We learned that from machine learning.**
>
> *Results are projections, not prophecies.*
<img width="1482" height="1356" alt="1d2c638a01bc8a7c46259c56829f1f85" src="https://github.com/user-attachments/assets/74953cfa-1ce4-47d6-8855-dee0cd18c7c1" />

塔罗不是占卜工具，而是符号输入接口。LatentFate 是一个以塔罗为符号输入的未来行为与关系轨迹推演引擎。

## 核心流程

1. **提问** — 输入问题和背景描述
2. **采样** — 从潜空间中选择种子，去噪揭示牌面
3. **Reading** — LLM 解析牌阵，输出结构化状态分析
4. **Projection** — 基于 Reading 的分支推演，输出不同行动路径、时间窗口、可信度



| | 普通塔罗 AI | LatentFate |
|---|---|---|
| 核心功能 | 解牌（文案生成） | 解牌 + 分支结果轨迹推演 |
| 输出格式 | 散文段落 | 结构化 JSON |
| 结论形式 | 单一结论 | if/else 分支路径 |
| 时间维度 | 无 | 24h / 3d / 7d / 30d |
| 不确定性 | 假装绝对 | 明确标注 confidence level |

## 技术栈

- **框架**: Next.js 15 + TypeScript + Tailwind CSS
- **UI**: shadcn/ui + Framer Motion
- **LLM**: 多 Provider 支持（Claude / OpenAI / MiniMax / Qwen / Ollama）
- **牌面**: 78 张全息线框风格塔罗牌
- **存储**: localStorage（客户端）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000，先到「设置」页配置 LLM Provider 和 API Key。

## 项目结构

```
app/                    # Next.js 页面
  page.tsx              # 首页（输入问题）
  reading/page.tsx      # 采样 + 解牌
  result/page.tsx       # 推演结果
  settings/page.tsx     # LLM 配置
  api/reading/          # Reading API
  api/projection/       # Projection API
lib/
  engine/               # 推演引擎（schemas, prompts, pipeline）
  providers/            # LLM 多 Provider 抽象层
  tarot/                # 78 张牌数据 + 牌阵 + 采样器
components/
  spread/               # 潜空间采样器
  card/                 # 牌面组件
  result/               # 分支地图 + 解牌摘要
data/cards.json         # 78 张塔罗牌完整数据
public/cards/           # AI 生成的牌面图片
```

## 许可证

MIT
