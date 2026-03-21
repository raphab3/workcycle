import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/Card';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { cn } from '@/shared/utils/cn';

import { projectsPortfolioPreviewStyles } from './styles';

const projects = [
  { name: 'ClienteCore', allocation: '25%', type: 'Fixo', typeClass: projectsPortfolioPreviewStyles.badgeFixed, sprint: '14 dias', note: '2h reservadas de segunda a sexta' },
  { name: 'FinTrack', allocation: '20%', type: 'Rotativo', typeClass: projectsPortfolioPreviewStyles.badgeRotative, sprint: '7 dias', note: 'entra por deficit e carga da sprint' },
  { name: 'DataVault', allocation: '10%', type: 'Rotativo', typeClass: projectsPortfolioPreviewStyles.badgeRotative, sprint: '7 dias', note: 'task critica pressiona a distribuicao diaria' },
  { name: 'AuthGuard', allocation: '6%', type: 'Rotativo', typeClass: projectsPortfolioPreviewStyles.badgeRotative, sprint: '30 dias', note: 'menor fatia, mas precisa cobertura semanal' },
];

export function ProjectsPortfolioPreview() {
  return (
    <div className={projectsPortfolioPreviewStyles.layout}>
      <SectionIntro
        eyebrow="Projetos"
        title="Portifolio com alocacao, tipo de contrato e horizonte de sprint"
        description="A tela de projetos vai concentrar a gestao das frentes de trabalho: percentual de alocacao, tipo fixo ou rotativo, sprint e estado ativo ou pausado."
      />

      <div className={projectsPortfolioPreviewStyles.grid}>
        {projects.map((project) => (
          <Card key={project.name}>
            <CardHeader>
              <CardDescription>{project.allocation} da semana</CardDescription>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className={cn(projectsPortfolioPreviewStyles.badge, project.typeClass)}>{project.type}</span>
              <p className={projectsPortfolioPreviewStyles.projectMeta}>{project.note}</p>
              <div className={projectsPortfolioPreviewStyles.footer}>
                <span>Sprint {project.sprint}</span>
                <span>Ativo</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}