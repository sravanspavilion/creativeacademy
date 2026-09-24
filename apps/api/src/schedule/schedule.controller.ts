import { Controller, Get, Query } from "@nestjs/common";
import type { ScheduleEvaluation } from "@academy/shared";
import { ScheduleService } from "./schedule.service";
import type { ScheduleResponseDto } from "./dto/schedule-response.dto";
import { ActiveScheduleQueryDto } from "./dto/active-schedule-query.dto";

@Controller("schedules")
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  /** Full schedule for the current local day. */
  @Get()
  getSchedule(): ScheduleResponseDto {
    return this.scheduleService.getSchedule();
  }

  /**
   * Live evaluation of the shift at the given instant (device/server local
   * time). Omit `at` to evaluate "now".
   */
  @Get("active")
  getActive(@Query() query: ActiveScheduleQueryDto): ScheduleEvaluation {
    return this.scheduleService.getActive(query.at);
  }
}