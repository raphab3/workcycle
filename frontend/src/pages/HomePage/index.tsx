import { FeatureGrid, HeroSection } from '@/modules/home';

import { pageStyles } from './styles';

export function HomePage() {
  return (
    <main className={pageStyles.container}>
      <HeroSection />
      <FeatureGrid />
    </main>
  );
}