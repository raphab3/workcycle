import { TasksBoardPreview } from '@/modules/tasks/components/TasksBoardPreview';

import { pageStyles } from './styles';

export default function TarefasRoutePage() {
  return (
    <main className={pageStyles.container}>
      <TasksBoardPreview />
    </main>
  );
}