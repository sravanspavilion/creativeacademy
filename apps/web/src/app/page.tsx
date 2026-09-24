"use client";

import { useMemo } from "react";
import { evaluateSchedule } from "@academy/shared";
import { appConfig } from "@/config/app.config";
import { useNow } from "@/lib/use-now";
import { useAcademyData } from "@/lib/use-academy-data";
import { GradientBackground } from "@/components/GradientBackground";
import { FloatingToolEmblems } from "@/components/FloatingToolEmblems";
import { AcademyHeader } from "@/components/AcademyHeader";
import { ShiftDashboard } from "@/components/ShiftDashboard";
import { FooterShiftSummary } from "@/components/FooterShiftSummary";

/**
 * Live Academy Batch Controller — single-screen digital schedule display.
 * Device-local time drives shift detection; data comes from the API when
 * configured, otherwise bundled mock data.
 */
export default function Home() {
  const { academy, source } = useAcademyData();
  const now = useNow(1000);
  const evaluation = useMemo(() => evaluateSchedule(now, academy), [now, academy]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#06040f] text-white selection:bg-fuchsia-500/40">
      <GradientBackground />
      <FloatingToolEmblems enabled={appConfig.showEmblems} />

      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1900px] flex-col gap-5 px-4 py-5 sm:px-8 sm:py-7 lg:gap-7 lg:px-12 lg:py-9">
        <AcademyHeader now={now} source={source} />
        <ShiftDashboard evaluation={evaluation} now={now} />
        <FooterShiftSummary academy={academy} evaluation={evaluation} />
      </main>
    </div>
  );
}