#!/usr/bin/env node
// Generates public/demo.json - synthetic, deterministic sample data so a fresh
// clone / deployment renders immediately. Contains NO real account data.
import { writeFileSync, mkdirSync } from "node:fs";

// deterministic RNG (seeded LCG) - reproducible demo, no Math.random
let seed = 1337;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff), seed / 0x7fffffff);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

const END = new Date("2026-06-08T00:00:00Z");
const dayMs = 864e5;
const iso = (d) => new Date(d).toISOString();

const repos = [
  { repo: "acme/web-app", lang: "TypeScript", stars: 1240, private: false },
  { repo: "acme/api-gateway", lang: "Go", stars: 860, private: false },
  { repo: "acme/payments-core", lang: "PHP", stars: 0, private: true },
  { repo: "acme/mobile", lang: "Kotlin", stars: 0, private: true },
  { repo: "opensource/awesome-lib", lang: "TypeScript", stars: 9800, private: false },
  { repo: "opensource/cli-tools", lang: "Rust", stars: 4300, private: false },
  { repo: "acme/data-pipeline", lang: "Python", stars: 320, private: false },
  { repo: "acme/infra", lang: "HCL", stars: 0, private: true },
  { repo: "labs/ml-experiments", lang: "Python", stars: 75, private: false },
];
const titles = [
  "Fix race condition in session refresh",
  "Add dark mode to settings panel",
  "Refactor auth middleware for clarity",
  "Bump dependencies and patch CVE-2025-1234",
  "Implement pagination for activity feed",
  "Cache contribution calendar responses",
  "Add e2e tests for checkout flow",
  "Migrate legacy endpoints to v2 schema",
  "Reduce bundle size by code-splitting routes",
  "Introduce feature flag for new dashboard",
  "Handle empty states across the app",
  "Wire up websocket reconnect backoff",
  "Optimize N+1 queries in reporting",
  "Polish onboarding animations",
  "Add rate limiting to public API",
  "Fix flaky CI on macOS runners",
  "Support SSO via OIDC",
  "Improve accessibility of modal dialogs",
  "Add structured logging to workers",
  "Document the deployment runbook",
];
const labelPool = [
  { name: "bug", color: "d73a4a" },
  { name: "enhancement", color: "a2eeef" },
  { name: "frontend", color: "5319e7" },
  { name: "backend", color: "0e8a16" },
  { name: "needs-review", color: "fbca04" },
  { name: "wip", color: "ededed" },
];

const now = END.getTime();
const days = (d) => Math.floor((now - new Date(d).getTime()) / dayMs);

function makePR(i) {
  const r = pick(repos);
  const roll = rnd();
  let status, draft = false, reviewDecision = null, mergedAt = null, closedAt = null;
  if (roll < 0.42) status = "merged";
  else if (roll < 0.5) status = "closed";
  else if (roll < 0.56) { status = "draft"; draft = true; }
  else status = "open";

  const ageDays = int(1, 420);
  const createdAt = iso(now - ageDays * dayMs);
  let idleDays = int(0, Math.min(ageDays, 120));
  if (status === "merged") { mergedAt = iso(now - int(0, ageDays - 1 || 1) * dayMs); }
  if (status === "closed") { closedAt = iso(now - int(0, ageDays - 1 || 1) * dayMs); }
  if (status === "open") {
    const rr = rnd();
    reviewDecision = rr < 0.2 ? "APPROVED" : rr < 0.4 ? "CHANGES_REQUESTED" : rr < 0.7 ? "REVIEW_REQUIRED" : null;
  }
  const updatedAt = iso(now - idleDays * dayMs);
  return {
    number: int(10, 4000), title: pick(titles), url: `https://github.com/${r.repo}/pull/${i}`,
    repo: r.repo, owner: r.repo.split("/")[0], private: r.private, stars: r.stars, lang: r.lang,
    status, draft, reviewDecision,
    additions: int(3, 600), deletions: int(0, 240), changedFiles: int(1, 22),
    comments: int(0, 14), reviews: int(0, 5),
    createdAt, mergedAt, closedAt, updatedAt,
    labels: rnd() < 0.6 ? [pick(labelPool), pick(labelPool)].filter((v, idx, a) => a.indexOf(v) === idx) : [],
  };
}

const list = Array.from({ length: 84 }, (_, i) => makePR(i + 1)).sort(
  (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
);

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
  p.bucket = bucket; p.priority = priority; p.reason = reason;
}

const ym = (d) => (d ? d.slice(0, 7) : null);
const reviewBuckets = list.reduce((m, p) => {
  if (p.status === "merged") return (m.merged++, m);
  if (p.status === "closed") return (m.closed++, m);
  const d = p.reviewDecision;
  if (d === "APPROVED") m.approved++; else if (d === "CHANGES_REQUESTED") m.changes_requested++;
  else if (d === "REVIEW_REQUIRED") m.review_required++; else m.awaiting++;
  return m;
}, { approved: 0, changes_requested: 0, review_required: 0, awaiting: 0, merged: 0, closed: 0 });

