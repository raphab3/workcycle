import { useMemo, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';

import type { DashboardTimelinePoint } from '../../types';
import { dashboardTimelineChartStyles } from './styles';

interface DashboardTimelineChartProps {
  points: DashboardTimelinePoint[];
}

function formatLongDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
  }).format(new Date(date));
}

export function DashboardTimelineChart({ points }: DashboardTimelineChartProps) {
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);
  const [activePointIndex, setActivePointIndex] = useState(points.length - 1);
  const maxHours = Math.max(...points.map((point) => point.totalHours), 1);
  const chartHeight = 220;
  const chartWidth = Math.max(points.length * 28, 840);
  const stepX = chartWidth / Math.max(points.length - 1, 1);
  const activePoint = points[activePointIndex] ?? points[points.length - 1];
  const highlightedProject = highlightedProjectId
    ? activePoint?.projects.find((project) => project.projectId === highlightedProjectId) ?? null
    : null;
  const legendProjects = points[points.length - 1]?.projects ?? [];
  const detailProjects = useMemo(() => {
    if (!activePoint) {
      return [];
    }

    return [...activePoint.projects].sort((left, right) => right.hours - left.hours);
  }, [activePoint]);
  const totalLine = points
    .map((point, index) => {
      const x = index * stepX;
      const y = chartHeight - ((point.totalHours / maxHours) * (chartHeight - 24)) - 12;

      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <Card>
      <CardHeader>
        <CardDescription>Janela temporal</CardDescription>
        <CardTitle>Ultimos 30 dias de horas trabalhadas por projeto</CardTitle>
      </CardHeader>
      <CardContent className={dashboardTimelineChartStyles.container}>
        <p className={dashboardTimelineChartStyles.copy}>
          Enquanto o produto ainda nao persiste historico diario, esta curva usa a cadencia do workspace para simular a janela recente e expor a distribuicao por projeto ao longo do tempo.
        </p>

        <div className={dashboardTimelineChartStyles.legend}>
          {legendProjects.map((project) => (
            <button
              key={project.projectId}
              aria-pressed={highlightedProjectId === project.projectId}
              className={dashboardTimelineChartStyles.legendButton}
              onClick={() => setHighlightedProjectId((current) => (current === project.projectId ? null : project.projectId))}
              type="button"
            >
              <span aria-hidden="true" className={dashboardTimelineChartStyles.legendDot} style={{ backgroundColor: project.colorHex }} />
              <span>{project.projectName}</span>
            </button>
          ))}
          <div className={dashboardTimelineChartStyles.legendItem}>
            <span aria-hidden="true" className={dashboardTimelineChartStyles.legendLine} />
            <span>Total do dia</span>
          </div>
        </div>

        <div className={dashboardTimelineChartStyles.scroller}>
          <div className={dashboardTimelineChartStyles.chartFrame} style={{ width: chartWidth }}>
            <svg aria-label="Grafico temporal de 30 dias" className={dashboardTimelineChartStyles.svg} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              {points.map((point, index) => {
                const x = index * stepX;
                let stackBase = chartHeight - 10;

                return (
                  <g key={point.date}>
                    {point.projects.map((project) => {
                      const barHeight = Math.max(2, (project.hours / maxHours) * (chartHeight - 36));
                      stackBase -= barHeight;
                      const isHighlighted = highlightedProjectId === null || highlightedProjectId === project.projectId;

                      return (
                        <rect
                          key={`${point.date}-${project.projectId}`}
                          fill={project.colorHex}
                          height={barHeight}
                          opacity={isHighlighted ? '0.88' : '0.18'}
                          rx="4"
                          width="16"
                          x={x - 8}
                          y={stackBase}
                        />
                      );
                    })}

                    <rect
                      aria-label={`Detalhar ${point.shortLabel}`}
                      className={dashboardTimelineChartStyles.hitArea}
                      height={chartHeight}
                      onFocus={() => setActivePointIndex(index)}
                      onMouseEnter={() => setActivePointIndex(index)}
                      rx="8"
                      tabIndex={0}
                      width={Math.max(stepX, 24)}
                      x={x - (Math.max(stepX, 24) / 2)}
                      y={0}
                    />
                  </g>
                );
              })}

              <path className={dashboardTimelineChartStyles.totalLine} d={totalLine} />

              {points.map((point, index) => {
                const x = index * stepX;
                const y = chartHeight - ((point.totalHours / maxHours) * (chartHeight - 24)) - 12;
                const isActive = index === activePointIndex;

                return <circle key={`${point.date}-point`} className={dashboardTimelineChartStyles.totalPoint} cx={x} cy={y} r={isActive ? '5' : '3.5'} />;
              })}
            </svg>

            <div className={dashboardTimelineChartStyles.axis} style={{ width: chartWidth }}>
              {points.map((point, index) => (
                <div key={`${point.date}-label`} className={dashboardTimelineChartStyles.axisItem}>
                  <span className={dashboardTimelineChartStyles.axisLabel}>{index % 4 === 0 || index === points.length - 1 ? point.shortLabel : '·'}</span>
                  <span className={dashboardTimelineChartStyles.axisValue}>{point.totalHours.toFixed(1).replace('.', ',')}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {activePoint && (
          <div aria-label="Detalhes do dia selecionado" className={dashboardTimelineChartStyles.detailPanel}>
            <div className={dashboardTimelineChartStyles.detailHeader}>
              <div>
                <p className={dashboardTimelineChartStyles.detailEyebrow}>Leitura do dia</p>
                <h3 className={dashboardTimelineChartStyles.detailTitle}>{formatLongDate(activePoint.date)}</h3>
              </div>
              <div className={dashboardTimelineChartStyles.detailMetric}>
                <span>Total</span>
                <strong>{activePoint.totalHours.toFixed(1).replace('.', ',')}h</strong>
              </div>
            </div>

            {highlightedProject ? (
              <div className={dashboardTimelineChartStyles.highlightCallout}>
                <span aria-hidden="true" className={dashboardTimelineChartStyles.legendDot} style={{ backgroundColor: highlightedProject.colorHex }} />
                <div>
                  <p className={dashboardTimelineChartStyles.detailProjectName}>{highlightedProject.projectName}</p>
                  <p className={dashboardTimelineChartStyles.detailProjectHours}>{highlightedProject.hours.toFixed(1).replace('.', ',')}h neste dia</p>
                </div>
                <Button size="sm" type="button" variant="ghost" onClick={() => setHighlightedProjectId(null)}>
                  Limpar foco
                </Button>
              </div>
            ) : null}

            <div className={dashboardTimelineChartStyles.detailGrid}>
              {detailProjects.map((project) => (
                <div key={`${activePoint.date}-${project.projectId}`} className={dashboardTimelineChartStyles.detailItem}>
                  <div className={dashboardTimelineChartStyles.detailProjectMeta}>
                    <span aria-hidden="true" className={dashboardTimelineChartStyles.legendDot} style={{ backgroundColor: project.colorHex }} />
                    <span className={dashboardTimelineChartStyles.detailProjectName}>{project.projectName}</span>
                  </div>
                  <span className={dashboardTimelineChartStyles.detailProjectHours}>{project.hours.toFixed(1).replace('.', ',')}h</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}