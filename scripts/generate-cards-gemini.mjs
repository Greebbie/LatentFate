/**
 * LatentFate — Remaining Card Generator (Gemini)
 *
 * Generates ONLY missing cards using Google Gemini image generation.
 * Skips any card that already has an image in public/cards/.
 *
 * Usage:
 *   node scripts/generate-cards-gemini.mjs
 *   node scripts/generate-cards-gemini.mjs the-fool   # single card
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable required");
  console.error("Usage: GEMINI_API_KEY=your_key node scripts/generate-cards-gemini.mjs");
  process.exit(1);
}
const GEMINI_MODEL = "gemini-2.5-flash-image";
const OUTPUT_DIR = path.join(process.cwd(), "public", "cards");
const CARDS_JSON = path.join(process.cwd(), "data", "cards.json");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const cards = JSON.parse(fs.readFileSync(CARDS_JSON, "utf-8"));

// Using REST API directly instead of SDK for reliability

// ─── Same style + prompts as fal.ai version ───────────────────────────────────

const STYLE = [
  "Tarot card illustration in futuristic holographic wireframe style on pure black background.",
  "Glowing neon linework in blue (#4a9eff) and cyan (#00d4ff).",
  "Geometric silhouettes and symbolic forms — abstract but RECOGNIZABLE as tarot imagery.",
  "The card's story and key symbols must be clearly visible and identifiable.",
  "Subtle topographic contour lines in the dark background.",
  "No text, no card borders. Centered portrait composition.",
  "Style: holographic data visualization, like a tarot card rendered in a sci-fi UI.",
  "Quality: 4K, clean luminous lines, dark cinematic mood.",
].join(" ");

const ELEMENT_PALETTE = {
  fire: "with warm amber (#ff8040) and orange energy accents threading through the blue base",
  water: "with deep teal (#008080) and flowing aquamarine currents weaving through the geometry",
  air: "with silver-white (#c0d0e8) and crystalline pale blue highlights, sharp and precise",
  earth: "with subtle gold (#c8a040) and emerald (#40a070) accents grounding the structure",
};

const MAJOR_CONCEPTS = {
  "the-fool":
    "A geometric wireframe silhouette of a young traveler standing at the very edge of a glowing cliff, one foot stepping into the void. A small geometric dog companion at their heels. A bundle on a stick over their shoulder. Below the cliff: infinite darkness with faint spiral paths. The figure radiates innocent light. Journey into the unknown.",
  "the-magician":
    "A geometric wireframe figure with one hand raised to the sky and one pointing down to a glowing table. On the table: a wand, cup, sword, and pentacle coin as simple geometric icons. An infinity symbol (lemniscate) hovers above their head. Energy arcs flow between sky and earth through the figure. Mastery and manifestation.",
  "the-high-priestess":
    "A seated geometric wireframe feminine figure between two pillars — one black (B), one white (J). She holds a scroll. Behind her: a veil decorated with pomegranate patterns in geometric form. A crescent moon at her feet. She guards the threshold between conscious and unconscious. Mystery and hidden knowledge.",
  "the-empress":
    "A graceful geometric wireframe feminine figure seated on cushions amid a lush geometric garden. A crown of twelve stars. Flowing robes suggest abundance. Wheat stalks and Venus symbols surround her. Warm golden-green accents amid the blue glow. Fertility, nature, maternal creation.",
  "the-emperor":
    "A commanding geometric wireframe figure seated on a stone throne carved with ram heads. Armored, holding an ankh scepter and an orb. Mountains behind the throne. Everything angular, structured, authoritative. Red-amber accents. Power, authority, structure.",
  "the-hierophant":
    "A geometric wireframe figure in papal robes seated between two pillars, raising one hand in blessing. Two smaller kneeling figures below. A triple cross staff. Two crossed keys at the feet. Sacred geometry of tradition, hierarchy, and spiritual teaching.",
  "the-lovers":
    "Two geometric wireframe figures — a man and a woman — standing beneath a radiant angel figure above them. Between them: a tree of knowledge with a serpent and a tree of life with flames. The angel blesses their union. Love, choice, and divine connection.",
  "the-chariot":
    "A geometric wireframe figure standing in a chariot drawn by two sphinxes — one black, one white, pulling in different directions. The charioteer holds them on course through will alone. A canopy of stars above. City walls behind. Victory through willpower and determination.",
  "strength":
    "A gentle geometric wireframe feminine figure calmly opening the jaws of a lion. No force — only patience and courage. An infinity symbol above her head. Flowers around them. The lion submits willingly. Inner strength taming raw power through compassion.",
  "the-hermit":
    "A solitary geometric wireframe cloaked figure standing on a mountain peak, holding a lantern containing a six-pointed star. A staff in the other hand. Vast empty darkness surrounds the mountain. The lantern's light is small but piercing. Solitude, wisdom, inner guidance.",
  "wheel-of-fortune":
    "A large glowing wheel/mandala with eight spokes, surrounded by four winged creatures in the corners (lion, eagle, bull, angel as geometric forms). On the wheel: a serpent descending one side, Anubis-like figure ascending the other, sphinx at the top. Cycles of fate turning.",
  "justice":
    "A geometric wireframe figure seated on a throne between pillars, holding a raised sword in the right hand and balanced scales in the left. A crown. The composition is perfectly symmetrical. The sword is sharp and vertical. Truth, fairness, consequences.",
  "the-hanged-man":
    "A geometric wireframe figure suspended upside-down from a T-shaped living tree, one leg crossed behind the other forming a triangle. A halo of light around the inverted head. The expression is serene, not suffering. Surrender, new perspective, willing sacrifice.",
  "death":
    "A geometric wireframe skeleton figure in black armor riding a white horse. A black flag with a white five-petaled rose. Before the horse: a fallen king, a praying bishop, and two children. A rising sun between two towers on the horizon. Transformation, ending, rebirth.",
  "temperance":
    "A geometric wireframe angel figure with wings, pouring luminous liquid between two cups — the flow defies gravity. One foot on land, one in water. A path leads to mountains with a glowing crown/sun. Irises grow nearby. Balance, patience, divine mixing.",
  "the-devil":
    "A geometric wireframe horned devil figure perched on a dark pedestal. Two smaller naked human figures chained to the pedestal — but the chains are loose enough to remove. Inverted pentagram above. Bat wings. Bondage, addiction, shadow self — chains are voluntary.",
  "the-tower":
    "A tall tower struck by a bolt of lightning from a dark sky. The crown of the tower blows off. Two geometric wireframe figures fall from the tower. Flames burst from the windows. Fragments of stone suspended mid-air. Sudden upheaval, destruction of false structures, revelation.",
  "the-star":
    "A geometric wireframe nude feminine figure kneeling at a pool, pouring water from two vessels — one onto land, one into the pool. Above: one large eight-pointed star surrounded by seven smaller stars. A bird in a tree in the distance. Hope, renewal, serenity after the storm.",
  "the-moon":
    "A full moon with a face in profile between two towers. Below: a winding path leads from a pool into distant mountains. A wolf and a dog howl at the moon. A crayfish emerges from the water. Drops of light fall from the moon. Illusion, fear, the subconscious, deception.",
  "the-sun":
    "A large radiant sun with a face, beaming warm golden-orange rays. Below: a joyful geometric wireframe child rides a white horse with arms outstretched. Sunflowers stand tall along a wall. Everything is bright and illuminated. Pure joy, vitality, success, clarity.",
  "judgement":
    "An angel in the clouds blows a great trumpet bearing a flag with a cross. Below: geometric wireframe figures rise from coffins/graves, arms raised toward the sky in response to the call. Mountains and ocean in the background. Awakening, rebirth, answering a higher calling.",
  "the-world":
    "A geometric wireframe dancing figure wrapped in a flowing sash, enclosed in a large oval laurel wreath. In the four corners: a lion, eagle, bull, and angel (same as Wheel of Fortune). The dancer holds two wands. Completion, fulfillment, wholeness, the end of the journey.",
};

const SUIT_LANGUAGE = {
  wands: {
    item: "wooden staff/wand with budding leaves",
    color: "warm amber-orange glow accents",
    scene: "fiery, energetic, upward-moving",
  },
  cups: {
    item: "ornate chalice/cup with flowing water",
    color: "deep teal and aquamarine glow accents",
    scene: "flowing, emotional, reflective water scenes",
  },
  swords: {
    item: "sharp geometric sword/blade",
    color: "silver-white and pale blue glow accents",
    scene: "sharp, intellectual, windswept, cloudy skies",
  },
  pentacles: {
    item: "glowing pentacle coin/disc with star symbol",
    color: "gold and emerald green glow accents",
    scene: "grounded, abundant, garden or workshop setting",
  },
};

const NUMBER_CONCEPTS = {
  1: (suit) => `A single glowing ${suit.item} emerging from a cloud/hand, radiating pure potential. The Ace: divine gift, new beginning of the suit's element. Powerful, singular, potent.`,
  2: (suit) => `Two ${suit.item}s in balanced arrangement. A geometric wireframe figure making a choice or maintaining balance between the two. Duality, partnership, decision.`,
  3: (suit) => `Three ${suit.item}s in a triangular composition. Scene suggests growth, collaboration, or early success. Creative expansion, celebration.`,
  4: (suit) => `Four ${suit.item}s in a stable square arrangement. Scene suggests rest, stability, contemplation, or withdrawal. A pause, a foundation built.`,
  5: (suit) => `Five ${suit.item}s in a scene of conflict or loss. Figures in struggle or aftermath. Tension, challenge, disruption of the peace that came before.`,
  6: (suit) => `Six ${suit.item}s in a scene of harmony restored. Generosity, victory, or nostalgia. Balance regained, gifts given, journey homeward.`,
  7: (suit) => `Seven ${suit.item}s in a complex scene of assessment, strategy, or inner challenge. A figure evaluates options or faces temptation. Reflection, perseverance.`,
  8: (suit) => `Eight ${suit.item}s suggesting swift movement, change, or momentum. Speed, determination, rapid development. Things accelerating.`,
  9: (suit) => `Nine ${suit.item}s near completion. Abundance or anxiety depending on suit. Almost there — the final stretch before fulfillment.`,
  10: (suit) => `Ten ${suit.item}s in maximum expression. The full cycle of the suit's energy — culmination, completion, sometimes excess or burden. The journey's end.`,
  11: (suit) => `The Page: a young geometric wireframe figure holding a single ${suit.item}, studying it with curiosity. Messenger energy, youthful exploration, new student of the element.`,
  12: (suit) => `The Knight: a geometric wireframe armored figure riding a horse, charging forward with ${suit.item} held high. Action, quest, adventure, passionate pursuit.`,
  13: (suit) => `The Queen: a regal geometric wireframe feminine figure seated on a throne, holding a ${suit.item} with confident grace. Mastery through intuition, nurturing command.`,
  14: (suit) => `The King: a commanding geometric wireframe masculine figure on an elaborate throne, ${suit.item} as scepter of authority. Full mastery, leadership, dominion over the element.`,
};

function buildMinorPrompt(card) {
  const suit = SUIT_LANGUAGE[card.suit];
  const conceptFn = NUMBER_CONCEPTS[card.number];
  const concept = typeof conceptFn === "function" ? conceptFn(suit) : conceptFn;
  return `${concept} Color palette: ${suit.color}. Scene quality: ${suit.scene}. Card meaning: ${card.symbolism}`;
}

function buildPrompt(card) {
  let concept;
  if (card.arcana === "major") {
    concept = MAJOR_CONCEPTS[card.id] || `${card.symbolism} Geometric glyph: ${card.glyph}`;
  } else {
    concept = buildMinorPrompt(card);
  }
  const palette = ELEMENT_PALETTE[card.element] || "";
  const arcanaNote = card.arcana === "major" ? "Major Arcana — more complex, luminous, and significant composition." : "";
  return `${STYLE} ${arcanaNote} ${palette}. Visual concept: ${concept}`;
}

// ─── Gemini API ───────────────────────────────────────────────────────────────

async function generateImage(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

  // Prepend "Original artwork:" to avoid content filter false positives
  const safePrompt = `Original digital artwork, not based on any existing work. ${prompt}`;

  const body = {
    contents: [{ parts: [{ text: safePrompt }] }],
    generationConfig: {
      responseModalities: ["image", "text"],
    },
  };

  // Use curl because Node.js fetch has connectivity issues on this system
  const tmpIn = path.join(OUTPUT_DIR, "_req.json").replace(/\\/g, "/");
  const tmpOut = path.join(OUTPUT_DIR, "_resp.json").replace(/\\/g, "/");
  fs.writeFileSync(tmpIn, JSON.stringify(body));

  try {
    execSync(
      `curl -s -X POST "${url}" -H "Content-Type: application/json" -d @${tmpIn} -o ${tmpOut} --max-time 120`,
      { timeout: 130000 }
    );

    const data = JSON.parse(fs.readFileSync(tmpOut, "utf-8"));

    if (data.error) {
      throw new Error(`Gemini ${data.error.code}: ${data.error.message?.slice(0, 150)}`);
    }

    for (const candidate of data.candidates || []) {
      if (candidate.finishReason === "IMAGE_RECITATION") {
        throw new Error("Content filter — will retry with adjusted prompt");
      }
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          return Buffer.from(part.inlineData.data, "base64");
        }
      }
    }

    throw new Error("No image in Gemini response");
  } finally {
    try { fs.unlinkSync(tmpIn); } catch {}
    try { fs.unlinkSync(tmpOut); } catch {}
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const singleCard = process.argv[2];

  let targets = cards;
  if (singleCard) {
    targets = cards.filter((c) => c.id === singleCard);
    if (!targets.length) {
      console.error(`Card not found: ${singleCard}`);
      process.exit(1);
    }
  }

  // Sort: major first, then minor by suit
  targets.sort((a, b) => {
    if (a.arcana !== b.arcana) return a.arcana === "major" ? -1 : 1;
    if (a.suit !== b.suit) return (a.suit || "").localeCompare(b.suit || "");
    return a.number - b.number;
  });

  // Filter to only missing cards
  const missing = targets.filter(
    (c) => !fs.existsSync(path.join(OUTPUT_DIR, `${c.id}.png`))
  );

  console.log(`\n  LatentFate Card Generator (Gemini)`);
  console.log(`  ═══════════════════════════════════`);
  console.log(`  Model: gemini-2.0-flash-preview-image-generation`);
  console.log(`  Total cards: ${targets.length}`);
  console.log(`  Already exist: ${targets.length - missing.length}`);
  console.log(`  To generate: ${missing.length}\n`);

  if (missing.length === 0) {
    console.log("  Nothing to generate — all cards exist!\n");
    return;
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < missing.length; i++) {
    const card = missing[i];
    const outputPath = path.join(OUTPUT_DIR, `${card.id}.png`);

    console.log(`  [${i + 1}/${missing.length}] ⟳ ${card.id} (${card.nameZh})...`);

    try {
      const prompt = buildPrompt(card);
      const imageBuffer = await generateImage(prompt);
      fs.writeFileSync(outputPath, imageBuffer);
      console.log(`  [${i + 1}/${missing.length}] ✓ ${card.id} — ${(imageBuffer.length / 1024).toFixed(0)}KB`);
      success++;
    } catch (err) {
      console.error(`  [${i + 1}/${missing.length}] ✗ ${card.id} — ${err.message}`);
      failed++;
    }

    // Rate limit: 2s between calls
    if (i < missing.length - 1) {
      await sleep(2000);
    }
  }

  console.log(`\n  ═══════════════════════════════════`);
  console.log(`  Done! ✓ ${success} | ✗ ${failed}`);
  console.log(`  Images: ${OUTPUT_DIR}\n`);
}

main().catch(console.error);
