export interface TarotCard {
  id: string;
  number: number;
  name: string;
  nameZh: string;
  arcana: "major" | "minor";
  suit: "wands" | "cups" | "swords" | "pentacles" | null;
  element: string | null;
  upright: {
    keywords: string[];
    meaning: string;
  };
  reversed: {
    keywords: string[];
    meaning: string;
  };
  symbolism: string;
  glyph: string;
}

export interface SpreadPosition {
  id: string;
  label: string;
  labelZh: string;
  semantics: string;
  index: number;
}

export interface Spread {
  id: string;
  name: string;
  nameZh: string;
  positions: SpreadPosition[];
}

export interface DrawnCard {
  card: TarotCard;
  position: SpreadPosition;
  reversed: boolean;
}
