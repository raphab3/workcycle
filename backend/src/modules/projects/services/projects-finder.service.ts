import { Inject, Injectable } from '@nestjs/common';

import { ListProjectsUseCase } from '@/modules/projects/use-cases/list-projects.use-case';

@Injectable()
export class ProjectsFinderService {
  constructor(
    @Inject(ListProjectsUseCase)
    private readonly listProjectsUseCase: ListProjectsUseCase,
  ) {}

  async listProjects(userId: string) {
    return this.listProjectsUseCase.execute(userId);
  }
}
