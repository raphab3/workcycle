import { WeeklyBalancePreview } from '@/modules/weekly/components/WeeklyBalancePreview';

import { pageStyles } from './styles';

export default function SemanaRoutePage() {
  return (
    <main className={pageStyles.container}>
      <WeeklyBalancePreview />
    </main>
  );
}