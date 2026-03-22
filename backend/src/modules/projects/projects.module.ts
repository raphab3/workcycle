import { Module } from '@nestjs/common';

import { ProjectsController } from '@/modules/projects/controllers/projects.controller';
import { ProjectsRepository } from '@/modules/projects/repositories/projects.repository';
import { ProjectsFinderService } from '@/modules/projects/services/projects-finder.service';
import { ProjectsWriterService } from '@/modules/projects/services/projects-writer.service';
import { CreateProjectUseCase } from '@/modules/projects/use-cases/create-project.use-case';
import { ListProjectsUseCase } from '@/modules/projects/use-cases/list-projects.use-case';
import { ToggleProjectStatusUseCase } from '@/modules/projects/use-cases/toggle-project-status.use-case';
import { UpdateProjectUseCase } from '@/modules/projects/use-cases/update-project.use-case';
import { AuthGuard } from '@/shared/guards/auth.guard';

@Module({
  controllers: [ProjectsController],
  providers: [
    AuthGuard,
    ProjectsRepository,
    ListProjectsUseCase,
    CreateProjectUseCase,
    UpdateProjectUseCase,
    ToggleProjectStatusUseCase,
    ProjectsFinderService,
    ProjectsWriterService,
  ],
  exports: [ProjectsFinderService, ProjectsWriterService],
})
export class ProjectsModule {}
