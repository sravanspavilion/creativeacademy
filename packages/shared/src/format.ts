import type { NowParts } from "./types";
import { parseTimeToMinutes } from "./schedule";

export type ClockFormat = "12" | "24";

const pad2 = (n: number): string => String(n).padStart(2, "0");

/**
 * Format a Date as a digital-clock string.
 *  12-hour: "09:45:32 AM"   24-hour: "09:45:32"
 */
export function formatClock(date: Date, format: ClockFormat = "12", showSeconds = true): string {
  const seconds = showSeconds ? `:${pad2(date.getSeconds())}` : "";
  if (format === "24") {
    return `${pad2(date.getHours())}:${pad2(date.getMinutes())}${seconds}`;
  }
  const h = date.getHours() % 12 || 12;
  const period = date.getHours() < 12 ? "AM" : "PM";
  return `${pad2(h)}:${pad2(date.getMinutes())}${seconds} ${period}`;
}

/** Convert an "HH:mm" string to a 12-hour label, e.g. "09:00" → "09:00 AM". */
export function formatTime12(time: string): string {
  const minutes = parseTimeToMinutes(time);
  const hours24 = Math.floor(minutes / 60);
  const h = hours24 % 12 || 12;
  const period = hours24 < 12 ? "AM" : "PM";
  return `${pad2(h)}:${pad2(minutes % 60)} ${period}`;
}

/** "09:00"–"12:00" → "09:00 AM — 12:00 PM" (em dash, per design spec). */
export function formatRange(start: string, end: string): string {
  return `${formatTime12(start)} — ${formatTime12(end)}`;
}

/** Whole seconds → "HH:MM:SS". Negative input clamps to "00:00:00". */
export function formatDuration(totalSeconds: number): string {
  const total = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

const DAY_NAMES = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

const MONTH_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

const MONTH_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Uppercase weekday, e.g. "THURSDAY". */
export function formatDayName(date: Date): string {
  return DAY_NAMES[date.getDay()];
}

/** Short date label, e.g. "SEP 24, 2026". */
export function formatDateLabel(date: Date): string {
  return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Long date label, e.g. "Thursday, September 24, 2026". */
export function formatFullDate(date: Date): string {
  const day = DAY_NAMES[date.getDay()];
  return `${day.charAt(0)}${day.slice(1).toLowerCase()}, ${MONTH_LONG[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Decompose a Date into display parts for the header/clock. */
export function formatParts(date: Date): NowParts {
  const hours24 = date.getHours();
  return {
    hours12: hours24 % 12 || 12,
    hours24,
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    period: hours24 < 12 ? "AM" : "PM",
    dayName: formatDayName(date),
    dateLabel: formatDateLabel(date),
    fullDate: formatFullDate(date),
  };
}

/** "9:00 AM" from an "HH:mm" string (single-digit hour). */
export function formatTimeLoose(time: string): string {
  const minutes = parseTimeToMinutes(time);
  const hours24 = Math.floor(minutes / 60);
  const h = hours24 % 12 || 12;
  const period = hours24 < 12 ? "AM" : "PM";
  return `${h}:${pad2(minutes % 60)} ${period}`;
}