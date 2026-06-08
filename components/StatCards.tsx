"use client";

import type { JSX } from "react";
import { motion } from "motion/react";
import type { Summary, Contributions } from "@/lib/types";
import {
  PullRequestIcon,
  MergeIcon,
  ClosedIcon,
  CheckIcon,
  RepoIcon,
} from "@/lib/octicons";
import { compact } from "@/lib/format";
import CountUp from "@/components/CountUp";

type Card = {
  label: string;
  color: string;
  icon: (p: { size?: number; className?: string }) => JSX.Element;
  value: number;
  decimals?: number;
  suffix?: string;
  sub?: JSX.Element;
};

export default function StatCards({
  summary,
  contributions,
}: {
  summary: Summary;
  contributions: Contributions;
}) {
  const cards: Card[] = [
    {
      label: "Total PRs",
      color: "var(--color-accent)",
      icon: PullRequestIcon,
      value: summary.total,
      sub: (
        <span className="mono">
          <span style={{ color: "var(--color-open)" }}>
            +{compact(summary.totalAdditions)}
          </span>{" "}
          /{" "}
          <span style={{ color: "var(--color-closed)" }}>
            -{compact(summary.totalDeletions)}
          </span>{" "}
          lines
        </span>
      ),
    },
    {
      label: "Merged",
      color: "var(--color-merged)",
      icon: MergeIcon,
      value: summary.merged,
      sub: (
        <span className="mono">
          of {compact(summary.total)} · {compact(contributions.reviews)} reviews
        </span>
      ),
    },
    {
      label: "Merge rate",
      color: "var(--color-open)",
      icon: CheckIcon,
      value: summary.mergeRate,
      decimals: 1,
      suffix: "%",
    },
    {
      label: "Open",
      color: "var(--color-open)",
      icon: PullRequestIcon,
      value: summary.open,
      sub: <span className="mono">{compact(summary.draft)} draft</span>,
    },
    {
      label: "Closed",
      color: "var(--color-closed)",
      icon: ClosedIcon,
      value: summary.closed,
    },
    {
      label: "Repos",
      color: "var(--color-accent)",
      icon: RepoIcon,
      value: summary.reposTouched,
      sub: (
        <span className="mono">{compact(summary.totalFiles)} files</span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="card group relative overflow-hidden p-4 transition-colors duration-300"
            style={
              {
                "--card-accent": c.color,
              } as React.CSSProperties
            }
          >
            {/* accent border that brightens on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[14px] border border-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ borderColor: c.color }}
            />
            {/* faint radial glow, intensifies on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-90"
              style={{
                background: `radial-gradient(circle, color-mix(in srgb, ${c.color} 55%, transparent), transparent 70%)`,
              }}
            />

            <div className="relative flex flex-col gap-2">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: `color-mix(in srgb, ${c.color} 12%, transparent)`,
                  color: c.color,
                }}
              >
                <Icon size={16} />
              </span>

              <div className="mono text-2xl font-bold leading-none text-fg">
                <CountUp
                  value={c.value}
                  decimals={c.decimals}
                  suffix={c.suffix}
                />
              </div>

              <div className="text-xs font-medium text-fg-muted">{c.label}</div>

              {c.sub && (
                <div className="truncate text-[11px] text-fg-subtle">
                  {c.sub}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
