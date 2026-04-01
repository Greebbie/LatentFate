import type { Spread } from "./types";

export const THREE_CARD_SPREAD: Spread = {
  id: "three-card",
  name: "Three Card Spread",
  nameZh: "三牌阵",
  positions: [
    {
      id: "past",
      label: "Past",
      labelZh: "过去",
      semantics:
        "The root cause, past influences, and foundational energies that led to the current situation. What has already been set in motion.",
      index: 0,
    },
    {
      id: "present",
      label: "Present",
      labelZh: "现在",
      semantics:
        "The current state of affairs, active dynamics, and the central tension or energy at play right now.",
      index: 1,
    },
    {
      id: "future",
      label: "Future",
      labelZh: "未来",
      semantics:
        "The trajectory and likely direction if current patterns continue. Not a fixed outcome, but the most probable unfolding.",
      index: 2,
    },
  ],
};

export const SPREADS: Record<string, Spread> = {
  "three-card": THREE_CARD_SPREAD,
};

export function getSpread(id: string): Spread | undefined {
  return SPREADS[id];
}
