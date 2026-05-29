import axiosInstance from './axiosInstance';
import type { ExportFormat, Module, ProjectStatus } from '../types';

export const listProjects = async () => {
  const { data } = await axiosInstance.get('/projects');
  return data.data;
};

export const createProject = async (payload: {
  title: string;
  description?: string;
  requirementText: string;
}) => {
  const { data } = await axiosInstance.post('/projects', payload);
  return data.data;
};

export const getProject = async (id: string) => {
  const { data } = await axiosInstance.get(`/projects/${id}`);
  return data.data;
};

export const updateProject = async (
  id: string,
  payload: { title?: string; description?: string; status?: ProjectStatus }
) => {
  const { data } = await axiosInstance.patch(`/projects/${id}`, payload);
  return data.data;
};

export const deleteProject = async (id: string) => {
  const { data } = await axiosInstance.delete(`/projects/${id}`);
  return data;
};

export const splitProject = async (id: string) => {
  const { data } = await axiosInstance.post(`/projects/${id}/split`);
  return data.data;
};

export const updateStructure = async (id: string, modules: Module[]) => {
  const { data } = await axiosInstance.put(`/projects/${id}/structure`, { modules });
  return data;
};

export const exportProject = async (id: string, format: ExportFormat) => {
  const response = await axiosInstance.get(`/projects/${id}/export`, {
    params: { format },
    responseType: 'blob',
  });
  return response;
};
