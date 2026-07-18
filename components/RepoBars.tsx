"use client";

import { motion } from "motion/react";
import type { RepoStat } from "@/lib/types";
import { RepoIcon, StarIcon } from "@/lib/octicons";
import { compact } from "@/lib/format";
import CountUp from "@/components/CountUp";
import SectionHeader from "@/components/SectionHeader";

const SEGMENTS = [
  { key: "merged" as const, color: "var(--color-merged)" },
  { key: "open" as const, color: "var(--color-open)" },
  { key: "closed" as const, color: "var(--color-closed)" },
];

function Lock({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M4 4a4 4 0 0 1 8 0v2h.25A1.75 1.75 0 0 1 14 7.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5A1.75 1.75 0 0 1 3.75 6H4Zm6.5 2V4a2.5 2.5 0 1 0-5 0v2Z" />
    </svg>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span className="label-caps">{label}</span>
    </span>
  );
}

export default function RepoBars({ topRepos }: { topRepos: RepoStat[] }) {
  const rows = topRepos.slice(0, 8);

  return (
    <section className="card p-5 sm:p-6">
      <SectionHeader
        index="06"
        title="Top repositories"
        icon={<RepoIcon size={15} />}
        iconColor="var(--color-accent)"
        right={
          <span className="mono text-sm text-fg-muted">
            <CountUp value={topRepos.length} />{" "}
            <span className="label-caps">repos</span>
          </span>
        }
      />

      <div className="mt-4 flex items-center gap-4">
        <LegendDot color="var(--color-merged)" label="Merged" />
        <LegendDot color="var(--color-open)" label="Open" />
        <LegendDot color="var(--color-closed)" label="Closed" />
      </div>

      <div className="mt-4 flex flex-col gap-1">
        {rows.map((r, i) => {
          const slash = r.repo.indexOf("/");
          const owner = slash >= 0 ? r.repo.slice(0, slash) : "";
          const name = slash >= 0 ? r.repo.slice(slash + 1) : r.repo;
          const denom = r.total > 0 ? r.total : 1;

          return (
            <motion.div
              key={r.repo}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.05 }}
              className="group rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-2/60"
            >
              <div className="flex items-center gap-2">
                <span className="mono w-6 shrink-0 text-[10px] text-fg-subtle">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 truncate text-sm text-fg-muted transition-colors group-hover:text-accent">
                  {owner && <span>{owner}/</span>}
                  <span className="font-semibold text-fg group-hover:text-accent">{name}</span>
                </span>
                {r.private && (
                  <span className="text-fg-subtle">
                    <Lock />
                  </span>
                )}
                <div className="ml-auto flex items-center gap-2.5">
                  {/* line diff, revealed on hover */}
                  <span className="mono hidden text-[11px] opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:inline">
                    <span style={{ color: "var(--color-open)" }}>+{compact(r.additions)}</span>{" "}
                    <span style={{ color: "var(--color-closed)" }}>-{compact(r.deletions)}</span>
                  </span>
                  {r.stars > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-fg-muted">
                      <StarIcon size={12} />
                      {compact(r.stars)}
                    </span>
                  )}
                  <span className="mono rounded-sm border border-border-muted bg-surface px-1.5 py-0.5 text-xs text-fg-muted">
                    {compact(r.total)}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-surface-2 transition-all duration-200 group-hover:h-2.5">
                {SEGMENTS.map((seg, si) => {
                  const pct = (r[seg.key] / denom) * 100;
                  if (pct <= 0) return null;
                  return (
                    <motion.div
                      key={seg.key}
                      className="h-full transition-[filter] duration-200 group-hover:brightness-125"
                      style={{
                        background: seg.color,
                        boxShadow: `0 0 8px ${seg.color}66`,
                      }}
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{
                        duration: 0.7,
                        ease: "easeOut",
                        delay: i * 0.05 + si * 0.08,
                      }}
                    />
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
