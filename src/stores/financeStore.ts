import { create } from 'zustand';
import type { Finance } from '../types';
import { financeService } from '../services/finance.service';
import type { FinanceFilters, FinanceSummary } from '../services/finance.service';
import { api } from '../services/api';

interface FinanceState {
  finances: Finance[];
  summary: FinanceSummary | null; 
  isLoading: boolean;
  error: string | null;
  filters: FinanceFilters;

  fetchFinances: (filters?: FinanceFilters) => Promise<void>;
  fetchSummary: () => Promise<void>;
  addFinance: (data: Partial<Finance>) => Promise<void>;
  updateFinance: (id: string, data: Partial<Finance>) => Promise<void>; // ⚡ AÑADIDO
  deleteFinance: (id: string) => Promise<void>;
  setFilters: (filters: FinanceFilters) => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  finances: [],
  summary: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchFinances: async (newFilters) => {
    try {
      set({ isLoading: true, error: null });
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...newFilters };
      
      const data = await financeService.getFinances(mergedFilters);
      set({ finances: data, filters: mergedFilters, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar historial', isLoading: false });
    }
  },

  fetchSummary: async () => {
    try {
      const summary = await financeService.getSummary();
      set({ summary });
    } catch (error: any) {
      console.error("Error al cargar el resumen financiero", error);
    }
  },

  addFinance: async (data) => {
    const tempAmount = Number(data.amount) || 0;
    const tempFinance = { 
      ...data, 
      _id: Date.now().toString(), 
      amount: tempAmount,
      date: data.date || new Date().toISOString()
    } as Finance;
    
    set((state) => ({
      finances: [tempFinance, ...state.finances],
      summary: state.summary ? {
        totalIncome: state.summary.totalIncome + (tempFinance.type === 'ingreso' ? tempAmount : 0),
        totalExpenses: state.summary.totalExpenses + (tempFinance.type === 'gasto' ? tempAmount : 0),
        netProfit: state.summary.netProfit + (tempFinance.type === 'ingreso' ? tempAmount : -tempAmount)
      } : null,
      isLoading: false
    }));

    try {
      await financeService.createFinance(data);
      get().fetchFinances(get().filters); 
      get().fetchSummary();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al registrar movimiento' });
      throw error;
    }
  },

  // ⚡ NUEVA FUNCIÓN PARA ARCHIVAR/DESARCHIVAR
  updateFinance: async (id, data) => {
    const previousFinances = get().finances;
    set((state) => ({
      finances: state.finances.map(f => f._id === id ? { ...f, ...data } : f),
    }));
    try {
      if ((financeService as any).updateFinance) {
          await (financeService as any).updateFinance(id, data);
      } else {
          await api.put(`/finance/${id}`, data);
      }
      get().fetchSummary();
    } catch (error: any) {
      set({ finances: previousFinances, error: error.response?.data?.message || 'Error al actualizar' });
      throw error;
    }
  },

  deleteFinance: async (id) => {
    const previousFinances = get().finances;
    const financeToDelete = previousFinances.find(f => f._id === id);
    
    set((state) => ({
       finances: state.finances.filter(f => f._id !== id),
       summary: state.summary && financeToDelete ? {
          totalIncome: state.summary.totalIncome - (financeToDelete.type === 'ingreso' ? financeToDelete.amount : 0),
          totalExpenses: state.summary.totalExpenses - (financeToDelete.type === 'gasto' ? financeToDelete.amount : 0),
          netProfit: state.summary.netProfit - (financeToDelete.type === 'ingreso' ? financeToDelete.amount : -financeToDelete.amount)
       } : state.summary,
       isLoading: false
    }));

    try {
      await financeService.deleteFinance(id);
      get().fetchFinances(get().filters);
      get().fetchSummary();
    } catch (error: any) {
      set({ finances: previousFinances, error: error.response?.data?.message || 'Error al eliminar registro' });
      throw error;
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchFinances();
  }
}));