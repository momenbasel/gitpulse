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
      className="sticky top-0 z-50 border-b border-border-muted bg-canvas/80 backdrop-blur-xl backdrop-saturate-150"
    >
      <div className="mx-auto flex h-[60px] max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        {/* Brand */}
        <div className="flex min-w-0 items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.06, rotate: -3 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-surface-2 text-fg shadow-[0_0_0_1px_rgba(47,129,247,0.08),0_4px_16px_-8px_rgba(47,129,247,0.55)]"
            style={{
              backgroundImage:
                "linear-gradient(140deg, rgba(47,129,247,0.18), rgba(163,113,247,0.16) 55%, rgba(63,185,80,0.14))",
            }}
          >
            <GithubIcon size={18} />
          </motion.div>

          <div className="flex min-w-0 flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-fg">
              Git<span className="grad-text">Pulse</span>
            </span>
            <span className="hidden truncate text-[11px] text-fg-subtle sm:block">
              PR triage, not notifications
            </span>
          </div>
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2.5 sm:gap-4">
          {isDemo && (
            <span className="hidden items-center gap-1.5 rounded-full border border-[var(--color-attention)]/35 bg-[var(--color-attention)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-attention)] xs:flex sm:flex">
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

          <span className="hidden items-center gap-1.5 text-[11px] text-fg-muted md:flex">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-[var(--color-open)]"
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="mono">{syncedLabel}</span>
          </span>

          {/* Profile */}
          <div className="flex items-center gap-2.5">
            <div className="hidden flex-col items-end leading-tight sm:flex">
              <span className="max-w-[160px] truncate text-[13px] font-semibold text-fg">
                {profile.name || profile.login}
              </span>
              <span className="hidden max-w-[160px] truncate text-[11px] text-fg-subtle md:block">
                @{profile.login}
              </span>
            </div>

            <div className="relative h-9 w-9 shrink-0">
              <motion.span
                aria-hidden="true"
                className="absolute -inset-[3px] rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, var(--color-accent), var(--color-merged), var(--color-open), var(--color-accent))",
                  filter: "blur(1px)",
                  opacity: 0.55,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
              />
              {showAvatarImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={profile.name || profile.login}
                  onError={() => setImgFailed(true)}
                  className="relative h-9 w-9 rounded-full bg-surface object-cover ring-2 ring-canvas"
                />
              ) : (
                <span className="relative grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-[13px] font-semibold text-fg ring-2 ring-canvas">
                  {initial}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
