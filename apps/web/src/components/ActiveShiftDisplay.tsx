import { AlarmClock, Sun } from "lucide-react";
import { formatRange, formatTimeLoose } from "@academy/shared";
import type { ScheduleEvaluation, Shift } from "@academy/shared";
import { appConfig } from "@/config/app.config";
import { CountdownTimer } from "./CountdownTimer";
import { CourseInfo } from "./CourseInfo";
import { ScheduleProgress } from "./ScheduleProgress";

/** Headline block: shift label + course name + time range. */
function ShiftHeading({ shift }: { shift: Shift }) {
  return (
    <div className="flex flex-col items-center gap-2 lg:items-start">
      <span
        className="text-[11px] font-extrabold uppercase tracking-[0.4em] sm:text-sm"
        style={{ color: shift.theme.accent }}
      >
        {shift.label} Shift
      </span>
      <h2 className="text-glow font-display text-[clamp(1.7rem,5.5vw,4rem)] font-extrabold leading-[1.05] text-white">
        {shift.course.name}
      </h2>
      <p className="font-mono text-sm font-semibold tabular-nums text-white/65 sm:text-lg">
        {formatRange(shift.start, shift.end)}
      </p>
      <CourseInfo shift={shift} />
    </div>
  );
}

/** Runs while a shift is active: course + live countdown + progress. */
function ActivePanel({ evaluation }: { evaluation: ScheduleEvaluation }) {
  const { activeShift, remainingSec, progress } = evaluation;
  const shift = activeShift!;

  return (
    <div
      className="w-full rounded-3xl p-[2px]"
      style={{
        background: `linear-gradient(135deg, ${shift.theme.from}, ${shift.theme.to})`,
        boxShadow: `0 0 80px -20px ${shift.theme.accent}59`,
      }}
    >
      <div className="glass-panel grid gap-6 rounded-[calc(1.5rem-2px)] p-6 sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
        <ShiftHeading shift={shift} />
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-6 sm:py-7">
          <CountdownTimer seconds={remainingSec} label="TIME REMAINING" />
          <ScheduleProgress progress={progress} shift={shift} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
            {shift.durationHours}h Session · {appConfig.hoursLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Shown before 9:00 AM (and overnight): academy is not open yet. */
function PreOpenPanel({ evaluation }: { evaluation: ScheduleEvaluation }) {
  const { nextShift, untilStartSec } = evaluation;
  const shift = nextShift!;

  return (
    <div className="glass-panel mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-3xl px-6 py-8 text-center sm:py-10">
      <div className="flex items-center gap-2 text-amber-300">
        <AlarmClock className="h-5 w-5" aria-hidden />
        <span className="text-[11px] font-extrabold uppercase tracking-[0.34em]">Pre-Opening</span>
      </div>
      <h2 className="text-glow font-display text-[clamp(1.8rem,5vw,3.4rem)] font-extrabold leading-tight text-white">
        Academy Opens at {formatTimeLoose(shift.start)}
      </h2>
      <CountdownTimer seconds={untilStartSec} label="OPENS IN" />
      <p className="max-w-xl text-sm font-medium text-white/65 sm:text-base">
        First lesson today —{" "}
        <span className="font-semibold text-white/90">{shift.label} Shift</span> ·{" "}
        {shift.course.name} · {formatRange(shift.start, shift.end)}
      </p>
    </div>
  );
}

/** Shown after 6:00 PM: the academy day is over. */
function EndedPanel({ evaluation }: { evaluation: ScheduleEvaluation }) {
  const { nextShift, untilStartSec } = evaluation;
  const shift = nextShift!;

  return (
    <div className="glass-panel mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-3xl px-6 py-8 text-center sm:py-10">
      <div className="flex items-center gap-2 text-sky-300">
        <Sun className="h-5 w-5" aria-hidden />
        <span className="text-[11px] font-extrabold uppercase tracking-[0.34em]">Academy Closed</span>
      </div>
      <h2 className="text-glow font-display text-[clamp(1.8rem,5vw,3.4rem)] font-extrabold leading-tight text-white">
        Today&apos;s Schedule Has Ended
      </h2>
      <CountdownTimer seconds={untilStartSec} label="NEXT DAY STARTS IN" />
      <p className="max-w-xl text-sm font-medium text-white/65 sm:text-base">
        Resumes at {formatTimeLoose(shift.start)} tomorrow with{" "}
        <span className="font-semibold text-white/90">{shift.course.name}</span> ·{" "}
        {formatRange(shift.start, shift.end)}
      </p>
    </div>
  );
}

/** Shown only if shifts are configured with a gap (e.g. a shift is disabled). */
function BetweenPanel({ evaluation }: { evaluation: ScheduleEvaluation }) {
  const { nextShift, untilStartSec } = evaluation;
  const shift = nextShift!;

  return (
    <div className="glass-panel mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-3xl px-6 py-8 text-center sm:py-10">
      <div className="flex items-center gap-2 text-violet-300">
        <AlarmClock className="h-5 w-5" aria-hidden />
        <span className="text-[11px] font-extrabold uppercase tracking-[0.34em]">Short Break</span>
      </div>
      <h2 className="text-glow font-display text-[clamp(1.8rem,5vw,3.4rem)] font-extrabold leading-tight text-white">
        Next Shift
      </h2>
      <CountdownTimer seconds={untilStartSec} label="NEXT SHIFT IN" />
      <p className="max-w-xl text-sm font-medium text-white/65 sm:text-base">
        {shift.label} Shift · {shift.course.name} · {formatRange(shift.start, shift.end)}
      </p>
    </div>
  );
}

/**
 * State-aware center panel: active shift details + countdown,
 * or the pre-open / ended / between states.
 */
export function ActiveShiftDisplay({ evaluation }: { evaluation: ScheduleEvaluation }) {
  switch (evaluation.state) {
    case "pre-open":
      return <PreOpenPanel evaluation={evaluation} />;
    case "ended":
      return <EndedPanel evaluation={evaluation} />;
    case "between":
      return <BetweenPanel evaluation={evaluation} />;
    case "active":
    default:
      return <ActivePanel evaluation={evaluation} />;
  }
}