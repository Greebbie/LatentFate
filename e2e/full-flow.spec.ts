import { test, expect } from "@playwright/test";

const MINIMAX_API_KEY =
  "sk-cp-CHeJqRV1BwQhLbSFP1kKAl9iSplZQTIkLt3tebV-igPFFdiuJDv148Kq1Qg-Bp3BqmSTZ_XMlo1gBi_KfspfWj4E0KOwcO2cCY3WYkV-RDCjmgp5Ol5V7bQ";

// Pre-built test session with 3 specific cards
const TEST_SESSION = {
  id: "e2e-test-1",
  question: "他会主动联系我吗？",
  background: "我们三周前吵架后就没联系了，我不确定他是否还在乎。",
  cards: [
    {
      card: {
        id: "seven-of-wands",
        number: 7,
        name: "Seven of Wands",
        nameZh: "权杖七",
        arcana: "minor",
        suit: "wands",
        element: "fire",
        upright: {
          keywords: ["perseverance", "defensive", "maintaining control"],
          meaning:
            "The Seven of Wands represents standing your ground and defending your position against opposition. You may feel challenged but have the advantage of higher ground.",
        },
        reversed: {
          keywords: ["exhaustion", "giving up", "overwhelmed"],
          meaning:
            "Reversed, the Seven of Wands suggests you are feeling overwhelmed by the challenges you face. You may be considering giving up or feel that the fight is no longer worth it.",
        },
        symbolism:
          "A figure stands on elevated ground, wielding a wand against six others rising from below. The defensive posture suggests determination despite being outnumbered.",
        glyph: "A vertical line crossed by six diagonal lines from below",
      },
      position: {
        id: "past",
        label: "Past",
        labelZh: "过去",
        semantics:
          "The root cause, past influences, and foundational energies that have shaped the current situation. What has already happened or been set in motion.",
        index: 0,
      },
      reversed: false,
    },
    {
      card: {
        id: "ace-of-cups",
        number: 1,
        name: "Ace of Cups",
        nameZh: "圣杯一",
        arcana: "minor",
        suit: "cups",
        element: "water",
        upright: {
          keywords: [
            "new feelings",
            "emotional awakening",
            "creativity",
            "intuition",
          ],
          meaning:
            "The Ace of Cups represents the beginning of new emotional experiences — love, compassion, creative inspiration. A divine hand offers the cup, symbolizing an opportunity for deep connection.",
        },
        reversed: {
          keywords: [
            "emotional loss",
            "blocked creativity",
            "emptiness",
            "repressed feelings",
          ],
          meaning:
            "Reversed, the Ace of Cups suggests repressed emotions, a blocked flow of feelings, or an unwillingness to open up to new emotional experiences.",
        },
        symbolism:
          "A hand emerges from a cloud holding an overflowing chalice. Five streams of water pour from it, representing the five senses. A dove descends into the cup, symbolizing divine love and peace.",
        glyph: "A chalice overflowing with five streams beneath a descending dove",
      },
      position: {
        id: "present",
        label: "Present",
        labelZh: "现在",
        semantics:
          "The current state of affairs, active dynamics, and the energy that is most present right now. What is happening in the moment.",
        index: 1,
      },
      reversed: true,
    },
    {
      card: {
        id: "the-star",
        number: 17,
        name: "The Star",
        nameZh: "星星",
        arcana: "major",
        suit: null,
        element: "air",
        upright: {
          keywords: ["hope", "faith", "purpose", "renewal", "serenity"],
          meaning:
            "The Star brings hope, inspiration, and a sense of calm after turbulence. It suggests healing, renewal, and faith in the future. A period of peace and spiritual clarity.",
        },
        reversed: {
          keywords: [
            "lack of faith",
            "despair",
            "disconnection",
            "insecurity",
          ],
          meaning:
            "Reversed, The Star indicates a loss of hope or faith. You may feel disconnected from your purpose or overwhelmed by doubt and insecurity.",
        },
        symbolism:
          "A naked figure kneels by a pool, pouring water onto land and into the water. Eight stars shine above — one large, seven small. The figure represents vulnerability, openness, and connection to the divine.",
        glyph: "An eight-pointed star radiating above a kneeling figure pouring water",
      },
      position: {
        id: "future",
        label: "Future",
        labelZh: "未来",
        semantics:
          "The trajectory and likely direction if current patterns continue. What is emerging or building toward.",
        index: 2,
      },
      reversed: false,
    },
  ],
  createdAt: new Date().toISOString(),
};

