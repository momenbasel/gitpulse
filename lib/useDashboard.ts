"use client";

import { useEffect, useState } from "react";
import type { Dashboard } from "./types";

export interface DashboardState {
  data: Dashboard | null;
  isDemo: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Loads the user's real data from /dashboard.json (produced locally by
 * scripts/fetch.sh). Falls back to the committed /demo.json so a freshly
 * cloned / deployed repo still renders something. No personal data ships in
 * the repo - dashboard.json is gitignored.
 */
export function useDashboard(): DashboardState {
  const [state, setState] = useState<DashboardState>({
    data: null,
    isDemo: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      const bust = `?t=${Date.now()}`;
      try {
        const real = await fetch(`/dashboard.json${bust}`, { cache: "no-store" });
        if (real.ok) {
          const data = (await real.json()) as Dashboard;
          if (alive) setState({ data, isDemo: !!data.demo, loading: false, error: null });
          return;
        }
      } catch {
        /* fall through to demo */
      }
      try {
        const demo = await fetch(`/demo.json${bust}`, { cache: "no-store" });
        const data = (await demo.json()) as Dashboard;
        if (alive) setState({ data: { ...data, demo: true }, isDemo: true, loading: false, error: null });
      } catch (e) {
        if (alive)
          setState({
            data: null,
            isDemo: false,
            loading: false,
            error: "No data found. Run ./scripts/fetch.sh to load your GitHub activity.",
          });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
