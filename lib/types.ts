// Shape of public/dashboard.json (produced by scripts/fetch.sh + scripts/process.mjs).

export type PRStatus = "merged" | "open" | "draft" | "closed";
export type Bucket = "ready" | "mine" | "waiting" | "done";
export type ReviewDecision =
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "REVIEW_REQUIRED"
  | null;

export interface Profile {
  name: string;
  login: string;
  avatarUrl: string;
  bio: string | null;
  createdAt: string;
  followers: number;
  following: number;
  repos: number;
}

export interface Contributions {
  year: number;
  commits: number;
  prs: number;
  reviews: number;
  issues: number;
}

export interface CalDay {
  date: string;
  count: number;
  color: string;
}

export interface Summary {
  total: number;
  merged: number;
  open: number;
  draft: number;
  closed: number;
  mergeRate: number;
  totalAdditions: number;
  totalDeletions: number;
  totalFiles: number;
  reposTouched: number;
}

export interface ReviewBuckets {
  approved: number;
  changes_requested: number;
  review_required: number;
  awaiting: number;
  merged: number;
  closed: number;
}

export interface TimelinePoint {
  month: string; // YYYY-MM
  created: number;
  merged: number;
  closed: number;
}

export interface RepoStat {
  repo: string;
  total: number;
  merged: number;
  open: number;
  closed: number;
  additions: number;
  deletions: number;
  stars: number;
  private: boolean;
}

export interface Language {
  name: string;
  count: number;
}

export interface Label {
  name: string;
  color: string;
}

export interface PR {
  number: number;
  title: string;
  url: string;
  repo: string;
  owner: string;
  private: boolean;
  stars: number;
  lang: string;
  status: PRStatus;
  draft: boolean;
  reviewDecision: ReviewDecision;
  additions: number;
  deletions: number;
  changedFiles: number;
  comments: number;
  reviews: number;
  lastCommentAt: string | null;
  lastCommentBy: string | null;
  lastReviewAt: string | null;
  lastReviewState: string | null;
  lastReviewBy: string | null;
  createdAt: string;
  mergedAt: string | null;
  closedAt: string | null;
  updatedAt: string;
  labels: Label[];
  ageDays: number;
  idleDays: number;
  stale: boolean;
  bucket: Bucket;
  priority: number;
  reason: string;
  lastActivityAt: string | null;
  lastActivityBy: string | null;
  lastActivityKind: "comment" | "review" | null;
  lastActivityState: string | null;
  lastActivityDays: number | null;
}

export interface FeedItem {
  number: number;
  title: string;
  repo: string;
  url: string;
  bucket: Bucket;
  reason: string;
  priority: number;
  ageDays: number;
  idleDays: number;
  stale: boolean;
  draft: boolean;
  additions: number;
  deletions: number;
  private: boolean;
  comments: number;
  lastActivityAt: string | null;
  lastActivityBy: string | null;
  lastActivityKind: "comment" | "review" | null;
  lastActivityState: string | null;
  lastActivityDays: number | null;
}

export interface RecentMerge {
  number: number;
  title: string;
  repo: string;
  url: string;
  mergedAt: string;
  mergedDays: number;
  additions: number;
  deletions: number;
  private: boolean;
}

export interface Triage {
  ready: number;
  mine: number;
  waiting: number;
  stale: number;
  activeTotal: number;
  oldestActiveDays: number;
  feed: FeedItem[];
}

export interface Dashboard {
  generatedAt: string;
  demo?: boolean;
  profile: Profile;
  contributions: Contributions;
  calendar: CalDay[][];
  summary: Summary;
  reviewBuckets: ReviewBuckets;
  timeline: TimelinePoint[];
  topRepos: RepoStat[];
  languages: Language[];
  prs: PR[];
  triage: Triage;
  recentMerges: RecentMerge[];
}
