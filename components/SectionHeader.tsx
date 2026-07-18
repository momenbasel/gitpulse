import type { ReactNode } from "react";

/**
 * Numbered instrument section marker: mono index, hairline rule, uppercase
 * wide-tracked title, optional hint and right-aligned content.
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
    <header className="flex items-center gap-3">
      {icon && (
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md border"
          style={{
            color: iconColor,
            borderColor: `color-mix(in srgb, ${iconColor} 30%, transparent)`,
            background: `color-mix(in srgb, ${iconColor} 9%, transparent)`,
          }}
        >
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
