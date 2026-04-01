"use client";

import type { ProviderConfig } from "@/lib/providers/types";
import type { DrawnCard } from "@/lib/tarot/types";
import type { ReadingResult, ProjectionResult } from "@/lib/engine/schemas";

const STORAGE_KEYS = {
  PROVIDER_CONFIG: "latentfate:provider",
  CURRENT_SESSION: "latentfate:session",
  HISTORY: "latentfate:history",
} as const;

const MAX_HISTORY = 20;

export interface ReadingSession {
  id: string;
  question: string;
  background?: string;
  cards: DrawnCard[];
  reading?: ReadingResult;
  projection?: ProjectionResult;
  createdAt: string;
}

export function getProviderConfig(): ProviderConfig | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEYS.PROVIDER_CONFIG);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as ProviderConfig;
  } catch {
    return null;
  }
}

export function saveProviderConfig(config: ProviderConfig): void {
  localStorage.setItem(STORAGE_KEYS.PROVIDER_CONFIG, JSON.stringify(config));
}

export function getCurrentSession(): ReadingSession | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as ReadingSession;
  } catch {
    return null;
  }
}

export function saveCurrentSession(session: ReadingSession): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
}

export function clearCurrentSession(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
}

export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getHistory(): ReadingSession[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as ReadingSession[];
  } catch {
    return [];
  }
}

export function addToHistory(session: ReadingSession): void {
  const history = getHistory();
  const updated = [session, ...history.filter((s) => s.id !== session.id)].slice(
    0,
    MAX_HISTORY
  );
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
}
