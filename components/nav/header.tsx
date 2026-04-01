"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border/30">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-5 h-5 border border-latent-blue/40 rounded-full flex items-center justify-center group-hover:border-latent-blue/60 transition-colors">
          <div className="w-2 h-2 border border-latent-blue/30 rotate-45 group-hover:border-latent-blue/50 transition-colors" />
        </div>
        <span className="font-mono text-xs tracking-[0.25em] text-foreground/60 group-hover:text-foreground/80 transition-colors">
          LATENTFATE
        </span>
      </Link>

      <nav className="flex items-center gap-4">
        {!isHome && (
          <Link
            href="/"
            className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
          >
            新观测
          </Link>
        )}
        <Link
          href="/settings"
          className={`text-[10px] font-mono uppercase tracking-[0.15em] transition-colors ${
            pathname === "/settings"
              ? "text-latent-blue/60"
              : "text-muted-foreground/40 hover:text-muted-foreground/70"
          }`}
        >
          设置
        </Link>
      </nav>
    </header>
  );
}
