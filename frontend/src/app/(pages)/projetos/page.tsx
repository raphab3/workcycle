import { ProjectsPortfolioPreview } from '@/modules/projects/components/ProjectsPortfolioPreview';

import { pageStyles } from './styles';

export default function ProjetosRoutePage() {
  return (
    <main className={pageStyles.container}>
      <ProjectsPortfolioPreview />
    </main>
  );
}