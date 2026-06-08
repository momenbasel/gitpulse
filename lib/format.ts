import type { Bucket, PRStatus } from "./types";

export function compact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k";
  return (n / 1_000_000).toFixed(1) + "M";
}

export function ago(days: number | null | undefined): string {
  if (days == null) return "";
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${(days / 365).toFixed(1)}y ago`;
}

export function relDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", {
    month: "short",
  });
}

// ---- color systems --------------------------------------------------------

export const statusColor: Record<PRStatus, string> = {
  merged: "var(--color-merged)",
  open: "var(--color-open)",
  draft: "var(--color-draft)",
  closed: "var(--color-closed)",
};

export interface BucketMeta {
  key: Bucket;
  label: string;
  sub: string;
  color: string;
  glow: string;
}

export const bucketMeta: Record<Exclude<Bucket, "done">, BucketMeta> = {
  ready: {
    key: "ready",
    label: "Ready to merge",
    sub: "Approved - ship it",
    color: "var(--color-open)",
    glow: "rgba(63,185,80,0.35)",
  },
  mine: {
    key: "mine",
    label: "Needs you",
    sub: "Your move - changes, drafts, stale",
    color: "var(--color-attention)",
    glow: "rgba(210,153,34,0.35)",
  },
  waiting: {
    key: "waiting",
    label: "Waiting on others",
    sub: "Out for review",
    color: "var(--color-accent)",
    glow: "rgba(47,129,247,0.35)",
  },
};

export function bucketColor(b: Bucket): string {
  if (b === "ready") return "var(--color-open)";
  if (b === "mine") return "var(--color-attention)";
  if (b === "waiting") return "var(--color-accent)";
  return "var(--color-fg-subtle)";
}
