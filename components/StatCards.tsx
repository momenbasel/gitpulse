"use client";

import { useMemo, useState, type JSX } from "react";
import { motion } from "motion/react";
import type { Summary, Contributions, PR, PRStatus } from "@/lib/types";
import {
  PullRequestIcon,
  MergeIcon,
  ClosedIcon,
  DraftIcon,
  CheckIcon,
  RepoIcon,
  CommentIcon,
  EyeIcon,
  ArrowUpRightIcon,
} from "@/lib/octicons";
import { compact, ago, statusColor } from "@/lib/format";
import CountUp from "@/components/CountUp";
import PRListModal from "@/components/PRListModal";
import SectionHeader from "@/components/SectionHeader";
import CornerBrackets from "@/components/CornerBrackets";

type IconC = (p: { size?: number; className?: string }) => JSX.Element;
type View = "prs" | "repos";

type Card = {
  key: string;
  label: string;
  color: string;
  icon: IconC;
  value: number;
  decimals?: number;
  suffix?: string;
  sub?: JSX.Element;
  view: View;
  modalTitle: string;
  modalSub: string;
  match?: (p: PR) => boolean;
};

const statusIcon: Record<PRStatus, IconC> = {
  merged: MergeIcon,
  open: PullRequestIcon,
  draft: DraftIcon,
  closed: ClosedIcon,
};

const daysSince = (iso: string | null): number | null =>
  iso ? Math.floor((Date.now() - Date.parse(iso)) / 864e5) : null;

function statusTime(p: PR): string {
  if (p.status === "merged") return `merged ${ago(daysSince(p.mergedAt))}`;
  if (p.status === "closed") return `closed ${ago(daysSince(p.closedAt))}`;
  return `${ago(p.idleDays)} idle`;
}

function Lock({ size = 10 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" aria-hidden className="shrink-0 text-fg-subtle">
      <path d="M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm6.5 2V4a2.5 2.5 0 1 0-5 0v2Z" />
    </svg>
  );
}

