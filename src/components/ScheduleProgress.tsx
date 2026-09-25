import type { Shift } from "@academy/shared";

/** Animated progress bar for the active session, tinted by the shift theme. */
export function ScheduleProgress({ progress, shift }: { progress: number; shift: Shift }) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <div className="w-full max-w-md">
      <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.26em] text-white/55">
        <span>Session Progress</span>
        <span suppressHydrationWarning className="tabular-nums">{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${shift.theme.from}, ${shift.theme.to})`,
            transition: "width 1s linear",
          }}
        />
      </div>
    </div>
  );
}