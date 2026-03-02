import { create } from 'zustand';
import type { Task } from '../types';
import type { TaskFilters } from '../services/task.service';
import { taskService } from '../services/task.service';

interface TaskState {
  tasks: Task[];
  clientTasks: Task[]; // 👈 CORRECCIÓN: Estaba en singular en tu código, debe ser plural
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;

  // Paginación
  currentPage: number;
  totalPages: number;
  totalRecords: number;

  // Acciones
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  fetchClientTasks: (clientId: string) => Promise<void>; // 👈 NUEVO: Lo necesitamos para ClientDetails
  addTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setFilters: (filters: TaskFilters) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  clientTasks: [], // 👈 NUEVO: Estado completamente aislado para no contaminar el Dashboard
  isLoading: false,
  error: null,
  filters: { page: 1, limit: 1000 }, // 👈 BUG FANTASMA ASESINADO: Pedimos 1000 por defecto
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,

  fetchTasks: async (newFilters) => {
    try {
      set({ isLoading: true, error: null });
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...newFilters };

      const response = await taskService.getTasks(mergedFilters);

      set({
        tasks: response.data,
        filters: mergedFilters,
        currentPage: response.pagination.paginaActual,
        totalPages: response.pagination.totalPaginas,
        totalRecords: response.pagination.totalRegistros,
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar las tareas', isLoading: false });
    }
  },

  // 👈 NUEVO: Esta función se usa SOLO en la página del cliente
  fetchClientTasks: async (clientId: string) => {
    try {
      set({ isLoading: true, error: null });
      // Le pasamos limit 1000 para que tampoco se escondan las tareas del cliente
      const response = await taskService.getTasks({ clientId, limit: 1000 });
      set({ clientTasks: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar tareas del cliente', isLoading: false });
    }
  },

  addTask: async (data) => {
    try {
      set({ isLoading: true, error: null });
      
      // Esperamos a que se cree para tener el _id real de la base de datos
      const newTask = await taskService.createTask(data);
      
      // ⚡ ACTUALIZACIÓN LOCAL (En ambas listas)
      set((state) => ({
        tasks: [...state.tasks, newTask],
        // Si la tarea tiene cliente, la metemos también en su lista aislada para que se vea al instante
        clientTasks: data.client ? [...state.clientTasks, newTask] : state.clientTasks,
        totalRecords: state.totalRecords + 1,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear la tarea', isLoading: false });
      throw error;
    }
  },

  updateTask: async (id, data) => {
    // 1. Guardamos el estado anterior de AMBAS listas
    const previousTasks = get().tasks;
    const previousClientTasks = get().clientTasks;

    // 2. ⚡ ACTUALIZACIÓN OPTIMISTA (0 delay en Global y en Cliente)
    set((state) => ({
      tasks: state.tasks.map((task) => 
        task._id === id ? { ...task, ...data } : task
      ),
      clientTasks: state.clientTasks.map((task) => 
        task._id === id ? { ...task, ...data } : task
      )
    }));

    try {
      // 3. Enviamos el cambio al servidor
      await taskService.updateTask(id, data);
    } catch (error: any) {
      // 4. Si falla, deshacemos ambos
      set({ 
        tasks: previousTasks, 
        clientTasks: previousClientTasks,
        error: error.response?.data?.message || 'Error al actualizar la tarea' 
      });
      throw error;
    }
  },

  deleteTask: async (id) => {
    const previousTasks = get().tasks;
    const previousClientTasks = get().clientTasks;

    // ⚡ ACTUALIZACIÓN OPTIMISTA (Borramos de ambas listas al instante)
    set((state) => ({
      tasks: state.tasks.filter((task) => task._id !== id),
      clientTasks: state.clientTasks.filter((task) => task._id !== id),
      totalRecords: Math.max(0, state.totalRecords - 1)
    }));

    try {
      await taskService.deleteTask(id);
    } catch (error: any) {
      set({ 
          tasks: previousTasks, 
          clientTasks: previousClientTasks, 
          error: error.response?.data?.message || 'Error al eliminar la tarea' 
      });
      throw error;
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchTasks();
  }
}));