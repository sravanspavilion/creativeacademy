import { describe, it, expect } from "vitest";
import { evaluateSchedule, parseTimeToMinutes, localTimeOn } from "../src/schedule";
import {
  formatClock,
  formatDuration,
  formatRange,
  formatDayName,
  formatDateLabel,
} from "../src/format";
import { mockAcademy } from "../src/data/mock";
import type { AcademyInfo, Shift } from "../src/types";

/** Build a local-time instant. Deliberately NOT toISOString-based (TZ-safe). */
const at = (h: number, m: number, s = 0): Date =>
  new Date(2026, 8, 24, h, m, s, 0); // September 24, 2026

/** Assert the classic morning-shift default evaluation helper. */
const evalAt = (h: number, m: number, s = 0) =>
  evaluateSchedule(at(h, m, s), mockAcademy);

describe("evaluateSchedule — boundary scenarios (spec §15)", () => {
  it("08:59:59 → pre-open, opens in 1 second", () => {
    const r = evalAt(8, 59, 59);
    expect(r.state).toBe("pre-open");
    expect(r.activeShift).toBeNull();
    expect(r.nextShift?.id).toBe("shift-1");
    expect(r.untilStartSec).toBe(1);
    expect(r.remainingSec).toBe(0);
  });

  it("08:00:00 → pre-open, opens in 1 hour", () => {
    const r = evalAt(8, 0, 0);
    expect(r.state).toBe("pre-open");
    expect(r.untilStartSec).toBe(3600);
  });

  it("09:00:00 → Morning Shift active, remaining 3:00:00, progress 0", () => {
    const r = evalAt(9, 0, 0);
    expect(r.state).toBe("active");
    expect(r.activeShift?.id).toBe("shift-1");
    expect(r.activeShift?.label).toBe("MORNING");
    expect(r.remainingSec).toBe(3 * 3600);
    expect(r.progress).toBeCloseTo(0, 5);
    expect(r.nextShift?.id).toBe("shift-2");
  });

  it("10:30:00 → Morning Shift, remaining 1:30:00, progress 50%", () => {
    const r = evalAt(10, 30, 0);
    expect(r.activeShift?.id).toBe("shift-1");
    expect(r.remainingSec).toBe(90 * 60);
    expect(r.progress).toBeCloseTo(0.5, 5);
  });

  it("11:59:59 → Morning Shift, remaining 1 second", () => {
    const r = evalAt(11, 59, 59);
    expect(r.activeShift?.id).toBe("shift-1");
    expect(r.remainingSec).toBe(1);
    expect(r.progress).toBeGreaterThan(0.99);
  });

  it("12:00:00 → Afternoon Shift takes over, remaining exactly 3:00:00", () => {
    const r = evalAt(12, 0, 0);
    expect(r.state).toBe("active");
    expect(r.activeShift?.id).toBe("shift-2");
    expect(r.activeShift?.label).toBe("AFTERNOON");
    expect(r.remainingSec).toBe(3 * 3600);
    expect(r.progress).toBe(0);
  });

  it("14:59:59 → Afternoon Shift, remaining 1 second", () => {
    const r = evalAt(14, 59, 59);
    expect(r.activeShift?.id).toBe("shift-2");
    expect(r.remainingSec).toBe(1);
  });

  it("15:00:00 → Evening Shift active, remaining 3:00:00", () => {
    const r = evalAt(15, 0, 0);
    expect(r.state).toBe("active");
    expect(r.activeShift?.id).toBe("shift-3");
    expect(r.activeShift?.label).toBe("EVENING");
    expect(r.remainingSec).toBe(3 * 3600);
    expect(r.progress).toBe(0);
  });

  it("17:59:59 → Evening Shift, remaining 1 second", () => {
    const r = evalAt(17, 59, 59);
    expect(r.activeShift?.id).toBe("shift-3");
    expect(r.remainingSec).toBe(1);
  });

  it("18:00:00 → schedule ended, until tomorrow 09:00 = 15 hours", () => {
    const r = evalAt(18, 0, 0);
    expect(r.state).toBe("ended");
    expect(r.activeShift).toBeNull();
    expect(r.nextShift?.id).toBe("shift-1");
    expect(r.untilStartSec).toBe(15 * 3600);
  });

  it("20:00:00 → ended, wait until 09:00 tomorrow (13 hours)", () => {
    const r = evalAt(20, 0, 0);
    expect(r.state).toBe("ended");
    expect(r.untilStartSec).toBe(13 * 3600);
  });

  it("23:59:59 → ended, 9 hours 1 second until 09:00", () => {
    const r = evalAt(23, 59, 59);
    expect(r.state).toBe("ended");
    expect(r.untilStartSec).toBe(9 * 3600 + 1);
  });

  it("00:00:00 → pre-open of the new day, opens in 9 hours", () => {
    const r = evalAt(0, 0, 0);
    expect(r.state).toBe("pre-open");
    expect(r.untilStartSec).toBe(9 * 3600);
  });
});

