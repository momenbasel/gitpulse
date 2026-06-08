#!/usr/bin/env node
// Transforms raw GitHub GraphQL output (data/_prs_raw.json + data/_profile.json)
// into public/dashboard.json - the single file the UI reads.
// Pure Node, no deps. Invoked by scripts/fetch.sh.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const login = process.argv[2] || "you";
const prs = JSON.parse(readFileSync("data/_prs_raw.json", "utf8"));
const prof = JSON.parse(readFileSync("data/_profile.json", "utf8"));
const now = Date.now();
const days = (d) => (d ? Math.floor((now - new Date(d).getTime()) / 864e5) : null);

const norm = (p) => {
  let status;
  if (p.merged) status = "merged";
  else if (p.state === "OPEN") status = p.isDraft ? "draft" : "open";
  else status = "closed";
  return {
    number: p.number,
    title: p.title,
    url: p.url,
    repo: p.repository?.nameWithOwner || "unknown",
    owner: p.repository?.owner?.login || "",
    private: !!p.repository?.isPrivate,
    stars: p.repository?.stargazerCount || 0,
    lang: p.repository?.primaryLanguage?.name || "Other",
    status,
    draft: !!p.isDraft,
    reviewDecision: p.reviewDecision || null,
    additions: p.additions || 0,
    deletions: p.deletions || 0,
    changedFiles: p.changedFiles || 0,
    comments: p.comments?.totalCount || 0,
    reviews: p.reviews?.totalCount || 0,
    createdAt: p.createdAt,
    mergedAt: p.mergedAt,
    closedAt: p.closedAt,
    updatedAt: p.updatedAt,
    labels: (p.labels?.nodes || []).map((l) => ({ name: l.name, color: l.color })),
  };
};

const list = prs
  .map(norm)
  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

// ---- per-PR triage: the notification replacement -------------------------
for (const p of list) {
  p.ageDays = days(p.createdAt);
  p.idleDays = days(p.updatedAt);
  let bucket, priority, reason;
  if (p.status === "merged") { bucket = "done"; priority = 0; reason = "Merged"; }
  else if (p.status === "closed") { bucket = "done"; priority = 0; reason = "Closed without merge"; }
  else if (p.draft) { bucket = "mine"; priority = 2; reason = "Draft - finish it"; }
  else if (p.reviewDecision === "CHANGES_REQUESTED") { bucket = "mine"; priority = 4; reason = "Changes requested - address feedback"; }
  else if (p.reviewDecision === "APPROVED") { bucket = "ready"; priority = 5; reason = "Approved - ready to merge"; }
  else if (p.reviewDecision === "REVIEW_REQUIRED") { bucket = "waiting"; priority = 3; reason = "Waiting on reviewer"; }
  else { bucket = "waiting"; priority = 1; reason = "Open - no review yet"; }
  if (bucket !== "done" && p.idleDays >= 21) {
    p.stale = true;
    if (bucket === "waiting") { bucket = "mine"; reason = `Stale ${p.idleDays}d - nudge or close`; priority = 3; }
  } else p.stale = false;
  p.bucket = bucket;
  p.priority = priority;
  p.reason = reason;
}

const by = (f) => list.reduce((m, p) => ((m[f(p)] = (m[f(p)] || 0) + 1), m), {});
const ym = (d) => (d ? d.slice(0, 7) : null);

// review buckets
const reviewBuckets = list.reduce(
  (m, p) => {
    if (p.status === "merged") return (m.merged++, m);
    if (p.status === "closed") return (m.closed++, m);
    const d = p.reviewDecision;
    if (d === "APPROVED") m.approved++;
    else if (d === "CHANGES_REQUESTED") m.changes_requested++;
    else if (d === "REVIEW_REQUIRED") m.review_required++;
    else m.awaiting++;
    return m;
  },
  { approved: 0, changes_requested: 0, review_required: 0, awaiting: 0, merged: 0, closed: 0 }
);

