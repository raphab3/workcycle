import { Inject, Injectable } from '@nestjs/common';

import { CreateProjectUseCase } from '@/modules/projects/use-cases/create-project.use-case';
import { ToggleProjectStatusUseCase } from '@/modules/projects/use-cases/toggle-project-status.use-case';
import { UpdateProjectUseCase } from '@/modules/projects/use-cases/update-project.use-case';

import type { CreateProjectInput, UpdateProjectInput } from '@/modules/projects/projects.schemas';
import type { Project } from '@/shared/database/schema';

@Injectable()
export class ProjectsWriterService {
  constructor(
    @Inject(CreateProjectUseCase)
    private readonly createProjectUseCase: CreateProjectUseCase,
    @Inject(UpdateProjectUseCase)
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    @Inject(ToggleProjectStatusUseCase)
    private readonly toggleProjectStatusUseCase: ToggleProjectStatusUseCase,
  ) {}

  async createProject(userId: string, input: CreateProjectInput) {
    return this.createProjectUseCase.execute(userId, input);
  }

  async updateProject(id: string, userId: string, input: UpdateProjectInput) {
    return this.updateProjectUseCase.execute(id, userId, input);
  }

  async toggleStatus(id: string, userId: string, status: Project['status']) {
    return this.toggleProjectStatusUseCase.execute(id, userId, status);
  }
}
