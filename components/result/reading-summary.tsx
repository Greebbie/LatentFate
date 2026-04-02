"use client";

import { motion } from "framer-motion";
import type { ReadingResult } from "@/lib/engine/schemas";

interface ReadingSummaryProps {
  reading: ReadingResult;
  compact?: boolean;
}

export function ReadingSummary({ reading, compact }: ReadingSummaryProps) {
  if (compact) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-foreground/80 leading-relaxed">
          {reading.overview}
        </p>
        <p className="text-xs text-latent-cyan/70 italic border-l-2 border-latent-cyan/30 pl-3">
          {reading.core_tension}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Overview — hero text */}
      <div className="space-y-2">
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-latent-blue/60">
          状态分析
        </h3>
        <p className="text-base text-foreground/90 leading-relaxed">
          {reading.overview}
        </p>
      </div>

      {/* Core Tension — pullquote */}
      <div className="py-4 border-y border-latent-cyan/15">
        <p className="text-sm text-latent-cyan/80 text-center leading-relaxed italic">
          {reading.core_tension}
        </p>
      </div>

      {/* Narrative Arc */}
      <div className="space-y-2">
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-latent-blue/50">
          叙事弧线 — 过去 → 现在 → 未来
        </h4>
        <div className="relative pl-4">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-muted-foreground/20 via-latent-blue/40 to-latent-cyan/40" />
          <p className="text-sm text-foreground/75 leading-relaxed">
            {reading.narrative_arc}
          </p>
        </div>
      </div>

      {/* Dynamics */}
      <div className="space-y-2">
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
          当前动力学
        </h4>
        <p className="text-sm text-foreground/70 leading-relaxed pl-3 border-l border-latent-blue/20">
          {reading.state_analysis.dynamics}
        </p>
      </div>

      {/* Elemental Interaction */}
      <div className="space-y-2">
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-latent-blue/50">
          元素互动
        </h4>
        <p className="text-sm text-foreground/70 leading-relaxed pl-3 border-l border-latent-blue/20">
          {reading.state_analysis.elemental_interaction}
        </p>
      </div>

      {/* Tensions & Patterns */}
      <div className="grid gap-4 md:grid-cols-2">
        {reading.state_analysis.tensions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-confidence-unlikely/60">
              核心张力
            </h4>
            <ul className="space-y-1.5">
              {reading.state_analysis.tensions.map((tension, i) => (
                <li
                  key={i}
                  className="text-xs text-foreground/65 pl-3 border-l border-confidence-unlikely/20"
                >
                  {tension}
                </li>
              ))}
            </ul>
          </div>
        )}
        {reading.state_analysis.patterns.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-latent-cyan/60">
              识别模式
            </h4>
            <ul className="space-y-1.5">
              {reading.state_analysis.patterns.map((pattern, i) => (
                <li
                  key={i}
                  className="text-xs text-foreground/65 pl-3 border-l border-latent-cyan/20"
                >
                  {pattern}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Card interpretations */}
      <div className="space-y-3">
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
          逐牌解析
        </h4>
        {reading.card_interpretations.map((interp, index) => (
          <div
            key={`${interp.card_id}-${interp.position_id}`}
            className="p-4 rounded-lg bg-card/30 border border-border/50 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono uppercase tracking-wider text-latent-blue/60">
                {interp.position_id}
              </span>
              {interp.reversed && (
                <span className="text-[8px] font-mono text-confidence-unlikely/50">
                  逆位
                </span>
              )}
            </div>
            <p className="text-sm text-foreground/75 leading-relaxed">
              {interp.interpretation}
            </p>
            {/* Relation to other cards */}
            <p className="text-xs text-muted-foreground/60 leading-relaxed pl-3 border-l border-border/40">
              {interp.relation_to_other_cards}
            </p>
            <p className="text-xs text-latent-cyan/60 italic">
              → {interp.key_insight}
            </p>
            {/* Connecting line between cards */}
            {index < reading.card_interpretations.length - 1 && (
              <div className="flex justify-center pt-1">
                <div className="w-px h-4 bg-gradient-to-b from-border/40 to-transparent" />
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
