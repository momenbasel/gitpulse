"use client";

import { motion } from "motion/react";
import { useDashboard } from "@/lib/useDashboard";
import { compact } from "@/lib/format";
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
import {
  ZapIcon,
  PullRequestIcon,
  EyeIcon,
  AlertIcon,
  GithubIcon,
} from "@/lib/octicons";

export default function Page() {
  const { data, isDemo, loading, error } = useDashboard();

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error} />;

  const { profile, contributions, summary, triage } = data;

  const chips = [
    { icon: ZapIcon, label: "commits", value: contributions.commits, color: "var(--color-open)" },
    { icon: PullRequestIcon, label: "PRs", value: contributions.prs, color: "var(--color-accent)" },
    { icon: EyeIcon, label: "reviews", value: contributions.reviews, color: "var(--color-merged)" },
    { icon: AlertIcon, label: "issues", value: contributions.issues, color: "var(--color-attention)" },
  ];

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <TopBar profile={profile} isDemo={isDemo} generatedAt={data.generatedAt} />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
        {isDemo && <DemoBanner />}

        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 mt-2"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Your GitHub, <span className="grad-text">triaged</span>.
              </h1>
              <p className="mt-2 max-w-xl text-sm text-fg-muted">
                {triage.activeTotal} open pull requests across {summary.reposTouched}{" "}
                repositories - sorted into what needs you, not a wall of notifications.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {chips.map((c, i) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.5 }}
                  className="flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5"
                >
                  <c.icon size={14} className="shrink-0" />
                  <span className="mono text-sm font-semibold text-fg">
                    {compact(c.value)}
                  </span>
                  <span className="text-xs text-fg-subtle">{c.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.header>

        <div className="space-y-6">
          <StatCards summary={summary} contributions={contributions} />

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
      className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-[color:var(--color-attention)]/40 bg-[color:var(--color-attention)]/10 px-4 py-2.5 text-sm"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-attention)] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--color-attention)]" />
      </span>
      <span className="font-semibold text-fg">Demo data.</span>
      <span className="text-fg-muted">
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
    <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border-muted pt-6 text-xs text-fg-subtle">
      <div className="flex items-center gap-2">
        <GithubIcon size={14} />
        <span>
          GitPulse - {isDemo ? "demo profile" : `@${login}`}
        </span>
      </div>
      <span className="mono">
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
        <div className="mb-8 h-10 w-64 rounded-lg bg-surface shimmer-bg [animation:var(--animate-shimmer)]" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-surface shimmer-bg [animation:var(--animate-shimmer)]"
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
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[color:var(--color-accent)]/15">
          <GithubIcon size={28} className="text-accent" />
        </div>
        <h2 className="text-xl font-bold">No data yet</h2>
        <p className="mt-2 text-sm text-fg-muted">
          {message ?? "Could not load dashboard data."}
        </p>
        <div className="mono mt-5 rounded-lg bg-canvas-inset p-3 text-left text-sm text-fg">
          ./scripts/fetch.sh
        </div>
        <p className="mt-3 text-xs text-fg-subtle">
          Pulls your PR activity with the GitHub CLI, then reload.
        </p>
      </motion.div>
    </div>
  );
}