function PRRows({ items }: { items: PR[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (p) => p.title.toLowerCase().includes(s) || p.repo.toLowerCase().includes(s)
    );
  }, [items, q]);

  return (
    <>
      <div className="sticky top-0 z-10 -mx-1 mb-1 bg-[color:var(--color-surface)]/85 px-1 pb-2 pt-1 backdrop-blur">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${items.length} pull requests...`}
          className="mono w-full rounded-md border border-border bg-canvas-inset px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-[color:var(--color-accent)]"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-fg-muted">No matches.</p>
      ) : (
        <ul>
          {filtered.map((p, i) => {
            const Icon = statusIcon[p.status];
            const color = statusColor[p.status];
            return (
              <motion.li
                key={p.repo + p.number}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.012, 0.4) }}
                className="group flex items-center gap-3 border-b border-border-muted px-1 py-2.5 transition-colors hover:bg-surface-2/50"
              >
                <span className="shrink-0" style={{ color }}>
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-fg-muted">
                    <span className="truncate">{p.repo}</span>
                    {p.private && <Lock />}
                    <span className="mono shrink-0 text-fg-subtle">#{p.number}</span>
                  </div>
                  <p className="truncate text-sm font-medium text-fg underline decoration-transparent underline-offset-[3px] transition-colors group-hover:decoration-fg-muted">
                    {p.title}
                  </p>
                  {p.lastActivityAt && (
                    <span className="mt-0.5 flex items-center gap-1 text-[10px] text-fg-subtle">
                      {p.lastActivityKind === "review" ? <EyeIcon size={10} /> : <CommentIcon size={10} />}
                      {p.lastActivityKind === "review" ? "reviewed" : "comment"}
                      {p.lastActivityBy && <span className="text-fg-muted">@{p.lastActivityBy}</span>}
                      · {ago(p.lastActivityDays)}
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5 text-[11px] text-fg-subtle">
                  <span style={{ color }}>{statusTime(p)}</span>
                  <span className="mono">
                    <span style={{ color: "var(--color-open)" }}>+{compact(p.additions)}</span>{" "}
                    <span style={{ color: "var(--color-closed)" }}>-{compact(p.deletions)}</span>
                  </span>
                </div>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 p-1 text-fg-subtle opacity-0 transition-all hover:text-fg group-hover:opacity-100"
                  aria-label={`Open PR #${p.number}`}
                >
                  <ArrowUpRightIcon size={13} />
                </a>
              </motion.li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function RepoRows({ items }: { items: PR[] }) {
  const repos = useMemo(() => {
    const m: Record<string, { repo: string; total: number; merged: number; open: number; closed: number; private: boolean }> = {};
    for (const p of items) {
      const o = (m[p.repo] ||= { repo: p.repo, total: 0, merged: 0, open: 0, closed: 0, private: p.private });
      o.total++;
      o[p.status === "draft" ? "open" : p.status]++;
    }
    return Object.values(m).sort((a, b) => b.total - a.total);
  }, [items]);

  return (
    <ul>
      {repos.map((r, i) => {
        const seg = (n: number, c: string) =>
          n > 0 ? <span style={{ width: `${(n / r.total) * 100}%`, background: c }} className="h-full" /> : null;
        return (
          <motion.li
            key={r.repo}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.015, 0.4) }}
            className="border-b border-border-muted px-1 py-2.5"
          >
            <div className="mb-1.5 flex items-center gap-2 text-sm">
              <span className="mono w-6 shrink-0 text-[10px] text-fg-subtle">
                {String(i + 1).padStart(2, "0")}
              </span>
              <RepoIcon size={13} className="shrink-0 text-fg-subtle" />
              <span className="truncate text-fg">{r.repo}</span>
              {r.private && <Lock />}
              <span className="mono ml-auto shrink-0 text-fg-muted">{r.total}</span>
            </div>
            <div className="ml-8 flex h-1 overflow-hidden rounded-full bg-surface-2">
              {seg(r.merged, "var(--color-merged)")}
              {seg(r.open, "var(--color-open)")}
              {seg(r.closed, "var(--color-closed)")}
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}

export default function StatCards({
  summary,
  contributions,
  prs,
}: {
  summary: Summary;
  contributions: Contributions;
  prs: PR[];
}) {
  const [active, setActive] = useState<Card | null>(null);

  const cards: Card[] = [
    {
      key: "total", label: "Total PRs", color: "var(--color-accent)", icon: PullRequestIcon,
      value: summary.total, view: "prs", match: () => true,
      modalTitle: "All pull requests", modalSub: `Everything you've authored across ${summary.reposTouched} repos`,
      sub: (
        <span className="mono">
          <span style={{ color: "var(--color-open)" }}>+{compact(summary.totalAdditions)}</span> /{" "}
          <span style={{ color: "var(--color-closed)" }}>-{compact(summary.totalDeletions)}</span> lines
        </span>
      ),
    },
    {
      key: "merged", label: "Merged", color: "var(--color-merged)", icon: MergeIcon,
      value: summary.merged, view: "prs", match: (p) => p.status === "merged",
      modalTitle: "Merged pull requests", modalSub: "Shipped and merged",
      sub: <span className="mono">of {compact(summary.total)} · {compact(contributions.reviews)} reviews</span>,
    },
    {
      key: "rate", label: "Merge rate", color: "var(--color-open)", icon: CheckIcon,
      value: summary.mergeRate, decimals: 1, suffix: "%", view: "prs",
      match: (p) => p.status === "merged" || p.status === "closed",
      modalTitle: "Decided pull requests", modalSub: `${summary.merged} merged vs ${summary.closed} closed = ${summary.mergeRate}% merge rate`,
    },
    {
      key: "open", label: "Open", color: "var(--color-open)", icon: PullRequestIcon,
      value: summary.open, view: "prs", match: (p) => p.status === "open" || p.status === "draft",
      modalTitle: "Open pull requests", modalSub: "Still in flight",
      sub: <span className="mono">{compact(summary.draft)} draft</span>,
    },
    {
      key: "closed", label: "Closed", color: "var(--color-closed)", icon: ClosedIcon,
      value: summary.closed, view: "prs", match: (p) => p.status === "closed",
      modalTitle: "Closed without merge", modalSub: "Abandoned or superseded",
    },
    {
      key: "repos", label: "Repos", color: "var(--color-accent)", icon: RepoIcon,
      value: summary.reposTouched, view: "repos",
      modalTitle: "Repositories", modalSub: `${summary.reposTouched} repos · ${compact(summary.totalFiles)} files changed`,
      sub: <span className="mono">{compact(summary.totalFiles)} files</span>,
    },
  ];

  const items = active && active.match ? prs.filter(active.match) : prs;
  const modalCount =
    active?.view === "repos" ? new Set(items.map((p) => p.repo)).size : items.length;

  return (
    <section>
      <SectionHeader
        index="01"
        title="Overview"
        hint="Every card drills into the pull requests behind it"
        right={
          <span className="label-caps hidden sm:block">
            {cards.length} signals · click to inspect
          </span>
        }
      />

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.button
              key={c.key}
              type="button"
              onClick={() => setActive(c)}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="card group relative cursor-pointer overflow-hidden p-4 text-left transition-colors duration-300 hover:border-border"
              style={{ ["--bracket-color" as string]: c.color }}
              aria-label={`${c.label}: view ${c.value}`}
            >
              {/* orbiting border beam on hover */}
              <span
                aria-hidden
                className="beam pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ ["--beam-color" as string]: c.color }}
              />
              <CornerBrackets offset={5} />

              <div className="relative flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="mono text-[10px] tracking-wider text-fg-subtle/80">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ color: c.color }}>
                    <Icon size={14} />
                  </span>
                </div>
                <div className="mono text-[1.65rem] font-bold leading-none tracking-tight text-fg">
                  <CountUp value={c.value} decimals={c.decimals} suffix={c.suffix} />
                </div>
                <div className="label-caps !text-[10px]" style={{ color: c.color }}>
                  {c.label}
                </div>
                {c.sub && (
                  <div className="truncate border-t border-border-muted pt-2 text-[11px] text-fg-subtle">
                    {c.sub}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <PRListModal
        open={!!active}
        title={active?.modalTitle ?? ""}
        subtitle={active?.modalSub}
        accent={active?.color ?? "var(--color-accent)"}
        count={modalCount}
        onClose={() => setActive(null)}
      >
        {active?.view === "repos" ? <RepoRows items={items} /> : <PRRows items={items} />}
      </PRListModal>
    </section>
  );
}