test("full reading + projection flow with MiniMax M2.7", async ({ page }) => {
  // ── Step 1: Set up provider config + session via localStorage ──
  await page.goto("/");
  await page.evaluate(
    ({ apiKey, session }) => {
      localStorage.setItem(
        "latentfate:provider",
        JSON.stringify({
          providerId: "minimax",
          apiKey,
          model: "MiniMax-M2.7",
        })
      );
      localStorage.setItem("latentfate:session", JSON.stringify(session));
    },
    { apiKey: MINIMAX_API_KEY, session: TEST_SESSION }
  );

  // ── Step 2: Navigate to /reading — it will see the session and show sampling phase ──
  // We need to trigger the reading API. Navigate to reading, then call the API via the page.
  await page.goto("/reading");
  await page.waitForLoadState("networkidle");

  // The page shows sampling phase because there's no reading result yet.
  // We'll call the reading API directly and then reload with the result.
  console.log("\n=== Calling Reading API ===");

  const readingResponse = await page.evaluate(
    async ({ session, apiKey }) => {
      const response = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: session.question,
          background: session.background,
          cards: session.cards,
          providerId: "minimax",
          apiKey,
          model: "MiniMax-M2.7",
        }),
      });
      return response.json();
    },
    { session: TEST_SESSION, apiKey: MINIMAX_API_KEY }
  );

  console.log("Reading success:", readingResponse.success);
  if (!readingResponse.success) {
    console.error("Reading error:", readingResponse.error);
    throw new Error(`Reading API failed: ${readingResponse.error}`);
  }

  const readingResult = readingResponse.data;
  console.log("\n--- Reading Overview ---");
  console.log(readingResult.overview);
  console.log("\n--- Core Tension ---");
  console.log(readingResult.core_tension);
  console.log("\n--- Narrative Arc ---");
  console.log(readingResult.narrative_arc);
  console.log("\n--- Elemental Interaction ---");
  console.log(readingResult.state_analysis?.elemental_interaction);
  console.log("\n--- Card Interpretations ---");
  for (const card of readingResult.card_interpretations ?? []) {
    console.log(
      `[${card.position_id}] ${card.key_insight}`
    );
    console.log(`  Relation: ${card.relation_to_other_cards}`);
  }

  // ── Step 3: Save reading to session and navigate to show results ──
  await page.evaluate(
    ({ session, reading }) => {
      const updated = { ...session, reading };
      localStorage.setItem("latentfate:session", JSON.stringify(updated));
    },
    { session: TEST_SESSION, reading: readingResult }
  );

  // Reload reading page to see the reading result displayed
  await page.goto("/reading");
  await page.waitForLoadState("networkidle");

  // The page should detect existing reading and show "complete" phase
  // Actually, the page's phase state starts at "sampling" and doesn't auto-detect stored reading.
  // Let's navigate directly to /result to test both reading display and projection.

  // ── Step 4: Navigate to /result — triggers projection API ──
  await page.goto("/result");

  // Wait for projection to complete (this calls the API automatically)
  console.log("\n=== Waiting for Projection API ===");
  await expect(
    page.getByText("PROJECTION", { exact: false })
  ).toBeVisible({ timeout: 120_000 });

  // Extra wait for render
  await page.waitForTimeout(2000);

  // ── Step 5: Verify reading context on result page ──
  // The collapsible reading summary should be visible
  const expandReadingBtn = page.getByText("展开完整解读", { exact: false });
  await expect(expandReadingBtn).toBeVisible({ timeout: 10_000 });

  // ── Step 6: Verify projection new fields ──
  // predicted_behaviors section
  await expect(
    page.getByText("对方/事态最可能的行为", { exact: false })
  ).toBeVisible({ timeout: 10_000 });

  // high confidence trends (moved up)
  await expect(
    page.getByText("高确信趋势", { exact: false })
  ).toBeVisible({ timeout: 5_000 });

  // Branch cards
  const expandButton = page.getByText("展开时间线", { exact: false }).first();
  await expect(expandButton).toBeVisible({ timeout: 5_000 });

  // Expand first branch
  await expandButton.click();
  await page.waitForTimeout(500);

  // Turning point
  await expect(
    page.getByText("TURNING_POINT", { exact: false })
  ).toBeVisible({ timeout: 5_000 });

  // Trigger conditions
  await expect(
    page.getByText("TRIGGER_CONDITIONS", { exact: false })
  ).toBeVisible({ timeout: 5_000 });

  // Weak signals
  await expect(
    page.getByText("弱信号", { exact: false })
  ).toBeVisible({ timeout: 5_000 });

  // ── Step 7: Log projection content for manual review ──
  const projectionData = await page.evaluate(() => {
    const session = localStorage.getItem("latentfate:session");
    if (!session) return null;
    return JSON.parse(session).projection;
  });

  if (projectionData) {
    console.log("\n=== PROJECTION RESULTS ===");
    console.log("\n--- Predicted Behaviors ---");
    for (const b of projectionData.predicted_behaviors ?? []) {
      console.log(`  • ${b}`);
    }
    console.log(`\n--- Branches (${projectionData.branches?.length}) ---`);
    for (const branch of projectionData.branches ?? []) {
      console.log(`\n[${branch.action}] (${branch.likelihood})`);
      console.log(`  ${branch.action_description}`);
      console.log(`  Emotional: ${branch.emotional_trajectory}`);
      console.log(`  Turning point: ${branch.turning_point}`);
      console.log(`  24h: ${branch.timeline.h24?.slice(0, 100)}...`);
    }
    console.log("\n--- High Confidence Trends ---");
    for (const t of projectionData.high_confidence_trends ?? []) {
      console.log(`  ✓ ${t}`);
    }
    console.log("\n--- Weak Signals ---");
    for (const s of projectionData.weak_signals ?? []) {
      console.log(`  ~ ${s}`);
    }
  }

  // Take final screenshot
  await page.screenshot({
    path: "test-results/full-flow-success.png",
    fullPage: true,
  });

  console.log("\n✓ Full flow test passed! All new fields verified.");
});
