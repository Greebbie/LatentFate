"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BranchMap } from "@/components/result/branch-map";
import { RevealedCard } from "@/components/card/tarot-card";
import type { ProjectionResult } from "@/lib/engine/schemas";
import type { ReadingSession } from "@/lib/store";
import { getCurrentSession, saveCurrentSession, getProviderConfig, addToHistory } from "@/lib/store";

export default function ResultPage() {
  const router = useRouter();
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [projection, setProjection] = useState<ProjectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const runProjection = useCallback(async () => {
    const currentSession = getCurrentSession();
    const config = getProviderConfig();

    if (!currentSession || !currentSession.reading || !config) {
      router.push("/");
      return;
    }

    setSession(currentSession);

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/projection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentSession.question,
          background: currentSession.background,
          cards: currentSession.cards,
          reading: currentSession.reading,
          providerId: config.providerId,
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          model: config.model,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Projection failed");
      }

      setProjection(result.data);
      const completed = { ...currentSession, projection: result.data };
      saveCurrentSession(completed);
      addToHistory(completed);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    runProjection();
  }, [runProjection]);

  const handleNewReading = () => {
    router.push("/");
  };

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-12">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-2"
        >
          <h2 className="font-mono text-lg tracking-[0.25em] text-foreground/80">
            {isLoading ? "推演中" : "PROJECTION"}
          </h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
            {isLoading
              ? "正在模拟分支路径..."
              : "分支轨迹投影已生成"}
          </p>
        </motion.div>

        {/* Question + Cards context */}
        {session && session.cards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="text-center">
              <p className="text-sm text-foreground/60 italic">
                &ldquo;{session.question}&rdquo;
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              {session.cards.map((drawn) => (
                <div
                  key={drawn.card.id}
                  className="flex flex-col items-center gap-1"
                >
                  <RevealedCard
                    card={drawn.card}
                    reversed={drawn.reversed}
                    small
                  />
                  <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30">
                    {drawn.position.labelZh}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border border-latent-blue/30 border-t-latent-blue rounded-full"
            />
            <span className="text-xs font-mono text-muted-foreground/40">
              推演引擎运行中...
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-3 py-8"
          >
            <p className="text-xs text-confidence-unlikely">{error}</p>
            <button
              onClick={runProjection}
              className="text-xs font-mono text-latent-blue/60 hover:text-latent-blue transition-colors"
            >
              重试
            </button>
          </motion.div>
        )}

        {/* Projection results */}
        {projection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BranchMap projection={projection} />
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-8 border-t border-border/20">
          <button
            onClick={handleNewReading}
            className="px-6 py-2.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-colors font-mono text-xs uppercase tracking-[0.15em]"
          >
            新的观测
          </button>
        </div>
      </div>
    </main>
  );
}
