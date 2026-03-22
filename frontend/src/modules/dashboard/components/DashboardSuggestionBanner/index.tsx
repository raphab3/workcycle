'use client';

import { useState } from 'react';

import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/utils/cn';

import { dashboardSuggestionBannerStyles } from './styles';
import type { DashboardSuggestionBannerProps } from './types';

export function DashboardSuggestionBanner({ allocations, planningMoment }: DashboardSuggestionBannerProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className={dashboardSuggestionBannerStyles.wrapper}>
      <div className={dashboardSuggestionBannerStyles.top}>
        <div>
          <p className={dashboardSuggestionBannerStyles.eyebrow}>Redistribuicao sugerida · {planningMoment}</p>
          <h2 className={dashboardSuggestionBannerStyles.title}>Sugestao de redistribuicao baseada na carga aberta</h2>
          <p className={dashboardSuggestionBannerStyles.description}>
            Use esta leitura quando o plano do dia precisar ser recalibrado antes de mexer nas horas disponiveis ou trocar o foco principal.
          </p>
        </div>

        <Button aria-expanded={!collapsed} type="button" variant="outline" onClick={() => setCollapsed((value) => !value)}>
          {collapsed ? 'Mostrar detalhes' : 'Ocultar detalhes'}
        </Button>
      </div>

      {!collapsed && (
        <div aria-label="Detalhes de redistribuicao" className={dashboardSuggestionBannerStyles.list}>
          {allocations.map((allocation) => {
            const delta = allocation.suggestedAllocationPct - allocation.currentAllocationPct;

            return (
              <div key={allocation.projectId} className={dashboardSuggestionBannerStyles.item}>
                <div className={dashboardSuggestionBannerStyles.row}>
                  <div>
                    <p className={dashboardSuggestionBannerStyles.name}>{allocation.projectName}</p>
                    <p className={dashboardSuggestionBannerStyles.copy}>{allocation.reason}</p>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      delta > 0 && dashboardSuggestionBannerStyles.positive,
                      delta < 0 && dashboardSuggestionBannerStyles.negative,
                      delta === 0 && dashboardSuggestionBannerStyles.neutral,
                    )}
                  >
                    {delta > 0 ? `+${delta}` : delta}pp
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}