import { EmptyState } from '@/shared/components/EmptyState';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { cn } from '@/shared/utils/cn';

import { weeklyBalancePreviewStyles } from './styles';

const rows = [
  { project: 'ClienteCore', days: ['2h', '2h', '2h', '2h', '2h', '-'], status: 'Equilibrado', tone: weeklyBalancePreviewStyles.statusGood },
  { project: 'FinTrack', days: ['1h', '0h', '2h', '1h', '2h', '1h'], status: 'Atencao', tone: weeklyBalancePreviewStyles.statusWarn },
  { project: 'DataVault', days: ['0h', '3h', '0h', '1h', '0h', '0h'], status: 'Critico', tone: weeklyBalancePreviewStyles.statusCritical },
];

export function WeeklyBalancePreview() {
  return (
    <div className={weeklyBalancePreviewStyles.layout}>
      <SectionIntro
        eyebrow="Semana"
        title="Leitura editorial do equilibrio semanal por projeto e por dia"
        description="A tela semanal consolida as horas por projeto ao longo da semana, destaca desvios e aponta quais frentes receberam menos tempo do que deveriam."
      />

      <div className={weeklyBalancePreviewStyles.board}>
        <div className={cn(weeklyBalancePreviewStyles.row, weeklyBalancePreviewStyles.rowHeader)}>
          <span>Projeto</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sab</span>
          <span>Status</span>
        </div>
        {rows.map((row, index) => (
          <div key={row.project} className={cn(weeklyBalancePreviewStyles.row, index % 2 === 0 && weeklyBalancePreviewStyles.rowAlt)}>
            <span className={weeklyBalancePreviewStyles.projectCell}>{row.project}</span>
            {row.days.map((day, dayIndex) => (
              <span key={`${row.project}-${dayIndex}`}>{day}</span>
            ))}
            <span className={row.tone}>{row.status}</span>
          </div>
        ))}
      </div>

      <EmptyState
        eyebrow="Resumo semanal"
        title="Desvios acumulados e agregados entram aqui"
        description="O proximo ciclo funcional conecta a grade semanal aos dados reais do ciclo e classifica cada projeto como equilibrado, em atencao ou critico."
        hint="O objetivo desta primeira entrega e garantir a estrutura visual da rota e o espaco certo para a leitura semanal."
      />
    </div>
  );
}