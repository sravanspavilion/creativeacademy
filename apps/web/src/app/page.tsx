"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { evaluateSchedule, formatTimeLoose } from "@academy/shared";
import { appConfig } from "@/config/app.config";
import { useMounted } from "@/lib/use-mounted";
import { useNow } from "@/lib/use-now";
import { useAcademyData } from "@/lib/use-academy-data";
import { GradientBackground } from "@/components/GradientBackground";
import { FloatingToolEmblems } from "@/components/FloatingToolEmblems";
import { AcademyHeader } from "@/components/AcademyHeader";
import { ShiftDashboard } from "@/components/ShiftDashboard";
import { FooterShiftSummary } from "@/components/FooterShiftSummary";

interface PreviewState {
  now: Date;
  preview: boolean;
}

/**
 * Optional preview override: append `?at=HH:MM` to freeze the dashboard at a
 * given local time (e.g. `?at=10:30`) — useful for verifying each shift state
 * before going live. Read purely client-side *after* hydration so the route
 * stays statically rendered (no server function on Vercel).
 */
function readPreviewAt(): PreviewState | null {
  if (typeof window === "undefined") return null;
  const at = new URLSearchParams(window.location.search).get("at");
  if (!at || !/^\d{1,2}:\d{2}$/.test(at)) return null;
  const [hours, minutes] = at.split(":").map(Number);
  const d = new Date();
  d.setHours(hours % 24, minutes % 60, 0, 0);
  return { now: d, preview: true };
}

/**
 * Static brand screen rendered during SSR/hydration. Contains only
 * build-time-constant content so the server HTML and the first client render
 * are always identical (zero hydration mismatch surface). The real dashboard
 * swaps in the instant hydration completes.
 */
function LoadingScreen() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-5 overflow-hidden bg-[#06040f] text-white">
      <GradientBackground />
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FCAF45] shadow-lg shadow-fuchsia-500/25">
          <Sparkles className="h-6 w-6 text-white" aria-hidden />
        </div>
        <div>
          <p className="font-display text-xl font-extrabold uppercase tracking-[0.18em] text-white text-glow lg:text-2xl">
            {appConfig.academyName}
          </p>
          <p className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-300 bg-clip-text text-[11px] font-semibold uppercase tracking-[0.3em] text-transparent">
            {appConfig.tagline}
          </p>
        </div>
      </div>
      <p
        className="relative z-10 animate-pulse text-[11px] font-semibold uppercase tracking-[0.32em] text-white/50"
        role="status"
      >
        Loading display…
      </p>
    </div>
  );
}

/**
 * Live Academy Batch Controller — single-screen digital schedule display.
 * 100% client-driven: statically rendered (SSG, no server function), with
 * device-local time driving shift detection and API/mock data resolved in
 * the browser.
 */
export default function Home() {
  const mounted = useMounted();
  const { academy, source } = useAcademyData();
  const liveNow = useNow(1000);
  const [preview] = useState<PreviewState | null>(readPreviewAt);

  // All hooks run unconditionally (Rules of Hooks), even on the skeleton pass.
  const now = preview?.preview ? preview.now : liveNow;
  const evaluation = useMemo(() => evaluateSchedule(now, academy), [now, academy]);

  if (!mounted) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#06040f] text-white selection:bg-fuchsia-500/40">
      <GradientBackground />
      <FloatingToolEmblems enabled={appConfig.showEmblems} />

      {preview?.preview && (
        <div className="fixed left-1/2 top-2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-300/40 bg-amber-950/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-200 backdrop-blur-sm">
          Preview · {formatTimeLoose(atLabel(preview))}
        </div>
      )}

      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1900px] flex-col gap-5 px-4 py-5 sm:px-8 sm:py-7 lg:gap-7 lg:px-12 lg:py-9">
        <AcademyHeader now={now} source={source} />
        <ShiftDashboard evaluation={evaluation} now={now} />
        <FooterShiftSummary academy={academy} evaluation={evaluation} />
      </main>
    </div>
  );
}

/** "HH:MM" label for the preview chip. */
function atLabel(preview: PreviewState): string {
  return `${String(preview.now.getHours()).padStart(2, "0")}:${String(
    preview.now.getMinutes(),
  ).padStart(2, "0")}`;
}