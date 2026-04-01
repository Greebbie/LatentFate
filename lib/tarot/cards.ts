import type { TarotCard } from "./types";
import cardsData from "@/data/cards.json";

const cards: TarotCard[] = cardsData as TarotCard[];

export function getAllCards(): TarotCard[] {
  return cards;
}

export function getCardById(id: string): TarotCard | undefined {
  return cards.find((card) => card.id === id);
}

export function getCardsByArcana(arcana: "major" | "minor"): TarotCard[] {
  return cards.filter((card) => card.arcana === arcana);
}

export function getCardsBySuit(
  suit: "wands" | "cups" | "swords" | "pentacles"
): TarotCard[] {
  return cards.filter((card) => card.suit === suit);
}
