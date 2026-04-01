"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TarotCard, DrawnCard, SpreadPosition } from "@/lib/tarot/types";
import { getAllCards } from "@/lib/tarot/cards";
import { RevealedCard } from "@/components/card/tarot-card";

interface LatentSamplerProps {
  positions: SpreadPosition[];
  onComplete: (drawn: DrawnCard[]) => void;
}

const REVERSE_CHANCE = 0.3;

// All seeds look uniform — no identity leaks. Pure latent points.
const SEED_COLOR: [number, number, number] = [80, 140, 255]; // uniform blue
const SEED_SIZE_MIN = 12;
const SEED_SIZE_MAX = 20;

interface SeedInfo {
  x: number;
  y: number;
  size: number;
  color: [number, number, number];
  phase: number;
  speed: number;
}

function layoutSeeds(count: number): SeedInfo[] {
  // Scatter seeds randomly across the field — no grouping, no identity
  const seeds: SeedInfo[] = [];
  for (let i = 0; i < count; i++) {
    seeds.push({
      x: 0.08 + Math.random() * 0.84,
      y: 0.08 + Math.random() * 0.84,
      size: SEED_SIZE_MIN + Math.random() * (SEED_SIZE_MAX - SEED_SIZE_MIN),
      color: SEED_COLOR,
      phase: Math.random() * Math.PI * 2,
      speed: 0.15 + Math.random() * 0.35,
    });
  }
  return seeds;
}

// ======== Single Canvas — renders all 78 seeds ========
function SeedField({
  seeds,
  hoveredSeed,
  usedIndices,
  onHover,
  onClick,
}: {
  seeds: SeedInfo[];
  hoveredSeed: number;
  usedIndices: Set<number>;
  onHover: (index: number) => void;
  onClick: (index: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef(performance.now());
  const hoveredRef = useRef(hoveredSeed);
  const usedRef = useRef(usedIndices);
  hoveredRef.current = hoveredSeed;
  usedRef.current = usedIndices;

  const W = 700;
  const H = 500;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const t = (performance.now() - startRef.current) / 1000;

    ctx.clearRect(0, 0, W, H);

    seeds.forEach((seed, i) => {
      if (usedRef.current.has(i)) return; // hide used cards

      // Floating motion
      const fx =
        seed.x * W + Math.sin(t * seed.speed + seed.phase) * 8;
      const fy =
        seed.y * H + Math.cos(t * seed.speed * 0.8 + seed.phase * 1.3) * 6;

      const isHovered = hoveredRef.current === i;
      const displaySize = isHovered ? seed.size * 1.6 : seed.size;
      const alpha = isHovered ? 0.9 : 0.5;

      const [cr, cg, cb] = seed.color;

      // Draw blob
      const gradient = ctx.createRadialGradient(
        fx, fy, 0,
        fx, fy, displaySize
      );
      gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.8})`);
      gradient.addColorStop(0.4, `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.3})`);
      gradient.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);

      ctx.beginPath();
      ctx.arc(fx, fy, displaySize, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Inner noise pattern (just a few rotating dots for texture)
      if (isHovered) {
        for (let j = 0; j < 5; j++) {
          const a = (j / 5) * Math.PI * 2 + t * 2;
          const r = displaySize * 0.3;
          const px = fx + Math.cos(a) * r;
          const py = fy + Math.sin(a) * r;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 0.4)`;
          ctx.fill();
        }

        // Hover ring
        ctx.beginPath();
        ctx.arc(fx, fy, displaySize + 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.25)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // No name hint — identity is hidden until denoising reveals it
      }
    });

    animRef.current = requestAnimationFrame(draw);
  }, [seeds]);

  useEffect(() => {
    startRef.current = performance.now();
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // Hit testing for mouse hover/click
  const getHitSeed = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return -1;
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;
      const t = (performance.now() - startRef.current) / 1000;

      let closest = -1;
      let closestDist = Infinity;

      seeds.forEach((seed, i) => {
        if (usedRef.current.has(i)) return;
        const fx =
          seed.x * W + Math.sin(t * seed.speed + seed.phase) * 8;
        const fy =
          seed.y * H + Math.cos(t * seed.speed * 0.8 + seed.phase * 1.3) * 6;
        const dist = Math.sqrt((mx - fx) ** 2 + (my - fy) ** 2);
        if (dist < seed.size * 1.5 && dist < closestDist) {
          closest = i;
          closestDist = dist;
        }
      });

      return closest;
    },
    [seeds]
  );

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full max-w-[700px] h-auto cursor-crosshair rounded-2xl"
      onMouseMove={(e) => onHover(getHitSeed(e))}
      onMouseLeave={() => onHover(-1)}
      onClick={(e) => {
        const hit = getHitSeed(e);
        if (hit >= 0) onClick(hit);
      }}
      onTouchEnd={(e) => {
        const touch = e.changedTouches[0];
        if (!touch) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        const mx = (touch.clientX - rect.left) * scaleX;
        const my = (touch.clientY - rect.top) * scaleY;
        const t = (performance.now() - startRef.current) / 1000;
        let closest = -1;
        let closestDist = Infinity;
        seeds.forEach((seed, i) => {
          if (usedRef.current.has(i)) return;
          const fx = seed.x * W + Math.sin(t * seed.speed + seed.phase) * 8;
          const fy = seed.y * H + Math.cos(t * seed.speed * 0.8 + seed.phase * 1.3) * 6;
          const dist = Math.sqrt((mx - fx) ** 2 + (my - fy) ** 2);
          if (dist < seed.size * 2 && dist < closestDist) {
            closest = i;
            closestDist = dist;
          }
        });
        if (closest >= 0) onClick(closest);
      }}
    />
  );
}

