import { AgendaWorkspace } from '@/modules/agenda/components/AgendaWorkspace/index';

import { pageStyles } from './styles';

export default function AgendaRoutePage() {
  return (
    <main className={pageStyles.container}>
      <AgendaWorkspace />
    </main>
  );
}