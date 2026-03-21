import type { Project } from '@/modules/projects/types';

export function getActiveAllocationTotal(projects: Project[]) {
  return projects.filter((project) => project.status === 'active').reduce((total, project) => total + project.allocationPct, 0);
}

export function getAllocationDelta(projects: Project[]) {
  return 100 - getActiveAllocationTotal(projects);
}

export function getAllocationTone(projects: Project[]) {
  const delta = getAllocationDelta(projects);

  if (delta === 0) {
    return 'balanced';
  }

  return delta > 0 ? 'under' : 'over';
}

export function formatFixedSchedule(project: Project) {
  if (project.type !== 'fixed') {
    return 'Rotativo · entra por deficit semanal';
  }

  return `${project.fixedDays.join(' · ')} · ${project.fixedHoursPerDay.toFixed(1).replace('.', ',')}h reservadas`;
}