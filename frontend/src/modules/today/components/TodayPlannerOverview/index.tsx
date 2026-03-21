import { CalendarClock, Gauge, Sigma } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionIntro } from '@/shared/components/SectionIntro';

import { todayPlannerOverviewStyles } from './styles';

const summary = [
  { label: 'Horas disponiveis', value: '10h', icon: CalendarClock },
  { label: 'Projetos no ciclo', value: '4', icon: Sigma },
  { label: 'Minimo calculado', value: '2', icon: Gauge },
];

const plannedAllocations = [
  { title: 'ClienteCore', meta: 'Fixo · Seg a Sex · daily e desenvolvimento minimo', hours: '2h00' },
  { title: 'DataVault', meta: 'Critico · task vence hoje · sprint curta', hours: '2h40' },
  { title: 'FinTrack', meta: 'Rotativo · maior deficit semanal', hours: '2h10' },
  { title: 'MediSync', meta: 'Rotativo · carga moderada de tasks', hours: '1h40' },
  { title: 'AuthGuard', meta: 'Rotativo · entra pelo restante disponivel', hours: '1h30' },
];

export function TodayPlannerOverview() {
  return (
    <div className={todayPlannerOverviewStyles.layout}>
      <div className={todayPlannerOverviewStyles.stack}>
        <SectionIntro
          eyebrow="Hoje"
          title="Planejamento do ciclo com horas, slots e escala sugerida"
          description="Esta tela abre o dia de trabalho. O usuario informa horas disponiveis e quantidade de projetos no ciclo, recebe a sugestao de escala e fecha o dia com ajuste manual das horas reais."
        />

        <div className={todayPlannerOverviewStyles.summaryGrid}>
          {summary.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.label}>
                <CardHeader>
                  <CardDescription>{item.label}</CardDescription>
                  <CardTitle className="flex items-center justify-between gap-3">
                    <span className={todayPlannerOverviewStyles.metricValue}>{item.value}</span>
                    <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  </CardTitle>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardDescription>Escala sugerida</CardDescription>
            <CardTitle>Distribuicao inicial do dia</CardTitle>
          </CardHeader>
          <CardContent className={todayPlannerOverviewStyles.plannerList}>
            {plannedAllocations.map((item) => (
              <div key={item.title} className={todayPlannerOverviewStyles.plannerItem}>
                <div>
                  <p className={todayPlannerOverviewStyles.plannerTitle}>{item.title}</p>
                  <p className={todayPlannerOverviewStyles.plannerMeta}>{item.meta}</p>
                </div>
                <span className={todayPlannerOverviewStyles.plannerHours}>{item.hours}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <EmptyState
        eyebrow="Sugestao de redistribuicao"
        title="O banner de ajuste percentual entra aqui no proximo ciclo funcional"
        description="A area lateral ja reserva o espaco para o comparativo entre percentual atual e sugerido por carga de tasks, sem misturar a regra final antes do ciclo de dados reais."
        hint="Proximo passo natural: conectar formulario do ciclo, banner colapsavel e encerramento do dia com stepper de horas reais."
      />
    </div>
  );
}