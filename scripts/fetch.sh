#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# GitPulse data fetcher.
# Pulls YOUR GitHub pull-request activity locally via the `gh` CLI and writes
# public/dashboard.json (gitignored - never committed). Run from repo root:
#
#     ./scripts/fetch.sh            # uses your logged-in gh account
#     ./scripts/fetch.sh octocat    # any public username
#
# Requirements: gh (https://cli.github.com), authenticated with `gh auth login`,
# and node (>=18). Only your own token is used; nothing leaves your machine.
# ---------------------------------------------------------------------------
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

bold() { printf "\033[1m%s\033[0m\n" "$1"; }
red()  { printf "\033[31m%s\033[0m\n" "$1"; }
dim()  { printf "\033[2m%s\033[0m\n" "$1"; }

command -v gh   >/dev/null 2>&1 || { red "gh CLI not found. Install: https://cli.github.com"; exit 1; }
command -v node >/dev/null 2>&1 || { red "node not found. Install Node 18+."; exit 1; }
gh auth status >/dev/null 2>&1   || { red "Not logged in. Run: gh auth login"; exit 1; }

USER="${1:-$(gh api user --jq .login 2>/dev/null)}"
[ -z "$USER" ] && { red "Could not resolve a username."; exit 1; }
bold "Fetching pull-request activity for @$USER ..."

mkdir -p data public
PAGES_DIR=data/_prs_pages
rm -rf "$PAGES_DIR"; mkdir -p "$PAGES_DIR"

PR_QUERY_FIRST='query($q:String!){ search(query:$q,type:ISSUE,first:50){ pageInfo{hasNextPage endCursor} nodes{ ...on PullRequest{
  title number url state isDraft merged mergedAt createdAt closedAt updatedAt additions deletions changedFiles
  comments{totalCount} reviewDecision
  repository{nameWithOwner isPrivate stargazerCount primaryLanguage{name} owner{login}}
  reviews(first:1){totalCount} labels(first:10){nodes{name color}} } } } }'
PR_QUERY_NEXT='query($q:String!,$after:String!){ search(query:$q,type:ISSUE,first:50,after:$after){ pageInfo{hasNextPage endCursor} nodes{ ...on PullRequest{
  title number url state isDraft merged mergedAt createdAt closedAt updatedAt additions deletions changedFiles
  comments{totalCount} reviewDecision
  repository{nameWithOwner isPrivate stargazerCount primaryLanguage{name} owner{login}}
  reviews(first:1){totalCount} labels(first:10){nodes{name color}} } } } }'

cursor=""; page=0
while :; do
  page=$((page+1))
  if [ -z "$cursor" ]; then
    resp=$(gh api graphql -F q="author:$USER type:pr" -f query="$PR_QUERY_FIRST" 2>/dev/null)
  else
    resp=$(gh api graphql -F q="author:$USER type:pr" -F after="$cursor" -f query="$PR_QUERY_NEXT" 2>/dev/null)
  fi
  [ -z "$resp" ] && { red "GraphQL request failed on page $page."; break; }
  echo "$resp" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);process.stdout.write(JSON.stringify(j.data.search.nodes))})' > "$PAGES_DIR/page_$page.json"
  read -r hasNext cursor < <(echo "$resp" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const p=JSON.parse(s).data.search.pageInfo;process.stdout.write(p.hasNextPage+" "+(p.endCursor||""))})')
  dim "  page $page fetched"
  [ "$hasNext" = "true" ] || break
  [ "$page" -ge 20 ] && break
done

# merge pages -> data/_prs_raw.json
node -e '
  const fs=require("fs");
  const dir="'"$PAGES_DIR"'";
  const all=fs.readdirSync(dir).filter(f=>f.endsWith(".json")).flatMap(f=>JSON.parse(fs.readFileSync(dir+"/"+f,"utf8")));
  fs.writeFileSync("data/_prs_raw.json",JSON.stringify(all));
  console.log("  "+all.length+" PRs collected");
'

bold "Fetching profile + contribution calendar ..."
gh api graphql -F login="$USER" -f query='
query($login:String!){ user(login:$login){
  name login avatarUrl bio createdAt
  followers{totalCount} following{totalCount} repositories(first:1){totalCount}
  contributionsCollection{
    totalCommitContributions totalPullRequestContributions totalPullRequestReviewContributions
    totalIssueContributions totalRepositoryContributions
    contributionCalendar{ totalContributions weeks{ contributionDays{ date contributionCount color weekday } } }
  } } }' --jq '.data.user' > data/_profile.json 2>/dev/null
[ -s data/_profile.json ] || { red "Failed to fetch profile for @$USER."; exit 1; }

node scripts/process.mjs "$USER"
echo
bold "Done. Start the dashboard:"
dim  "  pnpm install   # first run only"
dim  "  pnpm dev       # then open http://localhost:3000"
