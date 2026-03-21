import type { HomeFeature } from '@/modules/home/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/Card';

import { featureGridStyles } from './styles';

const features: HomeFeature[] = [
  {
    eyebrow: 'Arquitetura',
    title: 'Pages orquestram, modules executam',
    description: 'As rotas ficam leves e a logica de dominio cresce em modulos independentes e testaveis.',
  },
  {
    eyebrow: 'UI Stack',
    title: 'Tailwind + primitives reutilizaveis',
    description: 'A base favorece componentes compartilhados e evita repetir classes grandes dentro de paginas.',
  },
  {
    eyebrow: 'Dados',
    title: 'Fluxo pronto para service + query',
    description: 'Axios, QueryClient e providers ja estao posicionados para conectar API sem refazer fundacoes.',
  },
  {
    eyebrow: 'Estado',
    title: 'Escolhas claras para cada tipo de estado',
    description: 'React Query para servidor, Zustand para logica global, Jotai para UI atomica e estado local quando suficiente.',
  },
];

export function FeatureGrid() {
  return (
    <section className={featureGridStyles.section}>
      <div className={featureGridStyles.intro}>
        <p className={featureGridStyles.eyebrow}>Scaffold orientado por skills</p>
        <h2 className={featureGridStyles.title}>A estrutura inicial ja foi desenhada para crescimento incremental.</h2>
        <p className={featureGridStyles.description}>
          A partir daqui, novas features podem entrar como modulos independentes, sem transformar a pagina inicial em um ponto de acoplamento.
        </p>
      </div>

      <div className={featureGridStyles.grid}>
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardDescription>{feature.eyebrow}</CardDescription>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}