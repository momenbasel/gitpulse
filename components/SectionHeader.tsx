import type { ReactNode } from "react";

/**
 * Numbered instrument section marker: mono index, uppercase wide-tracked
 * title, optional hint and right-aligned content. Hierarchy comes from
 * type and spacing — plain leading glyph, no icon containers.
 *   02 / ACTION CENTER ──────────────── What actually needs you
 */
export default function SectionHeader({
  index,
  title,
  hint,
  icon,
  iconColor = "var(--color-accent)",
  right,
}: {
  index: string;
  title: string;
  hint?: string;
  icon?: ReactNode;
  iconColor?: string;
  right?: ReactNode;
}) {
  return (
    <header className="flex items-center gap-2.5">
      {icon && (
        <span className="grid shrink-0 place-items-center" style={{ color: iconColor }}>
          {icon}
        </span>
      )}
      <span className="mono shrink-0 text-[11px] tracking-wider text-fg-subtle">
        {index}
        <span className="mx-1 text-fg-subtle/50">/</span>
      </span>
      <h2 className="shrink-0 text-[13px] font-semibold uppercase tracking-[0.16em] text-fg">
        {title}
      </h2>
      {hint && (
        <span className="hidden truncate text-xs text-fg-muted lg:block">
          {hint}
        </span>
      )}
      <span
        aria-hidden
        className="mx-1 h-px min-w-4 flex-1 bg-border-muted"
      />
      {right}
    </header>
  );
}
