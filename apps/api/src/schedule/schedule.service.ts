import { Inject, Injectable } from "@nestjs/common";
import { evaluateSchedule } from "@academy/shared";
import type { AcademyInfo, ScheduleEvaluation, Shift } from "@academy/shared";
import { ACADEMY_REPOSITORY } from "../data/in-memory-repository";
import type { AcademyRepository } from "../data/in-memory-repository";
import type { ScheduleResponseDto } from "./dto/schedule-response.dto";

const pad = (n: number): string => String(n).padStart(2, "0");

/** Format a Date as an academy-local "YYYY-MM-DD" string. */
export function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

@Injectable()
export class ScheduleService {
  constructor(
    @Inject(ACADEMY_REPOSITORY) private readonly repository: AcademyRepository,
  ) {}

  /** Full daily schedule for the display (no time evaluation). */
  getSchedule(): ScheduleResponseDto {
    const academy = this.repository.getAcademy();
    return {
      date: toLocalDateKey(new Date()),
      hoursLabel: academy.hoursLabel,
      shifts: academy.schedule.filter((shift): shift is Shift => shift.enabled),
    };
  }

  /**
   * Evaluate the schedule at a given instant (defaults to server "now").
   * Reuses the shared pure evaluator so the web dashboard and the API
   * can never disagree about boundary semantics.
   */
  getActive(at?: string): ScheduleEvaluation {
    const academy = this.repository.getAcademy() as AcademyInfo;
    const now = at ? new Date(at) : new Date();
    return evaluateSchedule(now, academy);
  }
}