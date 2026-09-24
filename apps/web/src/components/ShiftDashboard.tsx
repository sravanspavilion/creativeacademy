import { formatTimeLoose } from "@academy/shared";
import type { ScheduleEvaluation } from "@academy/shared";
import { DigitalClock } from "./DigitalClock";
import { ActiveShiftDisplay } from "./ActiveShiftDisplay";

/** Quiet "up next" line shown below the main panel. */
function NextUpStrip({ evaluation }: { evaluation: ScheduleEvaluation }) {
  const { state, nextShift } = evaluation;
  if (!nextShift) return null;

  const prefix =
    state === "active"
      ? "Up next"
      : state === "pre-open"
        ? "First lesson"
        : state === "between"
          ? "Next shift"
          : "Resumes tomorrow";

  return (
    <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-white/50 sm:text-sm">
      {prefix} · <span className="text-white/85">{nextShift.label} Shift</span> —{" "}
      {nextShift.course.name} · {formatTimeLoose(nextShift.start)}
    </p>
  );
}

/**
 * Center of the screen: the large live clock with the state-aware
 * active-shift panel directly beneath it.
 */
export function ShiftDashboard({
  evaluation,
  now,
}: {
  evaluation: ScheduleEvaluation;
  now: Date;
}) {
  return (
    <section
      aria-label="Live schedule"
      className="flex w-full flex-1 flex-col items-center justify-center gap-6 lg:gap-8"
    >
      <DigitalClock now={now} />
      <ActiveShiftDisplay evaluation={evaluation} />
      <NextUpStrip evaluation={evaluation} />
    </section>
  );
}