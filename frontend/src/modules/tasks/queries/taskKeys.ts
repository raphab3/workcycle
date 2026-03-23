export const taskKeys = {
  all: ['tasks'] as const,
  list: () => [...taskKeys.all, 'list'] as const,
  detail: (taskId: string) => [...taskKeys.all, 'detail', taskId] as const,
};