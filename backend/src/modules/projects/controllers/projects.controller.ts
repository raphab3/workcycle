import { Body, Controller, Get, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { createProjectSchema, toggleProjectStatusSchema, updateProjectSchema } from '@/modules/projects/projects.schemas';
import { ProjectsFinderService } from '@/modules/projects/services/projects-finder.service';
import { ProjectsWriterService } from '@/modules/projects/services/projects-writer.service';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { AuthGuard } from '@/shared/guards/auth.guard';

import type { AuthTokenPayload } from '@/modules/auth/types/auth';

@Controller('projects')
export class ProjectsController {
  constructor(
    @Inject(ProjectsFinderService)
    private readonly finderService: ProjectsFinderService,
    @Inject(ProjectsWriterService)
    private readonly writerService: ProjectsWriterService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async list(@CurrentUser() user: AuthTokenPayload) {
    return this.finderService.listProjects(user.sub);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@CurrentUser() user: AuthTokenPayload, @Body() body: unknown) {
    const input = createProjectSchema.parse(body);

    return this.writerService.createProject(user.sub, input);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @CurrentUser() user: AuthTokenPayload, @Body() body: unknown) {
    const input = updateProjectSchema.parse(body);

    return this.writerService.updateProject(id, user.sub, input);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/status')
  async toggleStatus(@Param('id') id: string, @CurrentUser() user: AuthTokenPayload, @Body() body: unknown) {
    const input = toggleProjectStatusSchema.parse(body);

    return this.writerService.toggleStatus(id, user.sub, input.status);
  }
}
