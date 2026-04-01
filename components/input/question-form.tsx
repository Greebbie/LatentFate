"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface QuestionFormProps {
  onSubmit: (question: string, background?: string) => void;
  isLoading?: boolean;
}

export function QuestionForm({ onSubmit, isLoading }: QuestionFormProps) {
  const [question, setQuestion] = useState("");
  const [background, setBackground] = useState("");
  const [showBackground, setShowBackground] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    onSubmit(question.trim(), background.trim() || undefined);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      <div className="space-y-2">
        <label
          htmlFor="question"
          className="block text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          输入你的问题
        </label>
        <input
          id="question"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="例：他会主动联系我吗？"
          className="w-full bg-transparent border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-latent-blue/50 focus:border-latent-blue/50 transition-colors"
          disabled={isLoading}
          autoFocus
        />
      </div>

      {!showBackground ? (
        <button
          type="button"
          onClick={() => setShowBackground(true)}
          className="text-xs text-muted-foreground hover:text-foreground/70 transition-colors uppercase tracking-[0.15em]"
        >
          + 添加背景描述（可选）
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-2"
        >
          <label
            htmlFor="background"
            className="block text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            背景描述
          </label>
          <textarea
            id="background"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="提供更多上下文可以让推演更精准..."
            rows={3}
            className="w-full bg-transparent border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-latent-blue/50 focus:border-latent-blue/50 transition-colors resize-none"
            disabled={isLoading}
          />
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={!question.trim() || isLoading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full py-3 px-6 rounded-lg bg-latent-blue/10 border border-latent-blue/20 text-latent-blue hover:bg-latent-blue/15 hover:border-latent-blue/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-mono text-sm uppercase tracking-[0.2em]"
      >
        {isLoading ? "观测中..." : "开始观测"}
      </motion.button>
    </motion.form>
  );
}
