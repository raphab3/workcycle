import { Inject, Injectable } from '@nestjs/common';

import { ProjectsRepository } from '@/modules/projects/repositories/projects.repository';

import type { CreateProjectInput } from '@/modules/projects/projects.schemas';

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(ProjectsRepository)
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async execute(userId: string, input: CreateProjectInput) {
    return this.projectsRepository.create({ ...input, userId });
  }
}
