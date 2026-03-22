import { api } from '@/lib/axios';

import type { Project, ProjectFormValues, ProjectStatus } from '@/modules/projects/types';

export interface UpdateProjectInput {
  projectId: string;
  values: ProjectFormValues;
}

export interface ToggleProjectStatusInput {
  projectId: string;
  status: ProjectStatus;
}

async function getProjects() {
  const response = await api.get<Project[]>('/api/projects');

  return response.data;
}

async function createProject(input: ProjectFormValues) {
  const response = await api.post<Project>('/api/projects', input);

  return response.data;
}

async function updateProject({ projectId, values }: UpdateProjectInput) {
  const response = await api.patch<Project>(`/api/projects/${projectId}`, values);

  return response.data;
}

async function toggleProjectStatus({ projectId, status }: ToggleProjectStatusInput) {
  const response = await api.patch<Project>(`/api/projects/${projectId}/status`, { status });

  return response.data;
}

export const projectsService = {
  createProject,
  getProjects,
  toggleProjectStatus,
  updateProject,
};