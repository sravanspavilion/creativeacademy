import { describe, it, expect } from "vitest";
import { InMemoryAcademyRepository } from "../src/data/in-memory-repository";
import { AcademyService } from "../src/academy/academy.service";
import { CoursesService } from "../src/courses/courses.service";
import { ScheduleService, toLocalDateKey } from "../src/schedule/schedule.service";

// Service-level tests. Services are instantiated directly (no Nest
// container) so they run under esbuild without decorator metadata.
const makeServices = () => {
  const repo = new InMemoryAcademyRepository();
  return {
    academy: new AcademyService(repo),
    courses: new CoursesService(repo),
    schedule: new ScheduleService(repo),
  };
};

describe("AcademyService", () => {
  it("returns branding + a full 3-shift schedule", () => {
    const { academy } = makeServices();
    const result = academy.getAcademy();
    expect(result.name).toBe("CREATIVE AI ACADEMY");
    expect(result.tagline).toContain("EDITING");
    expect(result.schedule.filter((s) => s.enabled)).toHaveLength(3);
  });
});

describe("CoursesService", () => {
  it("returns the course catalogue", () => {
    const { courses } = makeServices();
    const result = courses.getCourses();
    expect(result.length).toBeGreaterThanOrEqual(10);
    expect(result.map((c) => c.id)).toContain("photoshop");
    expect(result.every((c) => c.emblem)).toBe(true);
  });
});

describe("ScheduleService", () => {
  it("getSchedule() resolves shifts and local date key", () => {
    const { schedule } = makeServices();
    const result = schedule.getSchedule();
    expect(result.shifts.map((s) => s.start)).toEqual(["09:00", "12:00", "15:00"]);
    expect(/^\d{4}-\d{2}-\d{2}$/.test(result.date)).toBe(true);
    expect(result.hoursLabel).toBe("9:00 AM — 6:00 PM");
  });

  it("toLocalDateKey uses calendar (local) components", () => {
    const d = new Date(2026, 8, 24, 10, 30, 0);
    expect(toLocalDateKey(d)).toBe("2026-09-24");
  });

  it("getActive() evaluates boundary examples correctly", () => {
    const { schedule } = makeServices();
    const at = (h: number, m: number, s = 0) =>
      new Date(2026, 8, 24, h, m, s, 0).toISOString();

    expect(schedule.getActive(at(10, 30)).activeShift?.id).toBe("shift-1");
    expect(schedule.getActive(at(10, 30)).remainingSec).toBe(90 * 60);
    expect(schedule.getActive(at(12, 0)).activeShift?.id).toBe("shift-2");
    expect(schedule.getActive(at(15, 0)).activeShift?.id).toBe("shift-3");
    expect(schedule.getActive(at(18, 0)).state).toBe("ended");
    expect(schedule.getActive(at(8, 59, 59)).state).toBe("pre-open");
  });

  it("getActive() without an argument evaluates server 'now'", () => {
    const { schedule } = makeServices();
    const result = schedule.getActive();
    expect(["pre-open", "active", "ended", "between"]).toContain(result.state);
    expect(result.now instanceof Date || typeof result.now === "string").toBe(true);
  });
});