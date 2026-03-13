import {api} from './api';
import type { Client } from '../types';

export const clientService = {
  getClients: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/clients', { params });
    return response.data;
  },
  getClientById: async (id: string) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },
  createClient: async (data: Partial<Client>) => {
    const response = await api.post('/clients', data);
    return response.data;
  },
  updateClient: async (id: string, data: Partial<Client>) => {
    const response = await api.patch(`/clients/${id}`, data);
    return response.data;
  },
  deleteClient: async (id: string) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  }
};