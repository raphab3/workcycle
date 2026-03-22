import { Inject, Injectable } from '@nestjs/common';

import { ListProjectsUseCase } from '@/modules/projects/use-cases/list-projects.use-case';
import { toProjectResponse } from '@/modules/projects/types/project';

@Injectable()
export class ProjectsFinderService {
  constructor(
    @Inject(ListProjectsUseCase)
    private readonly listProjectsUseCase: ListProjectsUseCase,
  ) {}

  async listProjects(userId: string) {
    const projects = await this.listProjectsUseCase.execute(userId);

    return projects.map(toProjectResponse);
  }
}
