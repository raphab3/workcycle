'use client';

import { useState } from 'react';

import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/utils/cn';

import { suggestionBannerStyles } from './styles';
import type { SuggestionBannerProps } from './types';

export function SuggestionBanner({ allocations, planningMoment }: SuggestionBannerProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className={suggestionBannerStyles.wrapper}>
      <div className={suggestionBannerStyles.top}>
        <div>
          <p className={suggestionBannerStyles.moment}>Referencia do plano · {planningMoment}</p>
          <h2 className={suggestionBannerStyles.title}>Sugestao de redistribuicao baseada na carga aberta</h2>
          <p className={suggestionBannerStyles.description}>A recomendacao compara o percentual atual da carteira com o peso real de tasks abertas para definir a escala do dia.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => setCollapsed((value) => !value)}>
          {collapsed ? 'Mostrar detalhes' : 'Ocultar detalhes'}
        </Button>
      </div>

      {!collapsed && (
        <div aria-label="Detalhes de redistribuicao" className={suggestionBannerStyles.list}>
          {allocations.map((allocation) => {
            const delta = allocation.suggestedAllocationPct - allocation.currentAllocationPct;

            return (
              <div key={allocation.projectId} className={suggestionBannerStyles.item}>
                <div className={suggestionBannerStyles.row}>
                  <div>
                    <p className={suggestionBannerStyles.name}>{allocation.projectName}</p>
                    <p className={suggestionBannerStyles.copy}>{allocation.reason}</p>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      delta > 0 && suggestionBannerStyles.positive,
                      delta < 0 && suggestionBannerStyles.negative,
                      delta === 0 && suggestionBannerStyles.neutral,
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