const months = {};
for (const p of list) {
  const c = ym(p.createdAt); if (c) (months[c] ||= { created: 0, merged: 0, closed: 0 }).created++;
  if (p.mergedAt) (months[ym(p.mergedAt)] ||= { created: 0, merged: 0, closed: 0 }).merged++;
  else if (p.status === "closed" && p.closedAt) (months[ym(p.closedAt)] ||= { created: 0, merged: 0, closed: 0 }).closed++;
}
const timeline = Object.entries(months).sort().slice(-18).map(([month, v]) => ({ month, ...v }));

const repoMap = {};
for (const p of list) {
  const o = (repoMap[p.repo] ||= { repo: p.repo, total: 0, merged: 0, open: 0, closed: 0, additions: 0, deletions: 0, stars: p.stars, private: p.private });
  o.total++; o[p.status === "draft" ? "open" : p.status]++; o.additions += p.additions; o.deletions += p.deletions;
}
const topRepos = Object.values(repoMap).sort((a, b) => b.total - a.total).slice(0, 10);
const langMap = list.reduce((m, p) => ((m[p.lang] = (m[p.lang] || 0) + 1), m), {});
const languages = Object.entries(langMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

// contribution calendar (53 weeks back from END, Sunday-aligned)
const calColors = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];
const startSunday = new Date(now - 52 * 7 * dayMs);
startSunday.setUTCDate(startSunday.getUTCDate() - startSunday.getUTCDay());
const calendar = [];
let yearTotal = 0;
for (let w = 0; w < 53; w++) {
  const week = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(startSunday.getTime() + (w * 7 + d) * dayMs);
    if (date.getTime() > now) break;
    const dow = date.getUTCDay();
    const base = dow === 0 || dow === 6 ? 0.45 : 1;
    const count = rnd() < 0.25 * base ? 0 : int(0, Math.floor(12 * base));
    yearTotal += count;
    const lvl = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;
    week.push({ date: date.toISOString().slice(0, 10), count, color: calColors[lvl] });
  }
  calendar.push(week);
}

const mergedCount = list.filter((p) => p.status === "merged").length;
const closedCount = list.filter((p) => p.status === "closed").length;
const decided = mergedCount + closedCount;
const active = list.filter((p) => p.bucket !== "done");

const out = {
  generatedAt: END.toISOString(),
  demo: true,
  profile: {
    name: "Octo Developer", login: "octodev",
    avatarUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
    bio: "Demo profile - run ./scripts/fetch.sh to load your own GitHub activity.",
    createdAt: "2015-03-12T00:00:00Z", followers: 1284, following: 211, repos: 73,
  },
  contributions: {
    year: yearTotal,
    commits: int(900, 1500), prs: list.length, reviews: int(120, 260), issues: int(40, 120),
  },
  calendar,
  summary: {
    total: list.length, merged: mergedCount,
    open: list.filter((p) => p.status === "open").length,
    draft: list.filter((p) => p.status === "draft").length, closed: closedCount,
    mergeRate: decided ? Math.round((mergedCount / decided) * 1000) / 10 : 0,
    totalAdditions: list.reduce((s, p) => s + p.additions, 0),
    totalDeletions: list.reduce((s, p) => s + p.deletions, 0),
    totalFiles: list.reduce((s, p) => s + p.changedFiles, 0),
    reposTouched: Object.keys(repoMap).length,
  },
  reviewBuckets, timeline, topRepos, languages, prs: list,
  triage: {
    ready: active.filter((p) => p.bucket === "ready").length,
    mine: active.filter((p) => p.bucket === "mine").length,
    waiting: active.filter((p) => p.bucket === "waiting").length,
    stale: active.filter((p) => p.stale).length,
    activeTotal: active.length,
    oldestActiveDays: active.length ? Math.max(...active.map((p) => p.ageDays || 0)) : 0,
    feed: active.slice().sort((a, b) => b.priority - a.priority || b.idleDays - a.idleDays).slice(0, 40).map((p) => ({
      number: p.number, title: p.title, repo: p.repo, url: p.url, bucket: p.bucket, reason: p.reason,
      priority: p.priority, ageDays: p.ageDays, idleDays: p.idleDays, stale: p.stale, draft: p.draft,
      additions: p.additions, deletions: p.deletions, private: p.private,
    })),
  },
};

mkdirSync("public", { recursive: true });
writeFileSync("public/demo.json", JSON.stringify(out));
console.log(`✓ public/demo.json  ${list.length} synthetic PRs  (year contribs ${yearTotal})`);
