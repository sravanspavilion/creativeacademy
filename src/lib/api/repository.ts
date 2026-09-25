import { mockAcademy, mockCourses } from "@academy/shared";
import type { AcademyInfo, Course, Shift } from "@academy/shared";

/**
 * In-memory repository backed by the shared mock data.
 *
 * This is the swap point for real persistence: implement the same methods
 * with Prisma/PostgreSQL (or any other store) and feed that instance to the
 * services instead — route handlers stay unchanged.
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