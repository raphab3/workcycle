import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/utils/cn';

import { formatHours, getActualHoursTotal } from '@/modules/today/utils/planner';

import { executionAdjusterStyles } from './styles';
import type { ExecutionAdjusterProps } from './types';

export function ExecutionAdjuster({ actualHours, allocations, availableHours, onAdjustHours }: ExecutionAdjusterProps) {
  const totalActualHours = getActualHoursTotal(actualHours);
  const balance = Number((availableHours - totalActualHours).toFixed(1));

  return (
    <div className={executionAdjusterStyles.list}>
      {allocations.map((allocation) => {
        const value = actualHours[allocation.projectId] ?? allocation.plannedHours;

        return (
          <div key={allocation.projectId} className={executionAdjusterStyles.item}>
            <div className={executionAdjusterStyles.top}>
              <div>
                <p className={executionAdjusterStyles.title}>{allocation.projectName}</p>
                <p className={executionAdjusterStyles.copy}>{allocation.kind === 'fixed' ? 'Fixo' : 'Rotativo'} · previsto {formatHours(allocation.plannedHours)}</p>
              </div>
            </div>

            <div className={executionAdjusterStyles.controls}>
              <Button type="button" size="sm" variant="outline" aria-label={`Reduzir ${allocation.projectName}`} onClick={() => onAdjustHours(allocation.projectId, -0.5)}>
                -0.5h
              </Button>
              <span className={executionAdjusterStyles.hours}>{formatHours(value)}</span>
              <Button type="button" size="sm" variant="outline" aria-label={`Aumentar ${allocation.projectName}`} onClick={() => onAdjustHours(allocation.projectId, 0.5)}>
                +0.5h
              </Button>
            </div>
          </div>
        );
      })}

      <div className={executionAdjusterStyles.summary}>
        <p className={executionAdjusterStyles.summaryText}>Horas reais registradas: {formatHours(totalActualHours)}</p>
        <p className={cn(executionAdjusterStyles.summaryText, balance >= 0 ? executionAdjusterStyles.balancePositive : executionAdjusterStyles.balanceNegative)}>
          Saldo do ciclo: {balance > 0 ? '+' : ''}{formatHours(Math.abs(balance))}{balance < 0 ? ' acima do disponivel' : ' livres'}
        </p>
      </div>
    </div>
  );
}