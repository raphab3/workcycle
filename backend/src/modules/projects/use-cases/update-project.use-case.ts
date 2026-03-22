import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ProjectsRepository } from '@/modules/projects/repositories/projects.repository';

import type { UpdateProjectInput } from '@/modules/projects/projects.schemas';
import type { ProjectUpdateData } from '@/modules/projects/repositories/projects.repository';

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    @Inject(ProjectsRepository)
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async execute(id: string, userId: string, input: UpdateProjectInput) {
    const existing = await this.projectsRepository.findById(id, userId);

    if (!existing) {
      throw new NotFoundException('Project not found.');
    }

    const sanitizedInput = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ) as ProjectUpdateData;

    return this.projectsRepository.update(id, userId, sanitizedInput);
  }
}
