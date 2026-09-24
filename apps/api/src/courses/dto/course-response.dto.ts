import type { Course } from "@academy/shared";

/** Response shape for GET /api/courses. */
export class CourseResponseDto implements Course {
  id!: string;
  name!: string;
  category!: string;
  emblem!: string;
  tools!: string[];
}