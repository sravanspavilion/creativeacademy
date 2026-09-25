import { Radio } from "lucide-react";
import { formatRange } from "@academy/shared";
import type { Shift } from "@academy/shared";

interface ShiftCardProps {
  shift: Shift;
  isActive: boolean;
  isNext: boolean;
  progress: number;
}

/**
 * One shift card in the bottom summary row.
 * The active card gets a gradient border + glow + "NOW ACTIVE" badge and
 * shows an animated progress bar. Neighbours are dimmed.
 */
export function ShiftCard({ shift, isActive, isNext, progress }: ShiftCardProps) {
  if (isActive) {
    const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
    return (
      <div
        className="relative rounded-2xl p-[2px] transition-transform duration-500 lg:hover:scale-[1.015] lg:scale-[1.03]"
        style={{
          background: `linear-gradient(135deg, ${shift.theme.from}, ${shift.theme.to})`,
          boxShadow: `0 0 46px -8px ${shift.theme.accent}66`,
        }}
      >
        <div className="glass-panel flex h-full flex-col gap-2 rounded-[calc(1rem-2px)] px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-white/80">
              {shift.label}
            </span>
            <span
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
              style={{ background: `linear-gradient(90deg, ${shift.theme.from}, ${shift.theme.to})` }}
            >
              <Radio className="h-3 w-3" aria-hidden /> Now Active
            </span>
          </div>
          <p className="font-mono text-sm font-semibold tabular-nums text-white/90 sm:text-base">
            {formatRange(shift.start, shift.end)}
          </p>
          <p className="font-display text-base font-bold leading-tight text-white lg:text-xl">
            {shift.course.name}
          </p>
          <div className="mt-auto h-1.5 w-full overflow-hidden rounded-full bg-white/10">
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
      </div>
    );
  }

  return (
    <div
      className={`glass-panel flex h-full flex-col gap-2 rounded-2xl px-4 py-4 transition-opacity duration-500 sm:px-5 sm:py-5 ${
        isNext ? "border-white/25 opacity-90" : "border-white/5 opacity-60"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-white/50">
          {shift.label}
        </span>
        {isNext && (
          <span className="rounded-full border border-white/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
            Up Next
          </span>
        )}
      </div>
      <p className="font-mono text-sm font-semibold tabular-nums text-white/70 sm:text-base">
        {formatRange(shift.start, shift.end)}
      </p>
      <p className="font-display text-base font-bold leading-tight text-white/85 lg:text-xl">
        {shift.course.name}
      </p>
    </div>
  );
}