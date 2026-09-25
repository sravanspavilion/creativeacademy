import { evaluateSchedule } from "@academy/shared";
import type { AcademyInfo, Course, ScheduleEvaluation, Shift } from "@academy/shared";
import type { AcademyRepository } from "./repository";
import { InMemoryAcademyRepository } from "./repository";

const pad = (n: number): string => String(n).padStart(2, "0");

/** Format a Date as an academy-local "YYYY-MM-DD" string. */
export function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Response shape for GET /api/schedules. */
export interface ScheduleResponse {
  /** Academy-local calendar date (YYYY-MM-DD) of the returned shifts. */
  date: string;
  hoursLabel: string;
  shifts: Shift[];
}

/** Academy branding + the full daily schedule for the live display. */
export class AcademyService {
  constructor(private readonly repository: AcademyRepository = new InMemoryAcademyRepository()) {}

  getAcademy(): AcademyInfo {
    return this.repository.getAcademy();
  }
}

/** All courses offered by the academy. */
export class CoursesService {
  constructor(private readonly repository: AcademyRepository = new InMemoryAcademyRepository()) {}

  getCourses(): Course[] {
    return this.repository.getCourses();
  }
}

/** Full daily schedule + instant evaluation, sharing the pure evaluator. */
export class ScheduleService {
  constructor(private readonly repository: AcademyRepository = new InMemoryAcademyRepository()) {}

  /** Full daily schedule for the display (no time evaluation). */
  getSchedule(): ScheduleResponse {
    const academy = this.repository.getAcademy();
    return {
      date: toLocalDateKey(new Date()),
      hoursLabel: academy.hoursLabel,
      shifts: academy.schedule.filter((shift): shift is Shift => shift.enabled),
    };
  }

  /**
   * Evaluate the schedule at a given instant (defaults to server "now").
   * Reuses the shared pure evaluator so the dashboard and the API can
   * never disagree about boundary semantics.
   */
  getActive(at?: string): ScheduleEvaluation {
    const academy = this.repository.getAcademy() as AcademyInfo;
    const now = at ? new Date(at) : new Date();
    return evaluateSchedule(now, academy);
  }
}