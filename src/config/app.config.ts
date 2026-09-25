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
  /**
   * Base URL of the academy API. Defaults to the built-in same-origin route
   * handlers ("/api"). Point it at an external host to use a remote API,
   * or set it to "" to force bundled mock data.
   */
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
  // Default to the built-in route handlers; "" opts out (mock data only).
  apiUrl: process.env.NEXT_PUBLIC_API_URL === "" ? undefined : (process.env.NEXT_PUBLIC_API_URL?.trim() || "/api"),
  useRemoteData: process.env.NEXT_PUBLIC_API_URL !== "",
  showEmblems: true,
};