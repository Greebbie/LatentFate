"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LatentSampler } from "@/components/spread/latent-sampler";
import { RevealedCard } from "@/components/card/tarot-card";
import { ReadingSummary } from "@/components/result/reading-summary";
import { THREE_CARD_SPREAD } from "@/lib/tarot";
import type { DrawnCard } from "@/lib/tarot/types";
import type { ReadingResult } from "@/lib/engine/schemas";
import {
  getCurrentSession,
  saveCurrentSession,
  getProviderConfig,
} from "@/lib/store";

type Phase = "sampling" | "reading" | "complete";

export default function ReadingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("sampling");
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getCurrentSession();
    if (!session) {
      router.push("/");
      return;
    }
    setReady(true);
  }, [router]);

  const handleComplete = useCallback(
    async (cards: DrawnCard[]) => {
      setDrawnCards(cards);
      setPhase("reading");
      setIsLoading(true);
      setError(null);

      const session = getCurrentSession();
      const config = getProviderConfig();

      if (!session || !config) {
        setError("缺少会话或配置信息");
        setIsLoading(false);
        return;
      }

      saveCurrentSession({ ...session, cards });

      try {
        const response = await fetch("/api/reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: session.question,
            background: session.background,
            cards,
            providerId: config.providerId,
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
            model: config.model,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Reading failed");
        }

        setReading(result.data);
        setPhase("complete");

        saveCurrentSession({
          ...session,
          cards,
          reading: result.data,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(message);
        setIsLoading(false);
      }
    },
    []
  );

  const handleRetry = () => {
    if (drawnCards.length > 0) {
      handleComplete(drawnCards);
    }
  };

  const handleContinue = () => {
    router.push("/result");
  };

  if (!ready) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground/50 text-sm font-mono">
          初始化中...
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-8 overflow-hidden">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-2"
        >
          <h2 className="font-mono text-lg tracking-[0.25em] text-foreground/80">
            {phase === "sampling"
              ? "LATENT SPACE"
              : phase === "reading"
                ? "解析中"
                : "READING 完成"}
          </h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
            {phase === "sampling"
              ? "从潜空间中采样 — 点击牌阵抽取"
              : phase === "reading"
                ? "正在分析符号组合..."
                : "状态分析已完成"}
          </p>
        </motion.div>

        {/* Latent space sampler */}
        {phase === "sampling" && (
          <LatentSampler
            positions={THREE_CARD_SPREAD.positions}
            onComplete={handleComplete}
          />
        )}

        {/* Drawn cards display + loading */}
        {phase !== "sampling" && drawnCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex gap-6 justify-center">
              {drawnCards.map((drawn, i) => (
                <motion.div
                  key={drawn.card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex flex-col items-center gap-2"
                >
                  <RevealedCard card={drawn.card} reversed={drawn.reversed} />
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40">
                    {drawn.position.labelZh} / {drawn.position.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {isLoading && (
              <div className="flex items-center gap-3 pt-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border border-latent-blue/40 border-t-latent-blue rounded-full"
                />
                <span className="text-xs font-mono text-muted-foreground/50">
                  引擎运行中...
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-3"
          >
            <p className="text-xs text-confidence-unlikely">{error}</p>
            <button
              onClick={handleRetry}
              className="text-xs font-mono text-latent-blue/60 hover:text-latent-blue transition-colors"
            >
              重试
            </button>
          </motion.div>
        )}

        {/* Reading result */}
        {reading && (
          <>
            <div className="border-t border-border/30 pt-8">
              <ReadingSummary reading={reading} />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center pb-8"
            >
              <button
                onClick={handleContinue}
                className="px-8 py-3 rounded-lg bg-latent-blue/10 border border-latent-blue/20 text-latent-blue hover:bg-latent-blue/15 hover:border-latent-blue/30 transition-colors font-mono text-sm uppercase tracking-[0.2em]"
              >
                开始推演 →
              </button>
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}
