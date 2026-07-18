"use client";

import { motion } from "motion/react";
import { useDashboard } from "@/lib/useDashboard";
import AuroraBackground from "@/components/AuroraBackground";
import TopBar from "@/components/TopBar";
import StatCards from "@/components/StatCards";
import ActionCenter from "@/components/ActionCenter";
import ContributionGraph from "@/components/ContributionGraph";
import ReviewDonut from "@/components/ReviewDonut";
import RepoBars from "@/components/RepoBars";
import ActivityTimeline from "@/components/ActivityTimeline";
import Languages from "@/components/Languages";
import RecentMerges from "@/components/RecentMerges";
import CountUp from "@/components/CountUp";
import {
  ZapIcon,
  PullRequestIcon,
  EyeIcon,
  AlertIcon,
  GithubIcon,
  ClockIcon,
} from "@/lib/octicons";

export default function Page() {
  const { data, isDemo, loading, error } = useDashboard();

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error} />;

  const { profile, contributions, summary, triage } = data;

  const telemetry = [
    { icon: PullRequestIcon, label: "active", value: triage.activeTotal, color: "var(--color-accent)" },
    { icon: ZapIcon, label: "commits", value: contributions.commits, color: "var(--color-open)" },
    { icon: EyeIcon, label: "reviews", value: contributions.reviews, color: "var(--color-merged)" },
    { icon: AlertIcon, label: "issues", value: contributions.issues, color: "var(--color-attention)" },
    { icon: ClockIcon, label: "oldest idle", value: triage.oldestActiveDays, suffix: "d", color: "var(--color-fg-muted)" },
  ];

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <TopBar profile={profile} isDemo={isDemo} generatedAt={data.generatedAt} />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6">
        {isDemo && <DemoBanner />}

        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-10 mt-2"
        >
          <p className="label-caps">
            GitHub pull-request triage — live instrument
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.04] tracking-[-0.03em] sm:text-[3.4rem]">
            Your GitHub, <span className="text-accent">triaged</span>
            <span
              aria-hidden
              className="ml-2 inline-block h-[0.82em] w-[3px] translate-y-[0.08em] bg-accent [animation:var(--animate-caret)]"
            />
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-fg-muted">
            {triage.activeTotal} open pull requests across {summary.reposTouched}{" "}
            repositories — sorted into what needs you, not a wall of notifications.
          </p>

          {/* Telemetry strip */}
          <div className="mt-7 flex flex-wrap overflow-hidden rounded-lg border border-border bg-surface/60 backdrop-blur-sm">
            {telemetry.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06, duration: 0.5 }}
                className="flex min-w-[8.5rem] flex-1 items-center gap-3 border-border-muted px-4 py-3 [&+&]:border-l"
              >
                <t.icon size={14} className="shrink-0" />
                <div className="flex items-baseline gap-1.5">
                  <span className="mono text-lg font-semibold leading-none text-fg">
                    <CountUp value={t.value} suffix={t.suffix ?? ""} />
                  </span>
                  <span className="label-caps">{t.label}</span>
                </div>
                <span
                  aria-hidden
                  className="ml-auto h-1 w-1 rounded-full"
                  style={{ background: t.color }}
                />
              </motion.div>
            ))}
          </div>
        </motion.header>

        <div className="space-y-6">
          <StatCards summary={summary} contributions={contributions} prs={data.prs} />

          <ActionCenter triage={triage} prs={data.prs} />

          <ContributionGraph calendar={data.calendar} contributions={contributions} />

          <div className="grid gap-6 lg:grid-cols-2">
            <ActivityTimeline timeline={data.timeline} />
            <ReviewDonut reviewBuckets={data.reviewBuckets} summary={summary} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <RepoBars topRepos={data.topRepos} />
            <RecentMerges merges={data.recentMerges} />
          </div>

          <Languages languages={data.languages} />
        </div>

        <Footer login={profile.login} generatedAt={data.generatedAt} isDemo={isDemo} />
      </main>
    </div>
  );
}

function DemoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex flex-wrap items-center gap-3 rounded-lg border border-[color:var(--color-attention)]/40 bg-[color:var(--color-attention)]/8 px-4 py-2.5"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-attention)] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--color-attention)]" />
      </span>
      <span className="label-caps !text-[color:var(--color-attention)]">Demo data</span>
      <span className="text-sm text-fg-muted">
        Run{" "}
        <code className="mono rounded bg-canvas-inset px-1.5 py-0.5 text-xs text-fg">
          ./scripts/fetch.sh
        </code>{" "}
        to load your own GitHub activity.
      </span>
    </motion.div>
  );
}

function Footer({
  login,
  generatedAt,
  isDemo,
}: {
  login: string;
  generatedAt: string;
  isDemo: boolean;
}) {
  return (
    <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-border-muted pt-6">
      <div className="flex items-center gap-2">
        <GithubIcon size={13} className="text-fg-subtle" />
        <span className="label-caps">
          GitPulse — {isDemo ? "demo profile" : `@${login}`}
        </span>
      </div>
      <span className="label-caps hidden sm:block">
        Rendered locally — nothing uploaded
      </span>
      <span className="mono text-[11px] text-fg-subtle">
        synced {new Date(generatedAt).toLocaleString("en-US")}
      </span>
    </footer>
  );
}

function LoadingState() {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-4 h-3 w-40 rounded-sm bg-surface shimmer-bg [animation:var(--animate-shimmer)]" />
        <div className="mb-8 h-12 w-96 max-w-full rounded-lg bg-surface shimmer-bg [animation:var(--animate-shimmer)]" />
        <div className="mb-8 h-16 rounded-lg bg-surface shimmer-bg [animation:var(--animate-shimmer)]" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-surface shimmer-bg [animation:var(--animate-shimmer)]"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        <div className="mt-6 h-96 rounded-xl bg-surface shimmer-bg [animation:var(--animate-shimmer)]" />
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string | null }) {
  return (
    <div className="relative grid min-h-screen place-items-center px-6">
      <AuroraBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-md p-8 text-center"
      >
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/10">
          <GithubIcon size={28} className="text-accent" />
        </div>
        <p className="label-caps mb-2">No signal</p>
        <h2 className="text-xl font-bold tracking-tight">No data yet</h2>
        <p className="mt-2 text-sm text-fg-muted">
          {message ?? "Could not load dashboard data."}
        </p>
        <div className="mono mt-5 rounded-lg border border-border-muted bg-canvas-inset p-3 text-left text-sm text-fg">
          $ ./scripts/fetch.sh
        </div>
        <p className="mt-3 text-xs text-fg-subtle">
          Pulls your PR activity with the GitHub CLI, then reload.
        </p>
      </motion.div>
    </div>
  );
}
