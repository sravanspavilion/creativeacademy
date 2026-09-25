import type { AcademyInfo, ScheduleEvaluation } from "@academy/shared";
import { appConfig } from "@/config/app.config";
import { ShiftCard } from "./ShiftCard";

/**
 * Bottom section: the three daily shift cards in a row, with the active
 * card highlighted. Collapses into a stacked layout on small screens.
 */
export function FooterShiftSummary({
  academy,
  evaluation,
}: {
  academy: AcademyInfo;
  evaluation: ScheduleEvaluation;
}) {
  const { state, activeShift, nextShift, progress } = evaluation;

  return (
    <footer className="w-full">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {academy.schedule.map((shift) => (
          <ShiftCard
            key={shift.id}
            shift={shift}
            isActive={state === "active" && activeShift?.id === shift.id}
            isNext={nextShift?.id === shift.id}
            progress={state === "active" && activeShift?.id === shift.id ? progress : 0}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40">
        <span>
          {appConfig.hoursLabel} · {academy.name}
        </span>
        <span className="hidden sm:inline">Academy Batch Controller v0.1</span>
      </div>
    </footer>
  );
}