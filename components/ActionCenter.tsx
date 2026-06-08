"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Triage, PR } from "@/lib/types";
import {
  AlertIcon,
  ZapIcon,
  RepoIcon,
  ExternalIcon,
  ClockIcon,
  CheckIcon,
} from "@/lib/octicons";
import { compact, ago, bucketMeta, bucketColor } from "@/lib/format";
import CountUp from "@/components/CountUp";

type TabKey = "all" | "mine" | "waiting" | "ready" | "stale";

interface TabDef {
  key: TabKey;
  label: string;
  color: string;
}

const TABS: TabDef[] = [
  { key: "all", label: "All", color: "var(--color-fg)" },
  { key: "mine", label: "Needs you", color: "var(--color-attention)" },
  { key: "waiting", label: "Waiting", color: "var(--color-accent)" },
  { key: "ready", label: "Ready", color: "var(--color-open)" },
  { key: "stale", label: "Stale", color: "var(--color-fg-subtle)" },
];

function glowFor(bucket: string): string {
  if (bucket === "ready") return bucketMeta.ready.glow;
  if (bucket === "mine") return bucketMeta.mine.glow;
  if (bucket === "waiting") return bucketMeta.waiting.glow;
  return "rgba(110,118,129,0.3)";
}

export default function ActionCenter({
  triage,
}: {
  triage: Triage;
  prs: PR[];
}) {
  const [tab, setTab] = useState<TabKey>("all");

  const feed = triage.feed;

  const counts = useMemo(() => {
    let mine = 0;
    let waiting = 0;
    let ready = 0;
    let stale = 0;
    for (const f of feed) {
      if (f.bucket === "mine") mine++;
      else if (f.bucket === "waiting") waiting++;
      else if (f.bucket === "ready") ready++;
      if (f.stale) stale++;
    }
    return { all: feed.length, mine, waiting, ready, stale };
  }, [feed]);

  const filtered = useMemo(() => {
    switch (tab) {
      case "mine":
        return feed.filter((f) => f.bucket === "mine");
      case "waiting":
        return feed.filter((f) => f.bucket === "waiting");
      case "ready":
        return feed.filter((f) => f.bucket === "ready");
      case "stale":
        return feed.filter((f) => f.stale === true);
      default:
        return feed;
    }
  }, [feed, tab]);

  const pills: { label: string; value: number; color: string }[] = [
    { label: "need you", value: triage.mine, color: "var(--color-attention)" },
    { label: "waiting", value: triage.waiting, color: "var(--color-accent)" },
    { label: "ready", value: triage.ready, color: "var(--color-open)" },
    { label: "stale", value: triage.stale, color: "var(--color-fg-subtle)" },
  ];

  return (
    <section className="card p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border-muted"
            style={{
              background:
                "linear-gradient(135deg, rgba(210,153,34,0.18), rgba(47,129,247,0.14))",
              color: "var(--color-attention)",
            }}
          >
            <span className="relative inline-flex">
              <AlertIcon size={16} />
              <motion.span
                className="absolute -right-1 -top-1"
                style={{ color: "var(--color-accent)" }}
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.85, 1, 0.85] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ZapIcon size={9} />
              </motion.span>
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-fg font-semibold leading-tight">
              Action Center
            </h2>
            <p className="text-fg-muted text-xs sm:text-sm">
              What actually needs you — sorted by priority
            </p>
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex flex-wrap gap-2">
          {pills.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.04, ease: "easeOut" }}
              className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
              style={{
                borderColor: p.color,
                background: `color-mix(in srgb, ${p.color} 12%, transparent)`,
                color: p.color,
              }}
            >
              <span className="mono font-semibold">
                <CountUp value={p.value} />
              </span>
              <span className="text-fg-muted">{p.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex flex-wrap gap-1 rounded-xl border border-border-muted bg-canvas-inset/60 p-1">
        {TABS.map((t) => {
          const active = tab === t.key;
          const count = counts[t.key];
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none"
              style={{ color: active ? t.color : "var(--color-fg-muted)" }}
            >
              {active && (
                <motion.span
                  layoutId="action-tab-pill"
                  className="absolute inset-0 rounded-lg border"
                  style={{
                    borderColor: t.color,
                    background: `color-mix(in srgb, ${t.color} 14%, transparent)`,
                  }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
              <span
                className="relative z-10 mono rounded-full px-1.5 py-0.5 text-[10px] leading-none"
                style={{
                  background: active
                    ? `color-mix(in srgb, ${t.color} 22%, transparent)`
                    : "var(--color-surface-2)",
                  color: active ? t.color : "var(--color-fg-subtle)",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="mt-4 max-h-[30rem] space-y-2 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <motion.div
            key={`empty-${tab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-muted bg-surface-2/40 py-12 text-center"
          >
            <span style={{ color: "var(--color-open)" }}>
              <CheckIcon size={28} />
            </span>
            <p className="text-fg font-medium">Inbox zero</p>
            <p className="text-fg-muted text-sm">Nothing in this lane.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((item, i) => {
              const color = bucketColor(item.bucket);
              const glow = glowFor(item.bucket);
              return (
                <motion.div
                  key={item.number}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                    delay: Math.min(i * 0.03, 0.4),
                  }}
                  whileHover={{ x: 4 }}
                  className="group flex items-center gap-3 rounded-xl border border-border-muted bg-surface-2/60 px-4 py-3 transition-colors"
                  style={{ ["--row-color" as string]: color }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--color-border-muted)";
                  }}
                >
                  {/* Priority bar */}
                  <span
                    className="h-9 w-[3px] shrink-0 rounded-full"
                    style={{
                      background: color,
                      boxShadow: `0 0 8px ${glow}`,
                    }}
                  />

                  {/* Reason chip */}
                  <span
                    className="hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-medium sm:inline-block"
                    style={{
                      background: `color-mix(in srgb, ${color} 15%, transparent)`,
                      color,
                    }}
                  >
                    {item.reason}
                  </span>

                  {/* Main */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-fg-muted text-xs">
                      <RepoIcon size={12} className="shrink-0" />
                      <span className="truncate">{item.repo}</span>
                      {item.private && (
                        <svg
                          viewBox="0 0 16 16"
                          width={10}
                          height={10}
                          fill="currentColor"
                          aria-hidden="true"
                          className="shrink-0 text-fg-subtle"
                        >
                          <path d="M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm6.5 2V4a2.5 2.5 0 1 0-5 0v2Z" />
                        </svg>
                      )}
                      <span className="mono shrink-0 text-fg-subtle">
                        #{item.number}
                      </span>
                    </div>
                    <p className="truncate text-fg font-medium">{item.title}</p>
                  </div>

                  {/* Meta */}
                  <div className="flex shrink-0 flex-col items-end gap-0.5 text-xs text-fg-subtle">
                    <div className="flex items-center gap-2">
                      {item.stale && (
                        <span style={{ color: "var(--color-attention)" }}>
                          <ClockIcon size={11} />
                        </span>
                      )}
                      <span>{ago(item.idleDays)} idle</span>
                    </div>
                    <span className="hidden sm:inline">{item.ageDays}d old</span>
                    <div className="mono flex items-center gap-1.5">
                      <span style={{ color: "var(--color-open)" }}>
                        +{compact(item.additions)}
                      </span>
                      <span style={{ color: "var(--color-closed)" }}>
                        -{compact(item.deletions)}
                      </span>
                    </div>
                  </div>

                  {/* External link */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-surface hover:text-fg"
                    aria-label={`Open PR #${item.number}`}
                  >
                    <ExternalIcon size={14} />
                  </a>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
