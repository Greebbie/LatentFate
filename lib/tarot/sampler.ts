import type { TarotCard, Spread, DrawnCard } from "./types";
import { getAllCards } from "./cards";

function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function sampleCards(
  spread: Spread,
  reversalChance: number = 0.3
): DrawnCard[] {
  const allCards = getAllCards();
  const shuffled = shuffleArray(allCards);
  const selected = shuffled.slice(0, spread.positions.length);

  return spread.positions.map((position, index) => ({
    card: selected[index],
    position,
    reversed: Math.random() < reversalChance,
  }));
}

export function sampleSpecificCards(
  cardIds: string[],
  spread: Spread,
  reversed: boolean[] = []
): DrawnCard[] {
  const allCards = getAllCards();

  return spread.positions.map((position, index) => {
    const card = allCards.find((c) => c.id === cardIds[index]);
    if (!card) {
      throw new Error(`Card not found: ${cardIds[index]}`);
    }
    return {
      card,
      position,
      reversed: reversed[index] ?? false,
    };
  });
}
