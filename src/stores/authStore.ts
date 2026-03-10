import { create } from 'zustand';
import type { User } from '../types/index';
import { authService } from '../services/auth.service';
import { api } from '../services/api'; 
import axios from 'axios';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // ⚡ Modificamos las interfaces para que puedan devolver el aviso del 2FA
  login: (email: string, password: string) => Promise<{ requires2FA?: boolean, email?: string } | void>;
  googleLogin: (token: string) => Promise<{ requires2FA?: boolean, email?: string } | void>;
  verify2FALogin: (email: string, token: string) => Promise<void>; // ⚡ NUEVA FUNCIÓN
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
      // ⚡ Usamos api.post directo para poder leer la respuesta especial del candado
      const response = await api.post('/auth/login', { email, password });
      
      // Si el servidor dice que necesita 2FA, avisamos a la pantalla
      if (response.data.requires2FA) {
        set({ isLoading: false });
        return { requires2FA: true, email: response.data.email };
      }

      // Si no hay candado, entra normal
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      let errorMessage = 'Error al iniciar sesión';
      if (axios.isAxiosError(error) && error.response) errorMessage = error.response.data.message || errorMessage;
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  googleLogin: async (token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/google', { token });
      
      // ⚡ Misma lógica para Google
      if (response.data.requires2FA) {
        set({ isLoading: false });
        return { requires2FA: true, email: response.data.email };
      }

      const { token: authToken, user } = response.data;
      localStorage.setItem('auth_token', authToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      set({ user, token: authToken, isAuthenticated: true, isLoading: false });
    } catch (error) {
      let errorMessage = 'Error al iniciar sesión con Google';
      if (axios.isAxiosError(error) && error.response) errorMessage = error.response.data.message || errorMessage;
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // ⚡ NUEVO: Enviar los 6 números para poder entrar definitivamente
  verify2FALogin: async (email, token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/2fa/verify-login', { email, token });
      
      const { token: authToken, user } = response.data;
      localStorage.setItem('auth_token', authToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      set({ user, token: authToken, isAuthenticated: true, isLoading: false });
    } catch (error) {
      let errorMessage = 'El código es incorrecto';
      if (axios.isAxiosError(error) && error.response) errorMessage = error.response.data.message || errorMessage;
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
      if (axios.isAxiosError(error) && error.response) errorMessage = error.response.data.message || errorMessage;
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
      if (axios.isAxiosError(error) && error.response) errorMessage = error.response.data.message || errorMessage;
      set({ error: errorMessage });
      throw error;
    }
  },
}));