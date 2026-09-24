import type { AcademyInfo, DayState, ScheduleEvaluation, Shift } from "./types";

/** Clamp a number into [0, 1]. */
const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Parse an "HH:mm" string into minutes since midnight.
 * Returns 0 for malformed input so bad config never crashes the display.
 */
export function parseTimeToMinutes(time: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return 0;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

/**
 * Build the local-time Date that `time` ("HH:mm") falls on the calendar day of `ref`.
 * Uses the *device's local time* so the dashboard always matches the screen it runs on.
 */
export function localTimeOn(ref: Date, time: string): Date {
  const minutes = parseTimeToMinutes(time);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), hours, mins, 0, 0);
}

/** Enabled shifts sorted by start time. */
function activeShifts(academy: AcademyInfo): Shift[] {
  return academy.schedule
    .filter((shift) => shift.enabled)
    .slice()
    .sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));
}

const EMPTY_EVALUATION = (now: Date, state: DayState): ScheduleEvaluation => ({
  state,
  now,
  activeShift: null,
  nextShift: null,
  remainingMs: 0,
  remainingSec: 0,
  progress: 0,
  untilStartMs: 0,
  untilStartSec: 0,
});

/**
 * Pure schedule evaluator — the single source of truth for shift detection.
 *
 * Semantics (shifts are half-open intervals [start, end)):
 *  - 08:59:59 → "pre-open"  (next shift = first shift, untilStartSec = time until 09:00)
 *  - 09:00:00 → "active"    (Morning Shift, remaining 3:00:00, progress 0)
 *  - 11:59:59 → "active"    (Morning Shift, remaining 1s)
 *  - 12:00:00 → "active"    (Afternoon Shift takes over on the boundary)
 *  - 17:59:59 → "active"    (Evening Shift, remaining 1s)
 *  - 18:00:00 → "ended"     (until tomorrow's first shift)
 *  - gaps between enabled shifts → "between"
 *
 * Every value is recomputed from `now`; nothing is ever decremented, so an
 * inactive browser tab resyncs correctly the moment it becomes visible.
 *
 * @param now      The instant to evaluate (normally `new Date()`).
 * @param academy  Academy info containing the shift schedule.
 */
export function evaluateSchedule(now: Date, academy: AcademyInfo): ScheduleEvaluation {
  const shifts = activeShifts(academy);
  if (shifts.length === 0) {
    return EMPTY_EVALUATION(now, "ended");
  }

  const starts = shifts.map((shift) => localTimeOn(now, shift.start).getTime());
  const ends = shifts.map((shift) => localTimeOn(now, shift.end).getTime());
  const nowMs = now.getTime();

  // --- 1. Active shift: start <= now < end -------------------------------
  const activeIndex = shifts.findIndex((shift, i) => nowMs >= starts[i] && nowMs < ends[i]);

  if (activeIndex >= 0) {
    const startMs = starts[activeIndex];
    const endMs = ends[activeIndex];
    const remainingMs = endMs - nowMs;
    const isLast = activeIndex === shifts.length - 1;
    const nextStartMs = isLast
      ? // tomorrow's first shift
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          Math.floor(parseTimeToMinutes(shifts[0].start) / 60),
          parseTimeToMinutes(shifts[0].start) % 60,
          0,
          0,
        ).getTime()
      : starts[activeIndex + 1];

    return {
      state: "active",
      now,
      activeShift: shifts[activeIndex],
      nextShift: isLast ? shifts[0] : shifts[activeIndex + 1],
      remainingMs,
      remainingSec: Math.ceil(remainingMs / 1000),
      progress: clamp01((nowMs - startMs) / (endMs - startMs)),
      untilStartMs: nextStartMs - nowMs,
      untilStartSec: Math.ceil((nextStartMs - nowMs) / 1000),
    };
  }

  // --- 2. Pre-opening: before the first shift -----------------------------
  if (nowMs < starts[0]) {
    const untilStartMs = starts[0] - nowMs;
    return {
      state: "pre-open",
      now,
      activeShift: null,
      nextShift: shifts[0],
      remainingMs: 0,
      remainingSec: 0,
      progress: 0,
      untilStartMs,
      untilStartSec: Math.ceil(untilStartMs / 1000),
    };
  }

  // --- 3. After the last shift: schedule ended ----------------------------
  if (nowMs >= ends[ends.length - 1]) {
    const firstMinutes = parseTimeToMinutes(shifts[0].start);
    const tomorrowOpen = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      Math.floor(firstMinutes / 60),
      firstMinutes % 60,
      0,
      0,
    ).getTime();
    const untilStartMs = tomorrowOpen - nowMs;
    return {
      state: "ended",
      now,
      activeShift: null,
      nextShift: shifts[0],
      remainingMs: 0,
      remainingSec: 0,
      progress: 0,
      untilStartMs,
      untilStartSec: Math.ceil(untilStartMs / 1000),
    };
  }

  // --- 4. Gap between shifts (only possible if a shift is disabled) -------
  const gapIndex = starts.findIndex((start) => start > nowMs);
  const upcoming = shifts[gapIndex] ?? shifts[0];
  const untilStartMs = starts[gapIndex] - nowMs;
  return {
    state: "between",
    now,
    activeShift: null,
    nextShift: upcoming,
    remainingMs: 0,
    remainingSec: 0,
    progress: 0,
    untilStartMs,
    untilStartSec: Math.ceil(untilStartMs / 1000),
  };
}