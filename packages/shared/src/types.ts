/**
 * Shared domain types for the Creative Academy Batch Controller.
 * These types are used by both the Next.js dashboard and the NestJS API,
 * and are designed to map 1:1 onto a future Prisma/PostgreSQL schema.
 */

/** A course taught at the academy (Adobe tools, AI tools, motion, etc). */
export interface Course {
  id: string;
  /** Display name, e.g. "Adobe Premiere Pro". */
  name: string;
  /** Category, e.g. "Video Editing", "AI Workflows". */
  category: string;
  /** Emblem key used by the dashboard to render an abstract tool mark. */
  emblem: string;
  /** Related tool labels, e.g. ["Photoshop", "Generative Fill"]. */
  tools: string[];
}

/** Per-shift accent theme, consumed by the dashboard for cards and badges. */
export interface ShiftTheme {
  /** Primary accent hex (e.g. card border / badge tint). */
  accent: string;
  /** CSS gradient stops for the active glow. */
  from: string;
  to: string;
}

/** One daily time shift, e.g. "Morning Shift 09:00–12:00". */
export interface Shift {
  id: string;
  /** Short display name, e.g. "Morning Shift". */
  name: string;
  /** Uppercase label for badges, e.g. "MORNING". */
  label: string;
  /** Canonical status string, e.g. "Morning Shift". */
  status: string;
  /** Start time, HH:mm in academy local time (24h, zero-padded). */
  start: string;
  /** End time, HH:mm in academy local time (24h, zero-padded). */
  end: string;
  /** Scheduled duration in hours (3 for the default shifts). */
  durationHours: number;
  /** The course running during this shift. */
  course: Course;
  /** Optional instructor display name. */
  instructor?: string;
  /** Optional room / lab, e.g. "Editing Lab 01". */
  room?: string;
  /** Optional batch name, e.g. "Batch A". */
  batchName?: string;
  /** Optional batch status, e.g. "Enrolling". */
  batchStatus?: string;
  /** Whether the shift participates in the schedule. */
  enabled: boolean;
  theme: ShiftTheme;
}

/** Academy-level branding and the full daily schedule. */
export interface AcademyInfo {
  id: string;
  name: string;
  tagline: string;
  /** Human-readable operating window, e.g. "9:00 AM — 6:00 PM". */
  hoursLabel: string;
  schedule: Shift[];
}

/** Lifecycle state of the day relative to the shift timeline. */
export type DayState = "pre-open" | "active" | "ended" | "between";

/** Result of evaluating a schedule against a point in time (pure logic). */
export interface ScheduleEvaluation {
  state: DayState;
  /** The instant the evaluation ran. */
  now: Date;
  /** The active shift, when state === "active". */
  activeShift: Shift | null;
  /** The next upcoming shift (first shift if pre-open/ended). */
  nextShift: Shift | null;
  /** Milliseconds remaining in the active shift (0 otherwise). */
  remainingMs: number;
  /** Whole seconds remaining in the active shift. */
  remainingSec: number;
  /** Fraction 0..1 of the active shift already elapsed. */
  progress: number;
  /** Milliseconds until the next shift starts (pre-open/between) or until tomorrow's start (ended). */
  untilStartMs: number;
  /** Whole seconds until the next shift starts. */
  untilStartSec: number;
}

/** Minimal representation of the moment, used for clock rendering. */
export interface NowParts {
  hours12: number;
  hours24: number;
  minutes: number;
  seconds: number;
  /** "AM" | "PM" */
  period: "AM" | "PM";
  dayName: string;
  dateLabel: string;
  fullDate: string;
}

/** Source of the currently displayed schedule data. */
export type DataSource = "api" | "mock";