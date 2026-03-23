import { Module } from '@nestjs/common';

import { TasksController } from '@/modules/tasks/controllers/tasks.controller';
import { TasksRepository } from '@/modules/tasks/repositories/tasks.repository';
import { TasksFinderService } from '@/modules/tasks/services/tasks-finder.service';
import { TasksWriterService } from '@/modules/tasks/services/tasks-writer.service';
import { ArchiveTaskUseCase } from '@/modules/tasks/use-cases/archive-task.use-case';
import { CreateTaskUseCase } from '@/modules/tasks/use-cases/create-task.use-case';
import { ListTasksUseCase } from '@/modules/tasks/use-cases/list-tasks.use-case';
import { UpdateTaskStatusUseCase } from '@/modules/tasks/use-cases/update-task-status.use-case';
import { UpdateTaskUseCase } from '@/modules/tasks/use-cases/update-task.use-case';
import { ValidateTaskWriteContextUseCase } from '@/modules/tasks/use-cases/validate-task-write-context.use-case';
import { AuthGuard } from '@/shared/guards/auth.guard';

@Module({
  controllers: [TasksController],
  providers: [
    AuthGuard,
    TasksRepository,
    ValidateTaskWriteContextUseCase,
    ListTasksUseCase,
    CreateTaskUseCase,
    UpdateTaskUseCase,
    UpdateTaskStatusUseCase,
    ArchiveTaskUseCase,
    TasksFinderService,
    TasksWriterService,
  ],
  exports: [TasksRepository, TasksFinderService, TasksWriterService],
})
export class TasksModule {}