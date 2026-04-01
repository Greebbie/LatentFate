"use client";

import { useState } from "react";
import Image from "next/image";
import type { TarotCard } from "@/lib/tarot/types";

interface RevealedCardProps {
  card: TarotCard;
  reversed: boolean;
  small?: boolean;
}

function GlyphFallback({ small }: { small?: boolean }) {
  return (
    <>
      {/* Topographic background */}
      <div className="absolute inset-0 opacity-[0.05]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute border border-latent-cyan/50 rounded-full"
            style={{
              width: `${30 + i * 14}%`,
              height: `${20 + i * 11}%`,
              top: `${50 - (20 + i * 11) / 2}%`,
              left: `${50 - (30 + i * 14) / 2}%`,
            }}
          />
        ))}
      </div>
      <div
        className={`${small ? "w-10 h-10" : "w-16 h-16"} border border-latent-blue/25 rounded-full flex items-center justify-center mb-3`}
      >
        <div
          className={`${small ? "w-5 h-5" : "w-8 h-8"} border border-latent-blue/15 rotate-45`}
        />
      </div>
    </>
  );
}

export function RevealedCard({ card, reversed, small }: RevealedCardProps) {
  const [imgError, setImgError] = useState(false);
  const w = small ? "w-[100px]" : "w-[160px]";
  const h = small ? "h-[150px]" : "h-[240px]";
  const imgSrc = `/cards/${card.id}.png`;

  return (
    <div
      className={`${w} ${h} rounded-xl border border-latent-blue/20 bg-[#06060f] overflow-hidden relative ${
        reversed ? "rotate-180" : ""
      }`}
    >
      {/* AI-generated card image or fallback */}
      {!imgError ? (
        <Image
          src={imgSrc}
          alt={card.name}
          fill
          className="object-cover opacity-90"
          onError={() => setImgError(true)}
          sizes={small ? "100px" : "160px"}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <GlyphFallback small={small} />
        </div>
      )}

      {/* Card content overlay (counter-rotate if reversed so text is readable) */}
      <div
        className={`absolute inset-0 flex flex-col items-end justify-end p-2 ${
          reversed ? "rotate-180" : ""
        }`}
        style={{
          background: imgError
            ? "none"
            : "linear-gradient(to top, rgba(4,4,12,0.9) 0%, rgba(4,4,12,0.4) 40%, transparent 70%)",
        }}
      >
        <div className="w-full text-center">
          <span
            className={`${small ? "text-[8px]" : "text-[10px]"} font-mono uppercase tracking-[0.2em] text-latent-blue/70 block`}
          >
            {card.nameZh}
          </span>
          <span
            className={`${small ? "text-[6px]" : "text-[8px]"} font-mono uppercase tracking-[0.1em] text-muted-foreground/35`}
          >
            {card.name}
          </span>
          {reversed && (
            <span className="block text-[6px] font-mono uppercase tracking-[0.2em] text-confidence-unlikely/50 mt-0.5">
              逆位
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
