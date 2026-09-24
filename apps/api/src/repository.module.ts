import { Global, Module } from "@nestjs/common";
import { InMemoryAcademyRepository, ACADEMY_REPOSITORY } from "./data/in-memory-repository";

/**
 * Global data-access module. Swap `InMemoryAcademyRepository` for a
 * Prisma-backed implementation later — controllers and services stay
 * unchanged because they only depend on the repository interface.
 */
@Global()
@Module({
  providers: [{ provide: ACADEMY_REPOSITORY, useClass: InMemoryAcademyRepository }],
  exports: [ACADEMY_REPOSITORY],
})
export class RepositoryModule {}