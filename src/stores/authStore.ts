import { create } from 'zustand';
import type { User } from '../types/index';
import { authService } from '../services/auth.service';
import axios from 'axios'; // ⚡ IMPORTAMOS AXIOS PARA LOS ERRORES

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { token, user } = await authService.login({ email, password });
      localStorage.setItem('auth_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // 🧹 ADIÓS ANY DE ERRORES: Comprobamos de forma segura si es un error de Axios
      let errorMessage = 'Error al iniciar sesión';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  register: async (email, password, name) => {
    try {
      set({ isLoading: true, error: null });
      const { token, user } = await authService.register({ email, password, name });
      localStorage.setItem('auth_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      let errorMessage = 'Error al registrarse';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      set({ isLoading: true });
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('auth_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  updatePreferences: async (preferences) => {
    try {
      const user = await authService.updatePreferences(preferences);
      set({ user });
    } catch (error) {
      let errorMessage = 'Error al actualizar preferencias';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      set({ error: errorMessage });
      throw error;
    }
  },
}));