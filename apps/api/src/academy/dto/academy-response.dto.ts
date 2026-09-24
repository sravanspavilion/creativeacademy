import type { AcademyInfo, Shift } from "@academy/shared";

/** Response shape for GET /api/academy. Mirrors the shared AcademyInfo. */
export class AcademyResponseDto implements AcademyInfo {
  id!: string;
  name!: string;
  tagline!: string;
  hoursLabel!: string;
  schedule!: Shift[];
}