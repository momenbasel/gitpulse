"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import type { ReviewBuckets, Summary } from "@/lib/types";
import { EyeIcon } from "@/lib/octicons";
import { compact } from "@/lib/format";
import CountUp from "@/components/CountUp";

type Segment = {
  key: string;
  label: string;
  count: number;
  color: string;
};

const RADIUS = 50;
const STROKE = 16;
const CIRC = 2 * Math.PI * RADIUS;

export default function ReviewDonut({
  reviewBuckets,
  summary,
}: {
  reviewBuckets: ReviewBuckets;
  summary: Summary;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const allSegments: Segment[] = [
    { key: "merged", label: "Merged", count: reviewBuckets.merged, color: "var(--color-merged)" },
    { key: "closed", label: "Closed", count: reviewBuckets.closed, color: "var(--color-closed)" },
    { key: "approved", label: "Approved", count: reviewBuckets.approved, color: "var(--color-open)" },
    { key: "changes_requested", label: "Changes requested", count: reviewBuckets.changes_requested, color: "var(--color-attention)" },
    { key: "review_required", label: "In review", count: reviewBuckets.review_required, color: "var(--color-accent)" },
    { key: "awaiting", label: "No review yet", count: reviewBuckets.awaiting, color: "var(--color-draft)" },
  ];

  const segments = allSegments.filter((s) => s.count > 0);
  const total = segments.reduce((acc, s) => acc + s.count, 0);

  // Precompute the dash offset (rotation start) for each segment around the ring.
  let cursor = 0;
  const arcs = segments.map((s) => {
    const fraction = total > 0 ? s.count / total : 0;
    const dash = fraction * CIRC;
    const offset = cursor;
    cursor += dash;
    return { ...s, fraction, dash, offset };
  });

  return (
    <section className="card p-5 sm:p-6">
      <header className="mb-5 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
          <EyeIcon size={16} />
        </span>
        <h2 className="text-fg font-semibold">Review &amp; outcome breakdown</h2>
        <span className="mono ml-auto text-sm text-fg-muted">
          {compact(summary.total ?? total)} total
        </span>
      </header>

      <div ref={ref} className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
        {/* Donut */}
        <div className="relative shrink-0">
          <svg
            viewBox="0 0 120 120"
            className="h-44 w-44 -rotate-90"
            role="img"
            aria-label="Review and outcome donut chart"
          >
            {/* Track */}
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              stroke="var(--color-border-muted, #21262d)"
              strokeWidth={STROKE}
            />
            {arcs.map((a, i) => (
              <motion.circle
                key={a.key}
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                stroke={a.color}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDashoffset={-a.offset}
                initial={{ strokeDasharray: `0 ${CIRC}` }}
                animate={
                  inView
                    ? { strokeDasharray: `${a.dash} ${CIRC - a.dash}` }
                    : { strokeDasharray: `0 ${CIRC}` }
                }
                transition={{
                  duration: 0.7,
                  ease: "easeOut",
                  delay: 0.15 + i * 0.12,
                }}
                style={{ filter: `drop-shadow(0 0 4px ${a.color}55)` }}
              />
            ))}
          </svg>

          {/* Center label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="mono text-3xl font-bold text-fg">
              <CountUp value={total} />
            </span>
            <span className="mt-0.5 text-xs text-fg-muted">pull requests</span>
          </div>
        </div>

        {/* Legend */}
        <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1">
          {arcs.map((a, i) => {
            const pct = total > 0 ? Math.round((a.count / total) * 100) : 0;
            return (
              <motion.li
                key={a.key}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 + i * 0.04 }}
                className="group flex items-center gap-2.5 rounded-xl border border-transparent px-2.5 py-1.5 transition-colors hover:border-border hover:bg-surface-2"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform group-hover:scale-125"
                  style={{ backgroundColor: a.color, boxShadow: `0 0 6px ${a.color}66` }}
                />
                <span className="truncate text-sm text-fg">{a.label}</span>
                <span className="mono ml-auto text-sm text-fg">{compact(a.count)}</span>
                <span className="mono w-12 text-right text-xs text-fg-muted">({pct}%)</span>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
