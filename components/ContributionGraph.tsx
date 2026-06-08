"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import type { CalDay, Contributions } from "@/lib/types";
import { CalendarIcon } from "@/lib/octicons";
import { monthLabel, relDate } from "@/lib/format";
import CountUp from "@/components/CountUp";

const CELL = 11;
const PITCH = 13;
const LABEL_TOP = 18; // space reserved for month labels
const LABEL_LEFT = 30; // space reserved for weekday labels

const WEEKDAYS = ["Mon", "Wed", "Fri"];
const WEEKDAY_ROWS: Record<string, number> = { Mon: 1, Wed: 3, Fri: 5 };

const CAL_VARS = [
  "var(--color-cal-0)",
  "var(--color-cal-1)",
  "var(--color-cal-2)",
  "var(--color-cal-3)",
  "var(--color-cal-4)",
];

export default function ContributionGraph({
  calendar,
  contributions,
}: {
  calendar: CalDay[][];
  contributions: Contributions;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const weeks = calendar.length;
  const gridW = weeks * PITCH;
  const gridH = 7 * PITCH;
  const vbW = LABEL_LEFT + gridW;
  const vbH = LABEL_TOP + gridH;

  // Compute month-change positions for the top labels.
  const monthMarks: { x: number; label: string }[] = [];
  let lastMonth = "";
  calendar.forEach((week, wi) => {
    const first = week[0];
    if (!first) return;
    const ym = first.date.slice(0, 7); // YYYY-MM
    if (ym !== lastMonth) {
      lastMonth = ym;
      monthMarks.push({ x: LABEL_LEFT + wi * PITCH, label: monthLabel(ym) });
    }
  });

  return (
    <motion.section
      ref={ref}
      className="card p-5 sm:p-6"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-open)]/15 text-[var(--color-open)]">
          <CalendarIcon size={16} />
        </span>
        <h2 className="text-fg font-semibold">Contribution activity</h2>
        <span className="mono ml-auto text-sm text-fg-muted">
          <CountUp value={contributions.year} /> contributions in the last year
        </span>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${vbW} ${vbH}`}
        preserveAspectRatio="xMinYMin meet"
        role="img"
        aria-label="Contribution heatmap for the last year"
        className="overflow-visible"
      >
        {/* Month labels */}
        {monthMarks.map((m, i) => (
          <text
            key={`m-${i}`}
            x={m.x}
            y={LABEL_TOP - 6}
            className="fill-fg-muted"
            style={{ fontSize: 9 }}
          >
            {m.label}
          </text>
        ))}

        {/* Weekday labels */}
        {WEEKDAYS.map((d) => (
          <text
            key={`wd-${d}`}
            x={LABEL_LEFT - 6}
            y={LABEL_TOP + WEEKDAY_ROWS[d] * PITCH + CELL - 2}
            textAnchor="end"
            className="fill-fg-muted"
            style={{ fontSize: 9 }}
          >
            {d}
          </text>
        ))}

        {/* Cells */}
        {calendar.map((week, wi) =>
          week.map((day, di) => (
            <motion.rect
              key={`${wi}-${di}`}
              x={LABEL_LEFT + wi * PITCH}
              y={LABEL_TOP + di * PITCH}
              width={CELL}
              height={CELL}
              rx={2}
              fill={day.color || "var(--color-cal-0)"}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={
                inView
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.4 }
              }
              transition={{
                duration: 0.35,
                ease: "easeOut",
                delay: (wi + di) * 0.012,
              }}
            >
              <title>
                {day.count} {day.count === 1 ? "contribution" : "contributions"} on{" "}
                {relDate(day.date)}
              </title>
            </motion.rect>
          ))
        )}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-2 text-xs text-fg-muted">
        <span>Less</span>
        <svg
          width={5 * PITCH}
          height={CELL}
          viewBox={`0 0 ${5 * PITCH} ${CELL}`}
          aria-hidden="true"
        >
          {CAL_VARS.map((v, i) => (
            <rect
              key={v}
              x={i * PITCH}
              y={0}
              width={CELL}
              height={CELL}
              rx={2}
              fill={v}
            />
          ))}
        </svg>
        <span>More</span>
      </div>
    </motion.section>
  );
}
