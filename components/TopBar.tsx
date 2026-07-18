"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { Profile } from "@/lib/types";
import { GithubIcon } from "@/lib/octicons";
import { ago } from "@/lib/format";

interface Props {
  profile: Profile;
  isDemo: boolean;
  generatedAt: string;
}

/** Days elapsed since an ISO timestamp, floored, never negative. */
function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  const diffMs = Date.now() - then;
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / 86_400_000);
}

export default function TopBar({ profile, isDemo, generatedAt }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const syncedLabel = `synced ${ago(daysSince(generatedAt))}`;
  const initial = (profile.name || profile.login || "?").charAt(0).toUpperCase();
  const showAvatarImg = profile.avatarUrl && !imgFailed;

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.9 }}
      className="sticky top-0 z-50 border-b border-border-muted bg-canvas-inset/80 backdrop-blur-xl backdrop-saturate-150"
    >
      <div className="mx-auto flex h-[60px] max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        {/* Brand — plain mark + wordmark, no container */}
        <div className="flex min-w-0 items-center gap-2.5">
          <GithubIcon size={20} className="shrink-0 text-fg" />
          <div className="flex min-w-0 flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-fg">
              Git<span className="text-accent">Pulse</span>
              <span className="mono ml-2 align-middle text-[9px] font-normal tracking-[0.18em] text-fg-subtle">
                v1.0
              </span>
            </span>
            <span className="label-caps mt-1 hidden truncate sm:block">
              PR triage, not notifications
            </span>
          </div>
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2.5 sm:gap-4">
          {isDemo && (
            <span className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-attention)] sm:flex">
              <span className="relative flex h-1.5 w-1.5">
                <motion.span
                  className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-attention)]"
                  animate={{ scale: [1, 2.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-attention)]" />
              </span>
              Demo data
            </span>
          )}

          <span className="hidden items-center gap-1.5 md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-open)] [animation:var(--animate-pulse-soft)]" />
            <span className="label-caps">{syncedLabel}</span>
          </span>

          {/* Profile */}
          <div className="flex items-center gap-2.5">
            <div className="hidden flex-col items-end leading-tight sm:flex">
              <span className="max-w-[160px] truncate text-[13px] font-semibold text-fg">
                {profile.name || profile.login}
              </span>
              <span className="mono hidden max-w-[160px] truncate text-[11px] text-fg-subtle md:block">
                @{profile.login}
              </span>
            </div>

            {showAvatarImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.name || profile.login}
                onError={() => setImgFailed(true)}
                className="h-8 w-8 shrink-0 rounded-full bg-surface object-cover ring-1 ring-border"
              />
            ) : (
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-[13px] font-semibold text-fg ring-1 ring-border">
                {initial}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
