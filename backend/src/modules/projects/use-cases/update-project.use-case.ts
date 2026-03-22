import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ProjectsRepository } from '@/modules/projects/repositories/projects.repository';

import type { UpdateProjectInput } from '@/modules/projects/projects.schemas';

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

    return this.projectsRepository.update(id, userId, input);
  }
}
