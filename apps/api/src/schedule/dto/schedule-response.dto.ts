import type { Shift } from "@academy/shared";

/** Response shape for GET /api/schedules. */
export class ScheduleResponseDto {
  /** Academy-local calendar date (YYYY-MM-DD) of the returned shifts. */
  date!: string;
  hoursLabel!: string;
  shifts!: Shift[];
}