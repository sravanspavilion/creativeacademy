import { Inject, Injectable } from "@nestjs/common";
import type { AcademyInfo } from "@academy/shared";
import { ACADEMY_REPOSITORY } from "../data/in-memory-repository";
import type { AcademyRepository } from "../data/in-memory-repository";
import type { AcademyResponseDto } from "./dto/academy-response.dto";

@Injectable()
export class AcademyService {
  constructor(
    @Inject(ACADEMY_REPOSITORY) private readonly repository: AcademyRepository,
  ) {}

  getAcademy(): AcademyResponseDto {
    return this.repository.getAcademy() as AcademyInfo;
  }
}