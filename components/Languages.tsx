"use client";

import { motion } from "motion/react";
import type { Language } from "@/lib/types";
import { CodeIcon } from "@/lib/octicons";
import { compact } from "@/lib/format";
import CountUp from "@/components/CountUp";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  PHP: "#4F5D95",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  HCL: "#844FBA",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Shell: "#89e051",
  Ruby: "#701516",
  Java: "#b07219",
  "C++": "#f34b7d",
  "C#": "#178600",
  C: "#555555",
  Vue: "#41b883",
  Dart: "#00B4AB",
  Other: "#6e7681",
};

const FALLBACK = "#6e7681";
const colorFor = (name: string): string => LANG_COLORS[name] ?? FALLBACK;

export default function Languages({ languages }: { languages: Language[] }) {
  const langs = languages.slice(0, 8);
  const total = langs.reduce((sum, l) => sum + l.count, 0);
  const pctOf = (count: number): number =>
    total > 0 ? (count / total) * 100 : 0;

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-accent) 14%, transparent)",
              color: "var(--color-accent)",
            }}
          >
            <CodeIcon size={16} />
          </span>
          <h2 className="font-semibold text-fg">Languages</h2>
        </div>
        <span className="mono text-sm text-fg-muted">
          <CountUp value={total} /> repos
        </span>
      </div>

      {/* GitHub language bar */}
      <div className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
        {langs.map((lang, i) => {
          const pct = pctOf(lang.count);
          return (
            <motion.div
              key={lang.name}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ backgroundColor: colorFor(lang.name) }}
              initial={{ width: 0 }}
              whileInView={{ width: `${pct}%` }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: 0.1 + i * 0.04,
              }}
              title={`${lang.name} ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Two-column legend */}
      <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {langs.map((lang, i) => {
          const pct = pctOf(lang.count);
          return (
            <motion.li
              key={lang.name}
              className="group flex items-center gap-2 text-sm"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: 0.15 + i * 0.04,
              }}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-150"
                style={{ backgroundColor: colorFor(lang.name) }}
              />
              <span className="truncate font-medium text-fg">{lang.name}</span>
              <span className="mono ml-auto shrink-0 text-fg-muted">
                {compact(lang.count)} ({pct.toFixed(1)}%)
              </span>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
