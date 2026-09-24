import type { ClockFormat } from "@academy/shared";

/**
 * Runtime display configuration. Everything is driven by environment
 * variables with sensible defaults, so the academy can rebrand the screen
 * without touching components. NEXT_PUBLIC_* values are inlined at build
 * time by Next.js.
 */
export interface AppConfig {
  academyName: string;
  tagline: string;
  hoursLabel: string;
  clockFormat: ClockFormat;
  showSeconds: boolean;
  /** Base URL of the NestJS API, e.g. "http://localhost:3001/api". */
  apiUrl?: string;
  /** When true and the API is reachable, live API data is used. */
  useRemoteData: boolean;
  showEmblems: boolean;
}

const readEnv = (key: string, fallback: string): string =>
  process.env[key]?.trim() || fallback;

export const appConfig: AppConfig = {
  academyName: readEnv("NEXT_PUBLIC_ACADEMY_NAME", "CREATIVE AI ACADEMY"),
  tagline: readEnv("NEXT_PUBLIC_TAGLINE", "EDITING • DESIGN • AI"),
  hoursLabel: readEnv("NEXT_PUBLIC_ACADEMY_HOURS", "9:00 AM — 6:00 PM"),
  clockFormat: (readEnv("NEXT_PUBLIC_CLOCK_FORMAT", "12") === "24" ? "24" : "12") as ClockFormat,
  showSeconds: true,
  apiUrl: process.env.NEXT_PUBLIC_API_URL?.trim() || undefined,
  useRemoteData: Boolean(process.env.NEXT_PUBLIC_API_URL?.trim()),
  showEmblems: true,
};