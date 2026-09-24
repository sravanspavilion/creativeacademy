import { formatDuration } from "@academy/shared";

/**
 * Live countdown, fed by whole-second values recomputed every tick.
 * Rendering is fully derived from `seconds` — no internal decrementing.
 * `suppressHydrationWarning` as the value moves between server/client.
 */
export function CountdownTimer({ seconds, label }: { seconds: number; label: string }) {
  const text = formatDuration(seconds);
  return (
    <div
      role="timer"
      aria-label={`${label} ${text}`}
      className="flex flex-col items-center gap-1.5"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-white/60 sm:text-xs">
        {label}
      </span>
      <span
        suppressHydrationWarning
        className="text-glow font-mono text-[clamp(1.8rem,6vw,4.2rem)] font-semibold leading-none text-white tabular-nums"
      >
        {text}
      </span>
    </div>
  );
}