describe("evaluateSchedule — configuration edge cases", () => {
  it("does not crash (and reports 'ended') when all shifts are disabled", () => {
    const empty: AcademyInfo = {
      ...mockAcademy,
      schedule: mockAcademy.schedule.map((s) => ({ ...s, enabled: false })),
    };
    const r = evaluateSchedule(new Date(2026, 8, 24, 10, 0, 0), empty);
    expect(r.state).toBe("ended");
    expect(r.activeShift).toBeNull();
    expect(r.nextShift).toBeNull();
  });

  it("handles a gap when the middle shift is disabled → 'between'", () => {
    const gapped: AcademyInfo = {
      ...mockAcademy,
      schedule: mockAcademy.schedule.map((s) =>
        s.id === "shift-2" ? { ...s, enabled: false } : s,
      ),
    };
    const r = evaluateSchedule(new Date(2026, 8, 24, 13, 0, 0), gapped);
    expect(r.state).toBe("between");
    expect(r.activeShift).toBeNull();
    expect(r.nextShift?.id).toBe("shift-3");
    expect(r.untilStartSec).toBe(2 * 3600); // until 15:00
  });

  it("respects a custom, non-default schedule (future configurability)", () => {
    const custom: AcademyInfo = {
      ...mockAcademy,
      schedule: [
        {
          ...mockAcademy.schedule[0],
          id: "early",
          start: "07:00",
          end: "10:00",
        } as Shift,
      ],
    };
    const r = evaluateSchedule(new Date(2026, 8, 24, 7, 30, 0), custom);
    expect(r.state).toBe("active");
    expect(r.activeShift?.id).toBe("early");
    expect(r.remainingSec).toBe(2.5 * 3600);
  });
});

describe("time helpers", () => {
  it("parses HH:mm", () => {
    expect(parseTimeToMinutes("09:00")).toBe(540);
    expect(parseTimeToMinutes("18:00")).toBe(1080);
    expect(parseTimeToMinutes("not-a-time")).toBe(0);
  });

  it("localTimeOn lands on the same calendar day as ref", () => {
    const ref = new Date(2026, 8, 24, 15, 0, 0);
    const t = localTimeOn(ref, "12:30");
    expect(t.getFullYear()).toBe(2026);
    expect(t.getMonth()).toBe(8);
    expect(t.getDate()).toBe(24);
    expect(t.getHours()).toBe(12);
    expect(t.getMinutes()).toBe(30);
  });
});

describe("formatters", () => {
  it("formats a 12-hour clock with seconds and period", () => {
    expect(formatClock(at(9, 45, 32))).toBe("09:45:32 AM");
    expect(formatClock(at(15, 5, 7))).toBe("03:05:07 PM");
    expect(formatClock(at(0, 0, 0))).toBe("12:00:00 AM");
  });

  it("formats a 24-hour clock", () => {
    expect(formatClock(at(15, 5, 7), "24")).toBe("15:05:07");
  });

  it("formats durations as HH:MM:SS and clamps negatives", () => {
    expect(formatDuration(2.5 * 3600)).toBe("02:30:00");
    expect(formatDuration(1)).toBe("00:00:01");
    expect(formatDuration(-5)).toBe("00:00:00");
    expect(formatDuration(0)).toBe("00:00:00");
  });

  it("formats shift time ranges with an em dash", () => {
    expect(formatRange("09:00", "12:00")).toBe("09:00 AM — 12:00 PM");
    expect(formatRange("15:00", "18:00")).toBe("03:00 PM — 06:00 PM");
  });

  it("formats day and date labels", () => {
    const d = at(10, 0, 0); // Thursday, Sep 24 2026
    expect(formatDayName(d)).toBe("THURSDAY");
    expect(formatDateLabel(d)).toBe("SEP 24, 2026");
  });
});

describe("mock data completeness", () => {
  it("has exactly three enabled default shifts spanning 09:00–18:00", () => {
    const enabled = mockAcademy.schedule.filter((s) => s.enabled);
    expect(enabled).toHaveLength(3);
    expect(enabled.map((s) => s.start)).toEqual(["09:00", "12:00", "15:00"]);
    expect(enabled.map((s) => s.end)).toEqual(["12:00", "15:00", "18:00"]);
    expect(enabled.every((s) => s.durationHours === 3)).toBe(true);
  });

  it("every shift carries a course with an emblem key and valid theme colors", () => {
    for (const shift of mockAcademy.schedule) {
      expect(shift.course.emblem).toBeTruthy();
      expect(shift.theme.accent).toMatch(/^#[0-9A-F]{6}$/i);
      expect(shift.theme.from).toMatch(/^#[0-9A-F]{6}$/i);
      expect(shift.theme.to).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("the active-shift examples from the spec hold", () => {
    expect(evalAt(13, 45, 0).remainingSec).toBe(75 * 60); // 1 hour 15 min
    expect(evalAt(16, 30, 0).remainingSec).toBe(90 * 60); // 1 hour 30 min
  });
});