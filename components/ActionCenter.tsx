"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Triage, PR } from "@/lib/types";
import {
  AlertIcon,
  RepoIcon,
  ClockIcon,
  CheckIcon,
  CommentIcon,
  EyeIcon,
  ArrowUpRightIcon,
} from "@/lib/octicons";
import { compact, ago, bucketColor } from "@/lib/format";
import CountUp from "@/components/CountUp";
import SectionHeader from "@/components/SectionHeader";

type TabKey = "all" | "mine" | "waiting" | "ready" | "stale";

const reviewVerb = (state: string | null): string => {
  if (state === "APPROVED") return "approved";
  if (state === "CHANGES_REQUESTED") return "requested changes";
  if (state === "DISMISSED") return "dismissed review";
  return "reviewed";
};
const reviewColor = (state: string | null): string => {
  if (state === "APPROVED") return "var(--color-open)";
  if (state === "CHANGES_REQUESTED") return "var(--color-attention)";
  return "var(--color-fg-subtle)";
};

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
      <SectionHeader
        index="02"
        title="Action center"
        hint="What actually needs you — sorted by priority, then idle time"
        icon={<AlertIcon size={14} />}
        iconColor="var(--color-attention)"
        right={
          <div className="flex flex-wrap items-center gap-3">
            {pills.map((p) => (
              <span key={p.label} className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: p.color }}
                />
                <span className="mono text-xs font-semibold" style={{ color: p.color }}>
                  <CountUp value={p.value} />
                </span>
                <span className="label-caps !text-[9px]">{p.label}</span>
              </span>
            ))}
          </div>
        }
      />

      {/* Tabs — plain text with an animated underline, no segmented boxes */}
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-b border-border-muted">
        {TABS.map((t) => {
          const active = tab === t.key;
          const count = counts[t.key];
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="relative flex items-center gap-1.5 pb-2.5 text-xs font-medium transition-colors focus:outline-none"
              style={{ color: active ? t.color : "var(--color-fg-muted)" }}
            >
              <span>{t.label}</span>
              <span
                className="mono text-[10px] leading-none"
                style={{ color: active ? t.color : "var(--color-fg-subtle)" }}
              >
                {count}
              </span>
              {active && (
                <motion.span
                  layoutId="action-tab-underline"
                  className="absolute inset-x-0 -bottom-px h-[2px]"
                  style={{ background: t.color }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Column header (desktop) — the register key */}
      {filtered.length > 0 && (
        <div className="hidden items-center gap-3 border-b border-border-muted px-2 py-2 sm:flex">
          <span className="label-caps w-8 shrink-0 !text-[9px]">n°</span>
          <span className="label-caps hidden w-40 shrink-0 !text-[9px] lg:block">
            signal
          </span>
          <span className="label-caps min-w-0 flex-1 !text-[9px]">pull request</span>
          <span className="label-caps w-[10.5rem] shrink-0 !text-[9px] text-right">
            idle / age / ±lines
          </span>
          <span className="w-4 shrink-0" />
        </div>
      )}

      {/* Register — hairline-divided rows, no boxes */}
      <div className="fade-mask-b max-h-[30rem] overflow-y-auto pb-6">
        {filtered.length === 0 ? (
          <motion.div
            key={`empty-${tab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center gap-2 py-14 text-center"
          >
            <span style={{ color: "var(--color-open)" }}>
              <CheckIcon size={28} />
            </span>
            <p className="text-fg font-medium">Inbox zero</p>
            <p className="label-caps">Nothing in this lane</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((item, i) => {
              const color = bucketColor(item.bucket);
              return (
                <motion.a
                  key={item.number}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                    delay: Math.min(i * 0.03, 0.4),
                  }}
                  className="group flex items-center gap-3 border-b border-border-muted px-2 py-3 transition-colors hover:bg-surface-2/50"
                  aria-label={`PR #${item.number} in ${item.repo}: ${item.title}`}
                >
                  {/* index — carries the bucket color, like an edition number */}
                  <span
                    className="mono w-8 shrink-0 text-[11px] font-semibold"
                    style={{ color }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Reason chip — fixed column, full text in tooltip */}
                  <span
                    title={item.reason}
                    className="hidden w-40 shrink-0 truncate whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider lg:inline-block"
                    style={{ color }}
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
                    <p className="truncate text-fg font-medium underline decoration-transparent underline-offset-[3px] transition-colors group-hover:decoration-fg-muted">
                      {item.title}
                    </p>
                    {item.lastActivityAt ? (
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-fg-subtle">
                        {item.lastActivityKind === "review" ? (
                          <span style={{ color: reviewColor(item.lastActivityState) }}>
                            <EyeIcon size={11} />
                          </span>
                        ) : (
                          <CommentIcon size={11} className="shrink-0" />
                        )}
                        <span className="truncate">
                          {item.lastActivityKind === "review" ? (
                            <span style={{ color: reviewColor(item.lastActivityState) }}>
                              {reviewVerb(item.lastActivityState)}
                            </span>
                          ) : (
                            "last comment"
                          )}{" "}
                          {item.lastActivityBy && (
                            <span className="text-fg-muted">@{item.lastActivityBy}</span>
                          )}{" "}
                          · {ago(item.lastActivityDays)}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-fg-subtle/70">
                        <CommentIcon size={11} className="shrink-0" />
                        <span>no replies yet</span>
                      </div>
                    )}
                  </div>

                  {/* Meta — fixed-width tabular register */}
                  <div className="mono flex w-[10.5rem] shrink-0 items-center justify-end gap-3 text-[11px] text-fg-subtle">
                    <span className="flex w-12 shrink-0 items-center justify-end gap-1">
                      {item.stale && (
                        <span style={{ color: "var(--color-attention)" }}>
                          <ClockIcon size={10} />
                        </span>
                      )}
                      <span className="text-fg-muted">{item.idleDays}d</span>
                    </span>
                    <span className="hidden w-10 shrink-0 text-right sm:inline">
                      {item.ageDays}d
                    </span>
                    <span className="hidden w-[4.5rem] shrink-0 whitespace-nowrap text-right md:inline">
                      <span style={{ color: "var(--color-open)" }}>
                        +{compact(item.additions)}
                      </span>{" "}
                      <span style={{ color: "var(--color-closed)" }}>
                        -{compact(item.deletions)}
                      </span>
                    </span>
                  </div>

                  {/* Arrow — whole row is the link */}
                  <span className="grid w-4 shrink-0 place-items-center text-fg-subtle opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg group-hover:opacity-100">
                    <ArrowUpRightIcon size={13} />
                  </span>
                </motion.a>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
