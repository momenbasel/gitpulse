"use client";

import { motion } from "motion/react";
import type { RecentMerge } from "@/lib/types";
import { MergeIcon, RepoIcon, ArrowUpRightIcon } from "@/lib/octicons";
import { compact, ago } from "@/lib/format";
import SectionHeader from "@/components/SectionHeader";

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
      <SectionHeader
        index="07"
        title="Recently merged"
        icon={<MergeIcon size={14} />}
        iconColor="var(--color-merged)"
        right={
          <span className="mono text-sm text-fg-muted">
            <span className="label-caps">last</span> {merges.length}
          </span>
        }
      />

      {merges.length === 0 ? (
        <p className="py-8 text-center text-sm text-fg-muted">No merges yet.</p>
      ) : (
        <ol className="mt-3">
          {merges.map((m, i) => (
            <motion.li
              key={m.number + m.repo}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4), ease: "easeOut" }}
            >
              <a
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 border-b border-border-muted px-1 py-2.5 transition-colors hover:bg-surface-2/50"
                aria-label={`Merged PR #${m.number} in ${m.repo}: ${m.title}`}
              >
                <span className="mono w-6 shrink-0 text-[10px] text-fg-subtle">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="shrink-0" style={{ color: "var(--color-merged)" }}>
                  <MergeIcon size={13} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-fg-muted">
                    <RepoIcon size={11} className="shrink-0" />
                    <span className="truncate">{m.repo}</span>
                    {m.private && <Lock />}
                    <span className="mono shrink-0 text-fg-subtle">#{m.number}</span>
                  </div>
                  <p className="truncate text-sm font-medium text-fg underline decoration-transparent underline-offset-[3px] transition-colors group-hover:decoration-fg-muted">
                    {m.title}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-0.5 text-[11px] text-fg-subtle">
                  <span style={{ color: "var(--color-merged)" }}>merged {ago(m.mergedDays)}</span>
                  <span className="mono">
                    <span style={{ color: "var(--color-open)" }}>+{compact(m.additions)}</span>{" "}
                    <span style={{ color: "var(--color-closed)" }}>-{compact(m.deletions)}</span>
                  </span>
                </div>

                <span className="grid w-4 shrink-0 place-items-center text-fg-subtle opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg group-hover:opacity-100">
                  <ArrowUpRightIcon size={13} />
                </span>
              </a>
            </motion.li>
          ))}
        </ol>
      )}
    </motion.section>
  );
}
