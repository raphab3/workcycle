import { FeatureGrid, HeroSection } from '@/modules/home';
import { pageStyles } from './styles';

export default function HojeRoutePage() {
  return (
    <main className={pageStyles.container}>
      <HeroSection />
      <FeatureGrid />
    </main>
  );
}