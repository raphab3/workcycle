import { api } from '@/lib/axios';
import { getLocalISODate } from '@/modules/today/utils/boundary';

import type { PersistedTaskValues, Task, TaskChecklistItem, TaskRecordDTO, TaskStatus } from '@/modules/tasks/types';

export interface UpdateTaskInput {
  taskId: string;
  values: PersistedTaskValues;
}

export interface UpdateTaskStatusInput {
  columnId?: string;
  cycleAssignment?: Task['cycleAssignment'];
  cycleSessionId?: string | null;
  status?: TaskStatus;
  taskId: string;
}

export interface ArchiveTaskInput {
  taskId: string;
}

interface TaskWritePayload {
  checklist: Array<Pick<TaskChecklistItem, 'done' | 'label'>>;
  columnId: string;
  cycleAssignment: Task['cycleAssignment'];
  cycleSessionId: string | null;
  description: string;
  dueDate: string | null;
  estimatedHours: number;
  priority: Task['priority'];
  projectId: string;
  status: TaskStatus;
  title: string;
}

function parseIsoDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);

  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

function getDueDateFromDays(dueInDays: number) {
  const dueDate = new Date();

  dueDate.setHours(0, 0, 0, 0);
  dueDate.setDate(dueDate.getDate() + dueInDays);

  return getLocalISODate(dueDate);
}

function getDueInDaysFromDate(dueDate: string | null) {
  if (!dueDate) {
    return 0;
  }

  const today = parseIsoDate(getLocalISODate(new Date()));
  const taskDueDate = parseIsoDate(dueDate);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.round((taskDueDate.getTime() - today.getTime()) / millisecondsPerDay);
}

function normalizeChecklist(checklist: TaskRecordDTO['checklist']): TaskChecklistItem[] {
  return checklist.map((item) => ({
    done: item.done,
    id: item.id,
    label: item.label,
  }));
}

export function toTaskRecord(values: PersistedTaskValues): TaskWritePayload {
  return {
    checklist: values.checklist.map((item) => ({
      done: item.done,
      label: item.label,
    })),
    columnId: values.columnId,
    cycleAssignment: values.cycleAssignment,
    cycleSessionId: values.cycleAssignment === 'current' ? values.cycleSessionId ?? null : null,
    description: values.description,
    dueDate: getDueDateFromDays(values.dueInDays),
    estimatedHours: values.estimatedHours,
    priority: values.priority,
    projectId: values.projectId,
    status: values.status,
    title: values.title,
  };
}

export function toTaskModel(task: TaskRecordDTO): Task {
  return {
    checklist: normalizeChecklist(task.checklist),
    columnId: task.columnId,
    cycleAssignment: task.cycleAssignment,
    cycleSessionId: task.cycleSessionId,
    description: task.description ?? '',
    dueDate: task.dueDate,
    dueInDays: getDueInDaysFromDate(task.dueDate),
    estimatedHours: task.estimatedHours,
    id: task.id,
    isArchived: task.isArchived,
    priority: task.priority,
    projectId: task.projectId,
    status: task.status,
    title: task.title,
  };
}

async function getTasks() {
  const response = await api.get<TaskRecordDTO[]>('/api/tasks');

  return response.data.map(toTaskModel);
}

async function createTask(values: PersistedTaskValues) {
  const response = await api.post<TaskRecordDTO>('/api/tasks', toTaskRecord(values));

  return toTaskModel(response.data);
}

async function updateTask({ taskId, values }: UpdateTaskInput) {
  const response = await api.patch<TaskRecordDTO>(`/api/tasks/${taskId}`, toTaskRecord(values));

  return toTaskModel(response.data);
}

async function updateTaskStatus({ taskId, ...values }: UpdateTaskStatusInput) {
  const response = await api.patch<TaskRecordDTO>(`/api/tasks/${taskId}/status`, values);

  return toTaskModel(response.data);
}

async function archiveTask({ taskId }: ArchiveTaskInput) {
  const response = await api.patch<TaskRecordDTO>(`/api/tasks/${taskId}/archive`, {});

  return toTaskModel(response.data);
}

export const tasksService = {
  archiveTask,
  createTask,
  getTasks,
  updateTask,
  updateTaskStatus,
};