import { Inject, Injectable } from '@nestjs/common';

import { ProjectsRepository } from '@/modules/projects/repositories/projects.repository';

@Injectable()
export class ListProjectsUseCase {
  constructor(
    @Inject(ProjectsRepository)
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async execute(userId: string) {
    return this.projectsRepository.listByUserId(userId);
  }
}
