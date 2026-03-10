import { create } from 'zustand';
import type { Client } from '../types';
import { clientService } from '../services/client.service';

interface ClientState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalRecords: number;

  fetchClients: (page?: number, limit?: number) => Promise<void>;
  addClient: (data: Partial<Client>) => Promise<void>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,

  fetchClients: async (page = 1, limit = 1000) => {
    try {
      set({ isLoading: true, error: null });
      const response = await clientService.getClients({ page, limit });
      
      set({ 
        clients: response.data, 
        currentPage: response.pagination.paginaActual,
        totalPages: response.pagination.totalPaginas,
        totalRecords: response.pagination.totalRegistros,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar clientes', isLoading: false });
    }
  },

  addClient: async (data) => {
    // ⚡ ACTUALIZACIÓN OPTIMISTA: Lo dibujamos en pantalla al instante
    const tempId = `temp-${Date.now()}`;
    const newClient = { _id: tempId, ...data } as Client;

    set((state) => ({
      clients: [newClient, ...state.clients],
      totalRecords: state.totalRecords + 1,
      isLoading: false
    }));

    try {
      await clientService.createClient(data);
      // Refrescamos en silencio para cambiar el ID temporal por el real de la DB
      get().fetchClients();
    } catch (error: any) {
      // Si falla, lo borramos
      set((state) => ({
        clients: state.clients.filter(c => c._id !== tempId),
        totalRecords: state.totalRecords - 1,
        error: error.response?.data?.message || 'Error al crear cliente'
      }));
      throw error;
    }
  },

  updateClient: async (id, data) => {
    const previousClients = get().clients;
    set((state) => ({
      clients: state.clients.map(c => c._id === id ? { ...c, ...data } : c)
    }));
    try {
      await clientService.updateClient(id, data);
    } catch (error: any) {
      set({ clients: previousClients, error: error.response?.data?.message || 'Error al actualizar' });
      throw error;
    }
  },

  deleteClient: async (id) => {
    const previousClients = get().clients;
    set((state) => ({
      clients: state.clients.filter(c => c._id !== id),
      totalRecords: Math.max(0, state.totalRecords - 1)
    }));
    try {
      await clientService.deleteClient(id);
    } catch (error: any) {
      set({ clients: previousClients, error: error.response?.data?.message || 'Error al eliminar' });
      throw error;
    }
  }
}));