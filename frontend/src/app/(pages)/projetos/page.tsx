import { ProjectsWorkspace } from '@/modules/projects/components/ProjectsWorkspace/index';

import { pageStyles } from './styles';

export default function ProjetosRoutePage() {
  return (
    <main className={pageStyles.container}>
      <ProjectsWorkspace />
    </main>
  );
}