import { useId } from "react";

export interface EmblemTheme {
  from: string;
  to: string;
}

export interface EmblemProps {
  /** Monogram / glyph text rendered on the tile, e.g. "Ps", "Pr", "AI". */
  label: string;
  theme: EmblemTheme;
  size?: number;
  glyph?: "spark" | "play" | "knot";
  className?: string;
}

/**
 * Custom abstract "3D-style" tool emblem — a glossy gradient tile with a
 * typographic monogram. Explicitly NOT a copy of any trademarked logo:
 * brand-reminiscent colors + abstract marks only (see spec §6).
 */
export function Emblem({ label, theme, size = 96, glyph, className }: EmblemProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradientId = `emblem-${uid}`;
  const glossId = `${gradientId}-gloss`;
  const fontSize = label.length >= 3 ? 22 : 30;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={`${label} emblem`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.from} />
          <stop offset="100%" stopColor={theme.to} />
        </linearGradient>
        <linearGradient id={glossId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* tile */}
      <rect x="8" y="8" width="84" height="84" rx="22" fill={`url(#${gradientId})`} />
      <rect
        x="8.75"
        y="8.75"
        width="82.5"
        height="82.5"
        rx="20.5"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
      />
      {/* glossy highlight */}
      <rect x="8" y="8" width="84" height="44" rx="22" fill={`url(#${glossId})`} />

      {/* accent glyphs */}
      {glyph === "spark" && (
        <g fill="#ffffff" opacity={0.95}>
          <path d="M74 18l2.6 6.9 6.9 2.6-6.9 2.6-2.6 6.9-2.6-6.9-6.9-2.6 6.9-2.6Z" />
        </g>
      )}
      {glyph === "play" && <path d="M36 34l34 16-34 16Z" fill="#ffffff" opacity={0.9} />}
      {glyph === "knot" && (
        <g fill="#ffffff" opacity={0.9}>
          <path d="M50 30l10 6.5V54l-10 6.5L40 54V36.5Z" />
          <circle cx="50" cy="45" r="2.4" fillOpacity="0.6" />
        </g>
      )}

      {/* monogram */}
      <text
        x="50"
        y="63"
        textAnchor="middle"
        fontFamily="Sora, 'Space Grotesk', sans-serif"
        fontWeight={800}
        fontSize={fontSize}
        letterSpacing="0.5"
        fill="rgba(255,255,255,0.96)"
      >
        {label}
      </text>
    </svg>
  );
}