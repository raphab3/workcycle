import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

import { CreateProjectUseCase } from '@/modules/projects/use-cases/create-project.use-case';
import { ToggleProjectStatusUseCase } from '@/modules/projects/use-cases/toggle-project-status.use-case';
import { UpdateProjectUseCase } from '@/modules/projects/use-cases/update-project.use-case';
import { toProjectResponse } from '@/modules/projects/types/project';

import type { CreateProjectInput, UpdateProjectInput } from '@/modules/projects/projects.schemas';
import type { Project } from '@/shared/database/schema';

function ensureProjectPersisted(project: Project | undefined, action: 'create' | 'update' | 'toggle') {
  if (!project) {
    throw new InternalServerErrorException(`Project ${action} did not return a persisted entity.`);
  }

  return project;
}

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
    const project = ensureProjectPersisted(await this.createProjectUseCase.execute(userId, input), 'create');

    return toProjectResponse(project);
  }

  async updateProject(id: string, userId: string, input: UpdateProjectInput) {
    const project = ensureProjectPersisted(await this.updateProjectUseCase.execute(id, userId, input), 'update');

    return toProjectResponse(project);
  }

  async toggleStatus(id: string, userId: string, status: Project['status']) {
    const project = ensureProjectPersisted(await this.toggleProjectStatusUseCase.execute(id, userId, status), 'toggle');

    return toProjectResponse(project);
  }
}
