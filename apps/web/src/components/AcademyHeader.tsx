import { Sparkles } from "lucide-react";
import { formatDayName, formatDateLabel } from "@academy/shared";
import type { DataSource } from "@academy/shared";
import { appConfig } from "@/config/app.config";
import { SystemStatus } from "./SystemStatus";

const TAGLINE_CLASS =
  "bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-300 bg-clip-text text-transparent";

/**
 * Top bar: academy branding (configurable via env) on the left,
 * current day + date and system status on the right.
 */
export function AcademyHeader({ now, source }: { now: Date; source: DataSource }) {
  return (
    <header className="flex w-full items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FCAF45] shadow-lg shadow-fuchsia-500/25 sm:h-12 sm:w-12">
          <Sparkles className="h-6 w-6 text-white" aria-hidden />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-lg font-extrabold uppercase leading-tight tracking-[0.16em] text-white text-glow sm:text-xl lg:text-3xl">
            {appConfig.academyName}
          </h1>
          <p className={`mt-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] sm:text-[11px] ${TAGLINE_CLASS}`}>
            {appConfig.tagline}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="text-right">
          <p className="font-display text-sm font-bold uppercase tracking-[0.22em] text-white sm:text-base lg:text-lg">
            {formatDayName(now)}
          </p>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/60 sm:text-xs">
            {formatDateLabel(now)}
          </p>
        </div>
        <SystemStatus source={source} />
      </div>
    </header>
  );
}