// monthly timeline (last 18 months)
const months = {};
for (const p of list) {
  const c = ym(p.createdAt);
  if (c) (months[c] ||= { created: 0, merged: 0, closed: 0 }).created++;
  if (p.mergedAt) (months[ym(p.mergedAt)] ||= { created: 0, merged: 0, closed: 0 }).merged++;
  else if (p.status === "closed" && p.closedAt)
    (months[ym(p.closedAt)] ||= { created: 0, merged: 0, closed: 0 }).closed++;
}
const timeline = Object.entries(months)
  .sort()
  .slice(-18)
  .map(([month, v]) => ({ month, ...v }));

// repos
const repoMap = {};
for (const p of list) {
  const o = (repoMap[p.repo] ||= {
    repo: p.repo, total: 0, merged: 0, open: 0, closed: 0,
    additions: 0, deletions: 0, stars: p.stars, private: p.private,
  });
  o.total++;
  o[p.status === "draft" ? "open" : p.status]++;
  o.additions += p.additions;
  o.deletions += p.deletions;
}
const topRepos = Object.values(repoMap).sort((a, b) => b.total - a.total).slice(0, 10);

const langMap = by((p) => p.lang);
const languages = Object.entries(langMap)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 8);

const mergedCount = list.filter((p) => p.status === "merged").length;
const closedCount = list.filter((p) => p.status === "closed").length;
const decided = mergedCount + closedCount;

const active = list.filter((p) => p.bucket !== "done");
const triage = {
  ready: active.filter((p) => p.bucket === "ready").length,
  mine: active.filter((p) => p.bucket === "mine").length,
  waiting: active.filter((p) => p.bucket === "waiting").length,
  stale: active.filter((p) => p.stale).length,
  activeTotal: active.length,
  oldestActiveDays: active.length ? Math.max(...active.map((p) => p.ageDays || 0)) : 0,
  feed: active
    .slice()
    .sort((a, b) => b.priority - a.priority || b.idleDays - a.idleDays)
    .slice(0, 40)
    .map((p) => ({
      number: p.number, title: p.title, repo: p.repo, url: p.url, bucket: p.bucket,
      reason: p.reason, priority: p.priority, ageDays: p.ageDays, idleDays: p.idleDays,
      stale: p.stale, draft: p.draft, additions: p.additions, deletions: p.deletions, private: p.private,
    })),
};

const cal = prof.contributionsCollection.contributionCalendar;
const out = {
  generatedAt: new Date().toISOString(),
  demo: false,
  profile: {
    name: prof.name || login,
    login: prof.login || login,
    avatarUrl: prof.avatarUrl || "",
    bio: prof.bio || null,
    createdAt: prof.createdAt,
    followers: prof.followers?.totalCount ?? 0,
    following: prof.following?.totalCount ?? 0,
    repos: prof.repositories?.totalCount ?? 0,
  },
  contributions: {
    year: cal.totalContributions,
    commits: prof.contributionsCollection.totalCommitContributions,
    prs: prof.contributionsCollection.totalPullRequestContributions,
    reviews: prof.contributionsCollection.totalPullRequestReviewContributions,
    issues: prof.contributionsCollection.totalIssueContributions,
  },
  calendar: cal.weeks.map((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, color: d.color }))
  ),
  summary: {
    total: list.length,
    merged: mergedCount,
    open: list.filter((p) => p.status === "open").length,
    draft: list.filter((p) => p.status === "draft").length,
    closed: closedCount,
    mergeRate: decided ? Math.round((mergedCount / decided) * 1000) / 10 : 0,
    totalAdditions: list.reduce((s, p) => s + p.additions, 0),
    totalDeletions: list.reduce((s, p) => s + p.deletions, 0),
    totalFiles: list.reduce((s, p) => s + p.changedFiles, 0),
    reposTouched: Object.keys(repoMap).length,
  },
  reviewBuckets,
  timeline,
  topRepos,
  languages,
  prs: list,
  triage,
};

mkdirSync("public", { recursive: true });
writeFileSync("public/dashboard.json", JSON.stringify(out));
console.log(
  `✓ public/dashboard.json  ${list.length} PRs  |  ${triage.mine} need you, ${triage.waiting} waiting, ${triage.ready} ready, ${triage.stale} stale`
);
