import { WeeklyBalanceWorkspace } from '@/modules/weekly/components/WeeklyBalanceWorkspace/index';

import { pageStyles } from './styles';

export default function SemanaRoutePage() {
  return (
    <main className={pageStyles.container}>
      <WeeklyBalanceWorkspace />
    </main>
  );
}