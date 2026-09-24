import { mockAcademy, mockCourses } from "@academy/shared";
import type { AcademyInfo, Course, Shift } from "@academy/shared";

/**
 * In-memory repository backed by the shared mock data.
 *
 * This is the swap point for real persistence: implement the same methods
 * with Prisma/PostgreSQL (or any other store) and register that provider
 * instead. No controller or service changes are required.
 */
export interface AcademyRepository {
  getAcademy(): AcademyInfo;
  getShifts(): Shift[];
  getCourses(): Course[];
}

export class InMemoryAcademyRepository implements AcademyRepository {
  getAcademy(): AcademyInfo {
    return mockAcademy;
  }

  getShifts(): Shift[] {
    return mockAcademy.schedule;
  }

  getCourses(): Course[] {
    return mockCourses;
  }
}

export const ACADEMY_REPOSITORY = Symbol("ACADEMY_REPOSITORY");