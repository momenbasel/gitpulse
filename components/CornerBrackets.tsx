/**
 * Four corner brackets pinned inside a `relative group` parent.
 * On group-hover they shift 2px outward and light up in the parent's
 * `--bracket-color` (defaults to the signal accent). Pure CSS, 300ms.
 */
export default function CornerBrackets({
  offset = 6,
  className = "",
}: {
  offset?: number;
  className?: string;
}) {
  const base =
    "pointer-events-none absolute h-[7px] w-[7px] text-fg-subtle/70 transition-all duration-300 group-hover:text-[var(--bracket-color,var(--color-accent))]";
  return (
    <span aria-hidden className={`absolute inset-0 ${className}`}>
      <span
        className={`${base} border-l border-t border-current group-hover:-translate-x-[2px] group-hover:-translate-y-[2px]`}
        style={{ left: offset, top: offset }}
      />
      <span
        className={`${base} border-r border-t border-current group-hover:translate-x-[2px] group-hover:-translate-y-[2px]`}
        style={{ right: offset, top: offset }}
      />
      <span
        className={`${base} border-b border-l border-current group-hover:-translate-x-[2px] group-hover:translate-y-[2px]`}
        style={{ left: offset, bottom: offset }}
      />
      <span
        className={`${base} border-b border-r border-current group-hover:translate-x-[2px] group-hover:translate-y-[2px]`}
        style={{ right: offset, bottom: offset }}
      />
    </span>
  );
}
