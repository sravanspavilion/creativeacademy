"use client";

import { use, useMemo, useState } from "react";
import { evaluateSchedule, formatTimeLoose } from "@academy/shared";
import { appConfig } from "@/config/app.config";
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
 * Optional preview override: append `?at=HH:MM` to the URL to freeze the
 * dashboard at a given local time (e.g. `?at=10:30`). Useful for verifying
 * each shift state before going live. Read from page `searchParams` so the
 * server and client render identically (no hydration mismatch).
 * Ignored when absent — the live clock drives everything otherwise.
 */
function resolvePreviewAt(at: string | undefined): PreviewState | null {
  if (!at || !/^\d{1,2}:\d{2}$/.test(at)) return null;
  const [hours, minutes] = at.split(":").map(Number);
  const d = new Date();
  d.setHours(hours % 24, minutes % 60, 0, 0);
  return { now: d, preview: true };
}

/**
 * Live Academy Batch Controller — single-screen digital schedule display.
 * Device-local time drives shift detection; data comes from the API when
 * configured, otherwise bundled mock data.
 */
export default function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = use(searchParams);
  const at = typeof params?.at === "string" ? params.at : undefined;

  const { academy, source } = useAcademyData();
  const liveNow = useNow(1000);
  const [preview] = useState<PreviewState | null>(() => resolvePreviewAt(at));
  const now = preview?.preview ? preview.now : liveNow;

  const evaluation = useMemo(() => evaluateSchedule(now, academy), [now, academy]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#06040f] text-white selection:bg-fuchsia-500/40">
      <GradientBackground />
      <FloatingToolEmblems enabled={appConfig.showEmblems} />

      {preview?.preview && (
        <div className="fixed left-1/2 top-2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-300/40 bg-amber-950/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-200 backdrop-blur-sm">
          Preview · {formatTimeLoose(at ?? "12:00")}
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