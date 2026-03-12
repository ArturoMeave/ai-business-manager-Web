import { create } from 'zustand';
import { api } from '../services/api';
import type { User } from '../types';

// Aquí definimos todo lo que nuestra memoria sabe hacer
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<any>;
  googleLogin: (token: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  verify2FALogin: (email: string, token: string) => Promise<void>;
  updatePreferences: (preferences: any) => Promise<void>;
  // ⚡ NUEVA HABILIDAD: La orden de expulsar un dispositivo
  logoutDevice: (sessionId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  // ⚡ CORREGIDO: Ahora busca 'auth_token'
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Si el servidor nos pide el código de 6 números, paramos aquí
      if (response.data.requires2FA) {
        set({ isLoading: false });
        return response.data;
      }

      const { token, user } = response.data;
      // ⚡ CORREGIDO: Ahora guarda 'auth_token'
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, token, isAuthenticated: true, isLoading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al iniciar sesión',
        isLoading: false 
      });
      throw error;
    }
  },

  googleLogin: async (googleToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/google', { token: googleToken });
      
      if (response.data.requires2FA) {
        set({ isLoading: false });
        return response.data;
      }

      const { token, user } = response.data;
      // ⚡ CORREGIDO: Ahora guarda 'auth_token'
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, token, isAuthenticated: true, isLoading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al iniciar sesión con Google',
        isLoading: false 
      });
      throw error;
    }
  },

  verify2FALogin: async (email: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/2fa/verify-login', { email, token });
      const { token: authToken, user } = response.data;
      // ⚡ CORREGIDO: Ahora guarda 'auth_token'
      localStorage.setItem('auth_token', authToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      set({ user, token: authToken, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Código incorrecto',
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user } = response.data;
      // ⚡ CORREGIDO: Ahora guarda 'auth_token'
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al registrar',
        isLoading: false 
      });
      throw error;
    }
  },

  logout: () => {
    // ⚡ CORREGIDO: Ahora borra 'auth_token'
    localStorage.removeItem('auth_token');
    delete api.defaults.headers.common['Authorization'];
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    // ⚡ CORREGIDO: Ahora busca 'auth_token'
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me');
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      // ⚡ CORREGIDO: Ahora borra 'auth_token'
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/auth/preferences', preferences);
      set({ user: response.data });
    } catch (error: any) {
      console.error("Error al actualizar preferencias", error);
      throw error;
    }
  },

  // ⚡ LA MAGIA DE EXPULSAR DISPOSITIVOS
  logoutDevice: async (sessionId: string) => {
    try {
      // 1. Le decimos al servidor: "Borra esta sesión exacta"
      await api.delete(`/auth/sessions/${sessionId}`);
      // 2. Volvemos a pedirle los datos de usuario al servidor para que la lista se refresque sola
      const { loadUser } = get();
      if(loadUser) await loadUser(); 
    } catch (error) {
      console.error("Error al cerrar sesión remota", error);
    }
  }
}));