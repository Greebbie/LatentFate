"use client";

import { motion } from "framer-motion";
import type { ReadingResult } from "@/lib/engine/schemas";

interface ReadingSummaryProps {
  reading: ReadingResult;
}

export function ReadingSummary({ reading }: ReadingSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Overview */}
      <div className="space-y-2">
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-latent-blue/60">
          状态分析
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {reading.overview}
        </p>
      </div>

      {/* Dynamics */}
      <div className="space-y-2">
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
          当前动力学
        </h4>
        <p className="text-xs text-foreground/60 leading-relaxed pl-3 border-l border-latent-blue/15">
          {reading.state_analysis.dynamics}
        </p>
      </div>

      {/* Tensions & Patterns */}
      <div className="grid gap-4 md:grid-cols-2">
        {reading.state_analysis.tensions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-confidence-unlikely/50">
              核心张力
            </h4>
            <ul className="space-y-1">
              {reading.state_analysis.tensions.map((tension, i) => (
                <li
                  key={i}
                  className="text-xs text-foreground/50 pl-3 border-l border-confidence-unlikely/15"
                >
                  {tension}
                </li>
              ))}
            </ul>
          </div>
        )}
        {reading.state_analysis.patterns.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-latent-cyan/50">
              识别模式
            </h4>
            <ul className="space-y-1">
              {reading.state_analysis.patterns.map((pattern, i) => (
                <li
                  key={i}
                  className="text-xs text-foreground/50 pl-3 border-l border-latent-cyan/15"
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
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
          逐牌解析
        </h4>
        {reading.card_interpretations.map((interp) => (
          <div
            key={`${interp.card_id}-${interp.position_id}`}
            className="p-3 rounded-lg bg-card/30 border border-border/50 space-y-1"
          >
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono uppercase tracking-wider text-latent-blue/50">
                {interp.position_id}
              </span>
              {interp.reversed && (
                <span className="text-[8px] font-mono text-confidence-unlikely/40">
                  逆位
                </span>
              )}
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed">
              {interp.interpretation}
            </p>
            <p className="text-[10px] text-latent-cyan/40 italic">
              → {interp.key_insight}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
