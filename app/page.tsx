"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { QuestionForm } from "@/components/input/question-form";
import {
  saveCurrentSession,
  generateSessionId,
  getProviderConfig,
  getHistory,
  type ReadingSession,
} from "@/lib/store";

function HistoryItem({ session }: { session: ReadingSession }) {
  const date = new Date(session.createdAt);
  const cardNames = session.cards
    .map((c) => c.card.nameZh)
    .join(" · ");

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/30 bg-card/20 hover:bg-card/40 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground/70 truncate">{session.question}</p>
        <p className="text-[10px] text-muted-foreground/40 mt-1 truncate">
          {cardNames}
        </p>
      </div>
      <span className="text-[9px] text-muted-foreground/30 font-mono shrink-0">
        {date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
      </span>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [history, setHistory] = useState<ReadingSession[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleSubmit = (question: string, background?: string) => {
    const config = getProviderConfig();
    if (!config) {
      router.push("/settings");
      return;
    }

    saveCurrentSession({
      id: generateSessionId(),
      question,
      background,
      cards: [],
      createdAt: new Date().toISOString(),
    });

    router.push("/reading");
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-4"
        >
          <h1 className="font-mono text-3xl tracking-[0.3em] text-foreground/90">
            LATENTFATE
          </h1>
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            Symbolic Forecasting Engine
          </p>
          <div className="w-12 h-px bg-latent-blue/30 mx-auto" />
          <p className="text-sm text-muted-foreground/60 italic max-w-md mx-auto">
            Everything can be predicted. We learned that from machine learning.
          </p>
        </motion.div>

        {/* Form */}
        <QuestionForm onSubmit={handleSubmit} />

        {/* History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/40 font-mono">
              历史观测
            </h3>
            <div className="space-y-2">
              {history.slice(0, 5).map((session) => (
                <HistoryItem key={session.id} session={session} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center text-xs text-muted-foreground/40"
        >
          Results are projections, not prophecies.
        </motion.p>
      </div>
    </main>
  );
}
