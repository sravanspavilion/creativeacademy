import type { CSSProperties } from "react";
import { Emblem } from "./Emblem";
import type { EmblemProps } from "./Emblem";

interface EmblemSpec {
  key: string;
  label: string;
  theme: { from: string; to: string };
  glyph?: EmblemProps["glyph"];
  style: { left?: string; right?: string; top?: string; bottom?: string };
  size: number;
  tiltX: number;
  tiltY: number;
  spin: number;
  duration: number;
  delay: number;
  opacity: number;
}

/**
 * Creative tool emblems distributed around the screen edges, behind the
 * main UI and deliberately clear of the central clock.
 *
 * Abstract monogram tiles (custom SVG) — no trademarked logo assets.
 * Floating via pure CSS (see `.emblem-float` in globals.css); positions,
 * speeds and tilts are static per emblem. Hidden below `md` so mobile
 * stays uncluttered. `prefers-reduced-motion` freezes the float.
 */
const SPECS: EmblemSpec[] = [
  { key: "ps", label: "Ps", theme: { from: "#001e36", to: "#31a8ff" }, style: { left: "4%", top: "13%" }, size: 96, tiltX: 10, tiltY: -14, spin: -8, duration: 11, delay: 0, opacity: 0.5 },
  { key: "pr", label: "Pr", theme: { from: "#2a0634", to: "#9999ff" }, style: { left: "2.5%", top: "44%" }, size: 82, tiltX: -8, tiltY: 12, spin: 6, duration: 13, delay: 1.2, opacity: 0.45 },
  { key: "ae", label: "Ae", theme: { from: "#12005e", to: "#9999ff" }, style: { right: "2.5%", top: "38%" }, size: 86, tiltX: 8, tiltY: 14, spin: 8, duration: 12, delay: 2, opacity: 0.45 },
  { key: "ill", label: "Ai", theme: { from: "#330000", to: "#ff9a00" }, style: { right: "4%", top: "11%" }, size: 90, tiltX: -10, tiltY: -12, spin: -5, duration: 11.5, delay: 0.8, opacity: 0.5 },
  { key: "lr", label: "Lr", theme: { from: "#001e36", to: "#31a8ff" }, style: { left: "6%", bottom: "15%" }, size: 76, tiltX: 6, tiltY: -8, spin: 4, duration: 10, delay: 1.6, opacity: 0.45 },
  { key: "gpt", label: "GPT", glyph: "spark", theme: { from: "#0f172a", to: "#10a37f" }, style: { right: "5%", bottom: "17%" }, size: 82, tiltX: -6, tiltY: 10, spin: -6, duration: 12.5, delay: 0.4, opacity: 0.45 },
  { key: "aig", label: "AI", glyph: "spark", theme: { from: "#7c3aed", to: "#ff6b6b" }, style: { right: "11%", top: "60%" }, size: 66, tiltX: 12, tiltY: -8, spin: 10, duration: 9.5, delay: 2.6, opacity: 0.4 },
  { key: "mj", label: "MJ", glyph: "knot", theme: { from: "#101026", to: "#5b5bd6" }, style: { left: "10%", top: "62%" }, size: 62, tiltX: -10, tiltY: 8, spin: -8, duration: 10.5, delay: 3, opacity: 0.35 },
  { key: "cn", label: "Cn", theme: { from: "#00c4cc", to: "#7d2ae8" }, style: { right: "15%", bottom: "7%" }, size: 60, tiltX: 8, tiltY: 12, spin: 6, duration: 9, delay: 1.1, opacity: 0.35 },
  { key: "ax", label: "Ex", glyph: "play", theme: { from: "#6b21a8", to: "#e11d48" }, style: { left: "13%", bottom: "7%" }, size: 56, tiltX: -12, tiltY: -6, spin: -4, duration: 11, delay: 2.2, opacity: 0.35 },
];

export function FloatingToolEmblems({ enabled = true }: { enabled?: boolean }) {
  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] hidden overflow-hidden md:block"
    >
      {SPECS.map((s) => (
        <div
          key={s.key}
          className="emblem-float"
          style={
            {
              left: s.style.left,
              right: s.style.right,
              top: s.style.top,
              bottom: s.style.bottom,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
              "--tilt-x": `${s.tiltX}deg`,
              "--tilt-y": `${s.tiltY}deg`,
              "--spin": `${s.spin}deg`,
            } as CSSProperties
          }
        >
          <Emblem label={s.label} theme={s.theme} glyph={s.glyph} />
        </div>
      ))}
    </div>
  );
}