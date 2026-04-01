"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfidenceBadge } from "./confidence-badge";
import type { ProjectionResult } from "@/lib/engine/schemas";

interface BranchMapProps {
  projection: ProjectionResult;
}

const TIMELINE_LABELS = [
  { key: "h24" as const, label: "24h" },
  { key: "d3" as const, label: "3天" },
  { key: "d7" as const, label: "7天" },
  { key: "d30" as const, label: "30天" },
];

export function BranchMap({ projection }: BranchMapProps) {
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Branch cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projection.branches.map((branch, index) => (
          <motion.div
            key={branch.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="border border-border rounded-lg p-4 bg-card/50 hover:bg-card/80 transition-colors cursor-pointer"
            onClick={() =>
              setExpandedBranch(
                expandedBranch === branch.id ? null : branch.id
              )
            }
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-mono text-sm text-foreground/90">
                {branch.action}
              </h4>
              <ConfidenceBadge likelihood={branch.likelihood} />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {branch.action_description}
            </p>
            <div className="mt-3 text-[9px] text-muted-foreground/40 uppercase tracking-wider">
              {expandedBranch === branch.id ? "▲ 收起" : "▼ 展开时间线"}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expanded timeline (Terminal Report style) */}
      <AnimatePresence>
        {expandedBranch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {projection.branches
              .filter((b) => b.id === expandedBranch)
              .map((branch) => (
                <div
                  key={branch.id}
                  className="border border-border rounded-lg bg-[#0a0a0f] p-5 font-mono text-xs space-y-4"
                >
                  <div className="text-latent-blue/60 text-[10px]">
                    {"// PROJECTION: "}{branch.action.toUpperCase()}
                  </div>

                  {/* Timeline */}
                  <div className="space-y-3">
                    {TIMELINE_LABELS.map(({ key, label }) => (
                      <div key={key} className="flex gap-3">
                        <span className="text-muted-foreground/50 w-8 shrink-0">
                          {label}
                        </span>
                        <span className="text-foreground/70 leading-relaxed">
                          {branch.timeline[key]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Trigger conditions */}
                  {branch.trigger_conditions.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-latent-cyan/50 text-[10px]">
                        {"// TRIGGER_CONDITIONS"}
                      </span>
                      <ul className="mt-1 space-y-1">
                        {branch.trigger_conditions.map((condition, i) => (
                          <li
                            key={i}
                            className="text-muted-foreground/60 pl-2"
                          >
                            → {condition}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risks */}
                  {branch.risks.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-confidence-unlikely/50 text-[10px]">
                        {"// RISKS"}
                      </span>
                      <ul className="mt-1 space-y-1">
                        {branch.risks.map((risk, i) => (
                          <li
                            key={i}
                            className="text-muted-foreground/60 pl-2"
                          >
                            ⚠ {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meta insights */}
      <div className="space-y-4 border-t border-border/30 pt-6">
        {projection.high_confidence_trends.length > 0 && (
          <div>
            <h5 className="text-[10px] uppercase tracking-[0.2em] text-confidence-high/60 mb-2">
              高确信趋势
            </h5>
            <ul className="space-y-1">
              {projection.high_confidence_trends.map((trend, i) => (
                <li
                  key={i}
                  className="text-xs text-foreground/60 pl-3 border-l border-confidence-high/20"
                >
                  {trend}
                </li>
              ))}
            </ul>
          </div>
        )}

        {projection.weak_signals.length > 0 && (
          <div>
            <h5 className="text-[10px] uppercase tracking-[0.2em] text-confidence-possible/60 mb-2">
              弱信号
            </h5>
            <ul className="space-y-1">
              {projection.weak_signals.map((signal, i) => (
                <li
                  key={i}
                  className="text-xs text-foreground/60 pl-3 border-l border-confidence-possible/20"
                >
                  {signal}
                </li>
              ))}
            </ul>
          </div>
        )}

        {projection.uncertainty_notes.length > 0 && (
          <div>
            <h5 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">
              不确定性标注
            </h5>
            <ul className="space-y-1">
              {projection.uncertainty_notes.map((note, i) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground/50 pl-3 border-l border-border/30"
                >
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground/30 italic text-center pt-4">
          {projection.disclaimer}
        </p>
      </div>
    </div>
  );
}
