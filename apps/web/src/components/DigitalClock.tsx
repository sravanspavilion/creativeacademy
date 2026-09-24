import { formatClock } from "@academy/shared";
import { appConfig } from "@/config/app.config";

/**
 * Large hero clock. Format (12h/24h) is configurable via env.
 * Responsive sizing scales with viewport so it stays readable on
 * projectors, 4K monitors and laptops alike.
 *
 * `suppressHydrationWarning` because the displayed text is inherently
 * time-varying between server prerender and client hydration.
 */
export function DigitalClock({ now }: { now: Date }) {
  const text = formatClock(now, appConfig.clockFormat, appConfig.showSeconds);
  return (
    <span
      role="timer"
      aria-label={`Current time ${text}`}
      suppressHydrationWarning
      className="text-glow font-mono text-[clamp(3.8rem,13vw,11.5rem)] font-semibold leading-none tracking-tight text-white tabular-nums"
    >
      {text}
    </span>
  );
}