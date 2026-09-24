import { Controller, Get } from "@nestjs/common";
import { AcademyService } from "./academy.service";
import type { AcademyResponseDto } from "./dto/academy-response.dto";

@Controller("academy")
export class AcademyController {
  constructor(private readonly academyService: AcademyService) {}

  /** Academy branding + the full daily schedule for the live display. */
  @Get()
  getAcademy(): AcademyResponseDto {
    return this.academyService.getAcademy();
  }
}