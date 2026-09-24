import { Inject, Injectable } from "@nestjs/common";
import type { Course } from "@academy/shared";
import { ACADEMY_REPOSITORY } from "../data/in-memory-repository";
import type { AcademyRepository } from "../data/in-memory-repository";
import type { CourseResponseDto } from "./dto/course-response.dto";

@Injectable()
export class CoursesService {
  constructor(
    @Inject(ACADEMY_REPOSITORY) private readonly repository: AcademyRepository,
  ) {}

  /** All courses offered by the academy. */
  getCourses(): CourseResponseDto[] {
    return this.repository.getCourses() as Course[];
  }
}