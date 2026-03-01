import api from './api';
import { Flow, CreateFlowDto, UpdateFlowDto, NodeTypesResponse } from '../types';

export const flowService = {
  // Get all flows
  getAll: async (): Promise<Flow[]> => {
    const response = await api.get<Flow[]>('/flows');
    return response.data;
  },

  // Get single flow by ID
  getById: async (id: string): Promise<Flow> => {
    const response = await api.get<Flow>(`/flows/${id}`);
    return response.data;
  },

  // Get active flow
  getActive: async (): Promise<Flow | null> => {
    const response = await api.get<Flow | null>('/flows/active');
    return response.data;
  },

  // Get available node types
  getNodeTypes: async (): Promise<NodeTypesResponse> => {
    const response = await api.get<NodeTypesResponse>('/flows/node-types');
    return response.data;
  },

  // Create new flow
  create: async (data: CreateFlowDto): Promise<Flow> => {
    const response = await api.post<Flow>('/flows', data);
    return response.data;
  },

  // Update flow
  update: async (id: string, data: UpdateFlowDto): Promise<Flow> => {
    const response = await api.put<Flow>(`/flows/${id}`, data);
    return response.data;
  },

  // Delete flow
  delete: async (id: string): Promise<void> => {
    await api.delete(`/flows/${id}`);
  },

  // Activate flow
  activate: async (id: string): Promise<Flow> => {
    const response = await api.post<Flow>(`/flows/${id}/activate`);
    return response.data;
  },

  // Deactivate flow
  deactivate: async (id: string): Promise<Flow> => {
    const response = await api.post<Flow>(`/flows/${id}/deactivate`);
    return response.data;
  },
};

export default flowService;
