"use client";

import { useRef, useState, type PointerEvent } from "react";
import { motion } from "motion/react";
import type { TimelinePoint } from "@/lib/types";
import { monthLabel } from "@/lib/format";
import { ZapIcon } from "@/lib/octicons";
import SectionHeader from "@/components/SectionHeader";

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

/** Animated line + area chart with an interactive crosshair scrubber. */
export default function ActivityTimeline({ timeline }: Props) {
  const data = timeline.slice(-18);
  const n = data.length;
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

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

  /** Map a pointer event to the nearest data index, in viewBox space. */
  const trackPointer = (e: PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || n === 0) return;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return;
    const vx = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < n; i++) {
      const dist = Math.abs(xAt(i) - vx);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    setHoverIdx(best);
  };

  const hoverPoint = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <section className="card p-5 sm:p-6">
      <SectionHeader
        index="04"
        title="Activity over time"
        hint="Scrub the chart for exact months"
        icon={<ZapIcon size={15} />}
        iconColor="var(--color-accent)"
        right={
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: "var(--color-accent)" }}
              />
              <span className="label-caps">Created</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: "var(--color-merged)" }}
              />
              <span className="label-caps">Merged</span>
            </span>
          </div>
        }
      />

      {/* Chart */}
      <div className="relative mt-5 w-full">
        {/* scrubber readout */}
        <div
          aria-live="polite"
          className={`mono pointer-events-none absolute right-1 top-0 z-10 flex items-center gap-3 rounded-md border border-border bg-canvas-inset/90 px-2.5 py-1.5 text-[11px] backdrop-blur transition-opacity duration-150 ${
            hoverPoint ? "opacity-100" : "opacity-0"
          }`}
        >
          {hoverPoint && (
            <>
              <span className="font-semibold text-fg">
                {monthLabel(hoverPoint.month)}
              </span>
              <span className="flex items-center gap-1 text-fg-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                {hoverPoint.created} created
              </span>
              <span className="flex items-center gap-1 text-fg-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-merged)]" />
                {hoverPoint.merged} merged
              </span>
            </>
          )}
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="auto"
          role="img"
          aria-label="Line chart of created and merged pull requests over time"
          style={{ display: "block", overflow: "visible", cursor: "crosshair" }}
          onPointerMove={trackPointer}
          onPointerLeave={() => setHoverIdx(null)}
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
                fill={
                  hoverIdx === i
                    ? "var(--color-fg)"
                    : "var(--color-fg-subtle)"
                }
                style={{ transition: "fill 120ms ease" }}
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
                r={hoverIdx === i ? 4.5 : 3}
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
                style={{
                  transformOrigin: `${p.x}px ${p.y}px`,
                  transition: "r 120ms ease",
                }}
              />
            ))
          )}

          {/* Crosshair */}
          {hoverIdx !== null && (
            <g pointerEvents="none">
              <line
                x1={xAt(hoverIdx)}
                y1={PAD_T}
                x2={xAt(hoverIdx)}
                y2={PAD_T + PLOT_H}
                stroke="var(--color-fg-subtle)"
                strokeWidth={1}
                strokeDasharray="2 3"
                opacity={0.6}
              />
              {SERIES.map((s) => (
                <circle
                  key={`xh-${s.key}`}
                  cx={xAt(hoverIdx)}
                  cy={yAt(data[hoverIdx][s.key])}
                  r={6.5}
                  fill="none"
                  stroke={s.stroke}
                  strokeWidth={1}
                  opacity={0.5}
                />
              ))}
            </g>
          )}
        </svg>
      </div>
    </section>
  );
}
