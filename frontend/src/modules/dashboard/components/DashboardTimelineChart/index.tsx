import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';

import type { DashboardTimelinePoint } from '../../types';
import { dashboardTimelineChartStyles } from './styles';

interface DashboardTimelineChartProps {
  points: DashboardTimelinePoint[];
}

export function DashboardTimelineChart({ points }: DashboardTimelineChartProps) {
  const maxHours = Math.max(...points.map((point) => point.totalHours), 1);
  const chartHeight = 220;
  const chartWidth = Math.max(points.length * 28, 840);
  const stepX = chartWidth / Math.max(points.length - 1, 1);
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
          {points[points.length - 1]?.projects.map((project) => (
            <div key={project.projectId} className={dashboardTimelineChartStyles.legendItem}>
              <span aria-hidden="true" className={dashboardTimelineChartStyles.legendDot} style={{ backgroundColor: project.colorHex }} />
              <span>{project.projectName}</span>
            </div>
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

                      return (
                        <rect
                          key={`${point.date}-${project.projectId}`}
                          fill={project.colorHex}
                          height={barHeight}
                          opacity="0.8"
                          rx="4"
                          width="16"
                          x={x - 8}
                          y={stackBase}
                        />
                      );
                    })}
                  </g>
                );
              })}

              <path className={dashboardTimelineChartStyles.totalLine} d={totalLine} />

              {points.map((point, index) => {
                const x = index * stepX;
                const y = chartHeight - ((point.totalHours / maxHours) * (chartHeight - 24)) - 12;

                return <circle key={`${point.date}-point`} className={dashboardTimelineChartStyles.totalPoint} cx={x} cy={y} r="3.5" />;
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
      </CardContent>
    </Card>
  );
}