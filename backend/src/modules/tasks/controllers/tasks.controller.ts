import { Body, Controller, Get, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { archiveTaskSchema, createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from '@/modules/tasks/tasks.schemas';
import { TasksFinderService } from '@/modules/tasks/services/tasks-finder.service';
import { TasksWriterService } from '@/modules/tasks/services/tasks-writer.service';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { AuthGuard } from '@/shared/guards/auth.guard';

import type { AuthTokenPayload } from '@/modules/auth/types/auth';

@Controller('tasks')
export class TasksController {
  constructor(
    @Inject(TasksFinderService)
    private readonly finderService: TasksFinderService,
    @Inject(TasksWriterService)
    private readonly writerService: TasksWriterService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async list(@CurrentUser() user: AuthTokenPayload) {
    return this.finderService.listTasks(user.sub);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@CurrentUser() user: AuthTokenPayload, @Body() body: unknown) {
    const input = createTaskSchema.parse(body);

    return this.writerService.createTask(user.sub, input);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @CurrentUser() user: AuthTokenPayload, @Body() body: unknown) {
    const input = updateTaskSchema.parse(body);

    return this.writerService.updateTask(id, user.sub, input);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @CurrentUser() user: AuthTokenPayload, @Body() body: unknown) {
    const input = updateTaskStatusSchema.parse(body);

    return this.writerService.updateTaskStatus(id, user.sub, input);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/archive')
  async archive(@Param('id') id: string, @CurrentUser() user: AuthTokenPayload, @Body() body: unknown) {
    archiveTaskSchema.parse(body ?? {});

    return this.writerService.archiveTask(id, user.sub);
  }
}