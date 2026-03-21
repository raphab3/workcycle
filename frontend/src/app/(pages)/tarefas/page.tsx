import { TasksWorkspace } from '@/modules/tasks/components/TasksWorkspace/index';

import { pageStyles } from './styles';

export default function TarefasRoutePage() {
  return (
    <main className={pageStyles.container}>
      <TasksWorkspace />
    </main>
  );
}