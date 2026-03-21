import { Button } from '@/shared/components/Button';

import { heroStyles } from './styles';

const metrics = [
  { value: '2 apps', label: 'frontend e backend isolados desde o inicio' },
  { value: '4 camadas', label: 'pages, modules, shared e providers prontos' },
];

export function HeroSection() {
  return (
    <section className={heroStyles.section}>
      <div className={heroStyles.glow} aria-hidden="true" />
      <div className={heroStyles.content}>
        <div className={heroStyles.copy}>
          <span className={heroStyles.badge}>Kickoff do projeto</span>
          <h1 className={heroStyles.title}>Base React + TypeScript pronta para evoluir sem acoplar tudo na primeira sprint.</h1>
          <p className={heroStyles.description}>
            O frontend foi iniciado com Vite, Tailwind CSS, primitives no estilo shadcn/ui com Radix, React Query, Axios,
            React Hook Form, Zod, Zustand e Jotai. A estrutura segue a separacao entre paginas, modulos e codigo compartilhado.
          </p>
          <div className={heroStyles.actions}>
            <Button>Comecar feature</Button>
            <Button variant="outline">Definir dominio inicial</Button>
          </div>
        </div>

        <aside className={heroStyles.panel}>
          <span className={heroStyles.panelTitle}>Highlights da base</span>
          <div className={heroStyles.metrics}>
            {metrics.map((metric) => (
              <div key={metric.label} className={heroStyles.metricCard}>
                <p className={heroStyles.metricValue}>{metric.value}</p>
                <p className={heroStyles.metricLabel}>{metric.label}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}