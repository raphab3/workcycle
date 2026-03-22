import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ProjectsRepository } from '@/modules/projects/repositories/projects.repository';

import type { Project } from '@/shared/database/schema';

@Injectable()
export class ToggleProjectStatusUseCase {
  constructor(
    @Inject(ProjectsRepository)
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async execute(id: string, userId: string, status: Project['status']) {
    const existing = await this.projectsRepository.findById(id, userId);

    if (!existing) {
      throw new NotFoundException('Project not found.');
    }

    return this.projectsRepository.update(id, userId, { status });
  }
}
