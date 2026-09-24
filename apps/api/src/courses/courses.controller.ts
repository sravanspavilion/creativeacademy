import { Controller, Get } from "@nestjs/common";
import { CoursesService } from "./courses.service";
import type { CourseResponseDto } from "./dto/course-response.dto";

@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  getCourses(): CourseResponseDto[] {
    return this.coursesService.getCourses();
  }
}