// ======== Denoising reveal — fullscreen overlay ========
function DenoiseReveal({
  card,
  reversed,
  position,
  seedColor,
  onDone,
}: {
  card: TarotCard;
  reversed: boolean;
  position: SpreadPosition;
  seedColor: [number, number, number];
  onDone: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef(performance.now());
  const [showCard, setShowCard] = useState(false);

  const W = 180;
  const H = 270;
  const [cr, cg, cb] = seedColor;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const elapsed = (performance.now() - startRef.current) / 1000;
    const imageData = ctx.createImageData(W, H);
    const data = imageData.data;
    const progress = Math.min(elapsed / 2.2, 1);

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const idx = (py * W + px) * 4;
        const nx = px / W;
        const ny = py / H;

        const n1 = Math.sin(nx * 8 + elapsed * 1.5) * Math.cos(ny * 6 + elapsed);
        const n2 = Math.sin((nx + ny) * 5 + elapsed * 0.8);
        const n3 = Math.cos(nx * 12 - elapsed * 2) * Math.sin(ny * 10 + elapsed * 0.5);
        const noise = (n1 + n2 + n3 + 3) / 6;

        if (progress < 0.35) {
          const p = progress / 0.35;
          const intensity = noise * (40 + p * 50);
          data[idx] = intensity * (cr / 255) * 0.6;
          data[idx + 1] = intensity * (cg / 255) * 0.6;
          data[idx + 2] = Math.min(255, intensity * (cb / 255) * 1.5);
          data[idx + 3] = 220;
        } else if (progress < 0.7) {
          const p = (progress - 0.35) / 0.35;
          const contour = Math.sin(noise * Math.PI * (8 + p * 12));
          const isLine = Math.abs(contour) < 0.06 + (1 - p) * 0.1;
          const base = noise * 15 * (1 - p);
          const bright = isLine ? 80 + p * 70 : 0;

          data[idx] = base * 0.1 + bright * (cr / 255) * 0.4;
          data[idx + 1] = base * 0.15 + bright * (cg / 255) * 0.5;
          data[idx + 2] = Math.min(255, base * 0.3 + bright * (cb / 255) * 1.1);
          data[idx + 3] = 230;
        } else {
          const p = (progress - 0.7) / 0.3;
          const fade = 1 - p;
          const residual = noise * 12 * fade;
          data[idx] = residual * (cr / 255) * 0.3;
          data[idx + 1] = residual * (cg / 255) * 0.3;
          data[idx + 2] = residual * (cb / 255) * 0.6;
          data[idx + 3] = 240 * fade;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    if (progress >= 1 && !showCard) {
      setShowCard(true);
    }
    if (progress < 1) {
      animRef.current = requestAnimationFrame(draw);
    }
  }, [cr, cg, cb, showCard]);

  useEffect(() => {
    startRef.current = performance.now();
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  useEffect(() => {
    if (showCard) {
      const t = setTimeout(onDone, 2000);
      return () => clearTimeout(t);
    }
  }, [showCard, onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030308]/90"
    >
      <div className="relative flex flex-col items-center gap-4">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-mono uppercase tracking-[0.3em]"
          style={{ color: `rgba(${cr}, ${cg}, ${cb}, 0.5)` }}
        >
          {position.labelZh} / {position.label}
        </motion.span>

        <div className="relative" style={{ width: W, height: H }}>
          {!showCard && (
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="absolute inset-0 rounded-xl"
            />
          )}

          <AnimatePresence>
            {showCard && (
              <>
                <motion.div
                  initial={{ scale: 0.3, opacity: 0.7 }}
                  animate={{ scale: 4, opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute rounded-full blur-3xl"
                  style={{
                    width: W,
                    height: H,
                    left: 0,
                    top: 0,
                    backgroundColor: `rgba(${cr}, ${cg}, ${cb}, 0.15)`,
                  }}
                />
                <motion.div
                  initial={{ scale: 0.6, opacity: 0, rotateY: 90 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ perspective: 1000 }}
                >
                  <RevealedCard card={card} reversed={reversed} />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <motion.span
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[9px] font-mono tracking-[0.2em]"
          style={{ color: `rgba(${cr}, ${cg}, ${cb}, 0.3)` }}
        >
          {showCard ? card.nameZh : "从潜空间采样中..."}
        </motion.span>
      </div>
    </motion.div>
  );
}

// ======== Main Sampler ========
export function LatentSampler({ positions, onComplete }: LatentSamplerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [revealing, setRevealing] = useState(false);
  const [revealCard, setRevealCard] = useState<TarotCard | null>(null);
  const [revealReversed, setRevealReversed] = useState(false);
  const [revealColor, setRevealColor] = useState<[number, number, number]>([100, 160, 255]);
  const [hoveredSeed, setHoveredSeed] = useState(-1);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const usedCardIds = useRef(new Set<string>());

  const allCards = useMemo(() => getAllCards(), []);
  const seeds = useMemo(() => layoutSeeds(78), []);

  const isComplete = currentStep >= positions.length;

  const handleSeedClick = useCallback(
    (seedIndex: number) => {
      if (revealing || isComplete) return;
      if (usedIndices.has(seedIndex)) return;

      // Random card assignment — the seed has no pre-determined identity
      const available = allCards.filter((c) => !usedCardIds.current.has(c.id));
      const card = available[Math.floor(Math.random() * available.length)];
      const reversed = Math.random() < REVERSE_CHANCE;

      usedCardIds.current.add(card.id);
      setRevealCard(card);
      setRevealReversed(reversed);
      setRevealColor(SEED_COLOR);
      setRevealing(true);
      setUsedIndices((prev) => new Set([...prev, seedIndex]));
    },
    [revealing, isComplete, usedIndices, allCards]
  );

  const handleRevealDone = useCallback(() => {
    if (!revealCard) return;

    const drawn: DrawnCard = {
      card: revealCard,
      position: positions[currentStep],
      reversed: revealReversed,
    };

    const nextDrawn = [...drawnCards, drawn];
    setDrawnCards(nextDrawn);
    setCurrentStep((prev) => prev + 1);
    setRevealing(false);
    setRevealCard(null);

    if (nextDrawn.length >= positions.length) {
      setTimeout(() => onComplete(nextDrawn), 800);
    }
  }, [revealCard, revealReversed, drawnCards, currentStep, positions, onComplete]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Already drawn cards */}
      {drawnCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-4"
        >
          {drawnCards.map((drawn) => (
            <motion.div
              key={drawn.card.id}
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex flex-col items-center gap-1"
            >
              <RevealedCard card={drawn.card} reversed={drawn.reversed} small />
              <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-muted-foreground/35">
                {drawn.position.labelZh}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Step indicator */}
      {!isComplete && (
        <motion.span
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] font-mono uppercase tracking-[0.3em] text-latent-blue/40"
        >
          {positions[currentStep].labelZh} — 选择一个潜种子
        </motion.span>
      )}

      {/* The 78-seed latent field */}
      {!isComplete && (
        <SeedField
          seeds={seeds}
          hoveredSeed={hoveredSeed}
          usedIndices={usedIndices}
          onHover={setHoveredSeed}
          onClick={handleSeedClick}
        />
      )}

      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4"
        >
          <motion.span
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs font-mono text-latent-blue/40 tracking-[0.2em]"
          >
            采样完成 — 进入解析...
          </motion.span>
        </motion.div>
      )}

      {/* Fullscreen denoise reveal */}
      <AnimatePresence>
        {revealing && revealCard && (
          <DenoiseReveal
            card={revealCard}
            reversed={revealReversed}
            position={positions[currentStep]}
            seedColor={revealColor}
            onDone={handleRevealDone}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
