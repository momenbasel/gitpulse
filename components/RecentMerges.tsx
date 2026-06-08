"use client";

import { motion } from "motion/react";
import type { RecentMerge } from "@/lib/types";
import { MergeIcon, ExternalIcon, RepoIcon } from "@/lib/octicons";
import { compact, ago } from "@/lib/format";

function Lock({ size = 10 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" aria-hidden className="shrink-0 text-fg-subtle">
      <path d="M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm6.5 2V4a2.5 2.5 0 1 0-5 0v2Z" />
    </svg>
  );
}

export default function RecentMerges({ merges }: { merges: RecentMerge[] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="card p-5 sm:p-6"
    >
      <header className="mb-4 flex items-center gap-3">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: "color-mix(in srgb, var(--color-merged) 15%, transparent)", color: "var(--color-merged)" }}
        >
          <MergeIcon size={16} />
        </span>
        <h2 className="font-semibold text-fg">Recently merged</h2>
        <span className="mono ml-auto text-sm text-fg-muted">last {merges.length}</span>
      </header>

      {merges.length === 0 ? (
        <p className="py-8 text-center text-sm text-fg-muted">No merges yet.</p>
      ) : (
        <ol className="space-y-2">
          {merges.map((m, i) => (
            <motion.li
              key={m.number + m.repo}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4), ease: "easeOut" }}
              className="group flex items-center gap-3 rounded-xl border border-border-muted bg-surface-2/50 px-3 py-2.5 transition-colors hover:border-[color:var(--color-merged)]/50"
            >
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
                style={{ background: "color-mix(in srgb, var(--color-merged) 16%, transparent)", color: "var(--color-merged)" }}
              >
                <MergeIcon size={13} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] text-fg-muted">
                  <RepoIcon size={11} className="shrink-0" />
                  <span className="truncate">{m.repo}</span>
                  {m.private && <Lock />}
                  <span className="mono shrink-0 text-fg-subtle">#{m.number}</span>
                </div>
                <p className="truncate text-sm font-medium text-fg">{m.title}</p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-0.5 text-[11px] text-fg-subtle">
                <span style={{ color: "var(--color-merged)" }}>merged {ago(m.mergedDays)}</span>
                <span className="mono">
                  <span style={{ color: "var(--color-open)" }}>+{compact(m.additions)}</span>{" "}
                  <span style={{ color: "var(--color-closed)" }}>-{compact(m.deletions)}</span>
                </span>
              </div>

              <a
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-surface hover:text-fg"
                aria-label={`Open PR #${m.number}`}
              >
                <ExternalIcon size={13} />
              </a>
            </motion.li>
          ))}
        </ol>
      )}
    </motion.section>
  );
}
