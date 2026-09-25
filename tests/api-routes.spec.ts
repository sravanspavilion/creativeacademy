import { describe, it, expect } from "vitest";
import { GET as getHealth } from "../src/app/api/health/route";
import { GET as getAcademy } from "../src/app/api/academy/route";
import { GET as getSchedules } from "../src/app/api/schedules/route";
import { GET as getActive } from "../src/app/api/schedules/active/route";
import { GET as getCourses } from "../src/app/api/courses/route";

const json = async <R = unknown>(res: Response): Promise<R> => res.json() as Promise<R>;

describe("GET /api/health", () => {
  it("reports ok with timestamp and uptime", async () => {
    const res = await getHealth();
    expect(res.status).toBe(200);
    const body = await json<Record<string, unknown>>(res);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("creative-academy-api");
    expect(typeof body.timestamp).toBe("string");
    expect(typeof body.uptimeSec).toBe("number");
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });
});

describe("GET /api/academy", () => {
  it("returns branding + a full 3-shift schedule", async () => {
    const res = await getAcademy();
    expect(res.status).toBe(200);
    const body = await json<{ name: string; tagline: string; schedule: unknown[] }>(res);
    expect(body.name).toBe("CREATIVE AI ACADEMY");
    expect(body.tagline).toContain("EDITING");
    expect(body.schedule.filter((s) => (s as { enabled?: boolean }).enabled)).toHaveLength(3);
  });
});

describe("GET /api/schedules", () => {
  it("returns today's enabled shifts", async () => {
    const res = await getSchedules();
    expect(res.status).toBe(200);
    const body = await json<{ date: string; hoursLabel: string; shifts: Array<{ start: string }> }>(res);
    expect(body.hoursLabel).toBe("9:00 AM — 6:00 PM");
    expect(body.shifts.map((s) => s.start)).toEqual(["09:00", "12:00", "15:00"]);
    expect(/^\d{4}-\d{2}-\d{2}$/.test(body.date)).toBe(true);
  });
});

describe("GET /api/schedules/active", () => {
  const url = (at?: string) =>
    `http://localhost:3000/api/schedules/active${at ? `?at=${encodeURIComponent(at)}` : ""}`;

  it("evaluates a valid ISO-8601 'at' (10:30 local → Morning Shift)", async () => {
    const at = new Date(2026, 8, 24, 10, 30, 0).toISOString();
    const res = await getActive(new Request(url(at)));
    expect(res.status).toBe(200);
    const body = await json<{ state: string; activeShift: { id: string } | null; remainingSec: number }>(res);
    expect(body.state).toBe("active");
    expect(body.activeShift?.id).toBe("shift-1");
    expect(body.remainingSec).toBe(90 * 60);
  });

  it("returns 400 for a non-ISO 'at' value", async () => {
    const res = await getActive(new Request(url("not-a-date")));
    expect(res.status).toBe(400);
    const body = await json<{ message: string[]; error: string; statusCode: number }>(res);
    expect(body.message).toContain("at must be an ISO-8601 timestamp");
    expect(body.error).toBe("Bad Request");
    expect(body.statusCode).toBe(400);
  });

  it("returns 400 for a malformed ISO 'at' value (missing timezone)", async () => {
    const res = await getActive(new Request(url("2026-09-24T10:30:00")));
    expect(res.status).toBe(400);
    const body = await json<{ message: string[] }>(res);
    expect(body.message).toContain("at must be an ISO-8601 timestamp");
  });
});

describe("GET /api/courses", () => {
  it("returns the course catalogue", async () => {
    const res = await getCourses();
    expect(res.status).toBe(200);
    const body = await json<Array<{ id: string; emblem: string }>>(res);
    expect(body.length).toBeGreaterThanOrEqual(10);
    expect(body.map((c) => c.id)).toContain("photoshop");
    expect(body.every((c) => c.emblem)).toBe(true);
  });
});