"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  open: boolean;
  title: string;
  subtitle?: string;
  accent: string;
  count: number;
  onClose: () => void;
  children: React.ReactNode;
}

/** Animated, accessible modal shell used by the stat cards to drill into PR lists. */
export default function PRListModal({
  open,
  title,
  subtitle,
  accent,
  count,
  onClose,
  children,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          {/* panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="card relative z-10 mt-4 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden p-0 sm:mt-10"
            style={{ boxShadow: `0 24px 80px -20px ${accent}55, 0 0 0 1px var(--color-border)` }}
          >
            {/* top accent line */}
            <div className="h-1 w-full shrink-0" style={{ background: accent }} />

            <header className="flex items-center gap-3 border-b border-border-muted px-5 py-4">
              <span
                className="grid h-9 w-9 place-items-center rounded-lg text-sm font-bold"
                style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}
              >
                {count}
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-fg">{title}</h2>
                {subtitle && <p className="truncate text-xs text-fg-muted">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
              >
                <svg viewBox="0 0 16 16" width={16} height={16} fill="currentColor" aria-hidden>
                  <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.749.749 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.749.749 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
