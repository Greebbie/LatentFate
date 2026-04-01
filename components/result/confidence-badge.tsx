"use client";

import type { Likelihood } from "@/lib/engine/schemas";

const CONFIDENCE_CONFIG: Record<
  Likelihood,
  { label: string; labelZh: string; color: string; symbol: string }
> = {
  highly_likely: {
    label: "Highly Likely",
    labelZh: "高度可能",
    color: "text-confidence-high border-confidence-high/30 bg-confidence-high/5",
    symbol: "●",
  },
  possible: {
    label: "Possible",
    labelZh: "有可能",
    color:
      "text-confidence-possible border-confidence-possible/30 bg-confidence-possible/5",
    symbol: "○",
  },
  unlikely: {
    label: "Unlikely",
    labelZh: "不太可能",
    color:
      "text-confidence-unlikely border-confidence-unlikely/30 bg-confidence-unlikely/5",
    symbol: "◇",
  },
  speculative: {
    label: "Speculative",
    labelZh: "推测性",
    color:
      "text-confidence-speculative border-confidence-speculative/30 bg-confidence-speculative/5",
    symbol: "◆",
  },
};

interface ConfidenceBadgeProps {
  likelihood: Likelihood;
}

export function ConfidenceBadge({ likelihood }: ConfidenceBadgeProps) {
  const config = CONFIDENCE_CONFIG[likelihood];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-wider ${config.color}`}
    >
      <span>{config.symbol}</span>
      <span>{config.labelZh}</span>
    </span>
  );
}
