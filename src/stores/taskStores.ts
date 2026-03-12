import { create } from 'zustand';
import type { Task } from '../types';
import type { TaskFilters } from '../services/task.service';
import { taskService } from '../services/task.service';

interface TaskState {
  tasks: Task[];
  clientTasks: Task[]; 
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;

  // Paginación
  currentPage: number;
  totalPages: number;
  totalRecords: number;

  // Acciones
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  fetchClientTasks: (clientId: string) => Promise<void>; 
  addTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setFilters: (filters: TaskFilters) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  clientTasks: [], 
  isLoading: false,
  error: null,
  // ⚡ AQUÍ ESTÁ LA MAGIA: Ahora pedimos paquetes de 12
  filters: { page: 1, limit: 12 }, 
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

  fetchClientTasks: async (clientId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await taskService.getTasks({ clientId, limit: 1000 });
      set({ clientTasks: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar tareas del cliente', isLoading: false });
    }
  },

  addTask: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const newTask = await taskService.createTask(data);
      
      set((state) => ({
        tasks: [...state.tasks, newTask],
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
    const previousTasks = get().tasks;
    const previousClientTasks = get().clientTasks;

    set((state) => ({
      tasks: state.tasks.map((task) => task._id === id ? { ...task, ...data } : task),
      clientTasks: state.clientTasks.map((task) => task._id === id ? { ...task, ...data } : task)
    }));

    try {
      await taskService.updateTask(id, data);
    } catch (error: any) {
      set({ tasks: previousTasks, clientTasks: previousClientTasks, error: error.response?.data?.message || 'Error al actualizar la tarea' });
      throw error;
    }
  },

  deleteTask: async (id) => {
    const previousTasks = get().tasks;
    const previousClientTasks = get().clientTasks;
    const previousTotal = get().totalRecords;

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
        totalRecords: previousTotal, 
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