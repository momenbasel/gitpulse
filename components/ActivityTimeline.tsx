"use client";

import { motion } from "motion/react";
import type { TimelinePoint } from "@/lib/types";
import { monthLabel } from "@/lib/format";
import { ZapIcon } from "@/lib/octicons";

interface Props {
  timeline: TimelinePoint[];
}

// Fixed coordinate space — SVG scales to container width via viewBox.
const W = 760;
const H = 220;
const PAD_L = 40;
const PAD_R = 16;
const PAD_T = 18;
const PAD_B = 32;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

type Series = { key: "created" | "merged"; stroke: string; gradId: string };

const SERIES: Series[] = [
  { key: "created", stroke: "var(--color-accent)", gradId: "gp-area-created" },
  { key: "merged", stroke: "var(--color-merged)", gradId: "gp-area-merged" },
];

/** Animated line + area chart of created vs merged PRs over time. */
export default function ActivityTimeline({ timeline }: Props) {
  const data = timeline.slice(-18);
  const n = data.length;

  const yMax = Math.max(
    1,
    ...data.map((d) => Math.max(d.created, d.merged))
  );

  // X position for a given index (single point centers on the plot).
  const xAt = (i: number) =>
    PAD_L + (n <= 1 ? PLOT_W / 2 : (i / (n - 1)) * PLOT_W);
  // Y position for a given value (0 at bottom, yMax at top).
  const yAt = (v: number) => PAD_T + PLOT_H - (v / yMax) * PLOT_H;

  // Horizontal gridlines + y tick labels (4 lines incl. baseline + top).
  const TICKS = 4;
  const gridlines = Array.from({ length: TICKS }, (_, i) => {
    const frac = i / (TICKS - 1);
    return {
      y: PAD_T + PLOT_H - frac * PLOT_H,
      value: Math.round(frac * yMax),
    };
  });

  // Show every x label when sparse, otherwise every other one.
  const labelStep = n <= 8 ? 1 : 2;

  const points = (key: Series["key"]) =>
    data.map((d, i) => ({ x: xAt(i), y: yAt(d[key]), v: d[key] }));

  const linePath = (key: Series["key"]) =>
    points(key)
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(" ");

  // Area fill: line path closed down to the baseline.
  const areaPath = (key: Series["key"]) => {
    const pts = points(key);
    if (pts.length === 0) return "";
    const baseline = PAD_T + PLOT_H;
    const top = pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(" ");
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `${top} L${last.x.toFixed(2)},${baseline} L${first.x.toFixed(
      2
    )},${baseline} Z`;
  };

  const viewport = { once: true, margin: "-60px" } as const;

  return (
    <section className="card p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              color: "var(--color-accent)",
              background: "rgba(47,129,247,0.12)",
              border: "1px solid rgba(47,129,247,0.25)",
            }}
          >
            <ZapIcon size={16} />
          </span>
          <div>
            <h3 className="text-fg font-semibold leading-tight">
              Activity over time
            </h3>
            <p className="text-fg-subtle text-xs">Created vs merged pull requests</p>
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-fg-muted">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: "var(--color-accent)" }}
            />
            Created
          </span>
          <span className="flex items-center gap-1.5 text-fg-muted">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: "var(--color-merged)" }}
            />
            Merged
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-5 w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="auto"
          role="img"
          aria-label="Line chart of created and merged pull requests over time"
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <linearGradient id="gp-area-created" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gp-area-merged" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-merged)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-merged)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Gridlines + y tick labels */}
          {gridlines.map((g, i) => (
            <g key={`grid-${i}`}>
              <line
                x1={PAD_L}
                y1={g.y}
                x2={W - PAD_R}
                y2={g.y}
                stroke="var(--color-border-muted)"
                strokeWidth={1}
                strokeDasharray={i === 0 ? undefined : "3 4"}
              />
              <text
                x={PAD_L - 8}
                y={g.y}
                textAnchor="end"
                dominantBaseline="middle"
                className="mono"
                fontSize={10}
                fill="var(--color-fg-subtle)"
              >
                {g.value}
              </text>
            </g>
          ))}

          {/* X axis month labels */}
          {data.map((d, i) =>
            i % labelStep === 0 || i === n - 1 ? (
              <text
                key={`xl-${i}`}
                x={xAt(i)}
                y={H - 10}
                textAnchor="middle"
                fontSize={10}
                fill="var(--color-fg-subtle)"
              >
                {monthLabel(d.month)}
              </text>
            ) : null
          )}

          {/* Area fills — fade in after the lines draw */}
          {SERIES.map((s, si) => (
            <motion.path
              key={`area-${s.key}`}
              d={areaPath(s.key)}
              fill={`url(#${s.gradId})`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={viewport}
              transition={{ duration: 0.6, delay: 0.5 + si * 0.1, ease: "easeOut" }}
            />
          ))}

          {/* Lines — draw via pathLength */}
          {SERIES.map((s, si) => (
            <motion.path
              key={`line-${s.key}`}
              d={linePath(s.key)}
              fill="none"
              stroke={s.stroke}
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={viewport}
              transition={{
                duration: 1.05,
                delay: si * 0.12,
                ease: "easeInOut",
              }}
              style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.35))" }}
            />
          ))}

          {/* Data dots — pop in, staggered, after lines */}
          {SERIES.map((s) =>
            points(s.key).map((p, i) => (
              <motion.circle
                key={`dot-${s.key}-${i}`}
                cx={p.x}
                cy={p.y}
                r={3}
                fill="var(--color-canvas)"
                stroke={s.stroke}
                strokeWidth={1.75}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={viewport}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 20,
                  delay: 0.55 + i * 0.04,
                }}
                style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              />
            ))
          )}
        </svg>
      </div>
    </section>
  );
}
