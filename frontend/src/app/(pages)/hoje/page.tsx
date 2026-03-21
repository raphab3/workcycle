import { TodayPlannerOverview } from '@/modules/today/components/TodayPlannerOverview';
import { pageStyles } from './styles';

export default function HojeRoutePage() {
  return (
    <main className={pageStyles.container}>
      <TodayPlannerOverview />
    </main>
  );
}