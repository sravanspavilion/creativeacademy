import { IsISO8601, IsOptional } from "class-validator";

/**
 * Query for GET /api/schedules/active.
 * `at` is an optional ISO-8601 timestamp; defaults to "now" when omitted.
 */
export class ActiveScheduleQueryDto {
  @IsOptional()
  @IsISO8601({ strict: true }, { message: "at must be an ISO-8601 timestamp" })
  at?: string;
}