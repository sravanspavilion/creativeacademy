import { Module } from "@nestjs/common";
import { RepositoryModule } from "./repository.module";
import { AcademyModule } from "./academy/academy.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { CoursesModule } from "./courses/courses.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [RepositoryModule, HealthModule, AcademyModule, ScheduleModule, CoursesModule],
})
export class AppModule {}