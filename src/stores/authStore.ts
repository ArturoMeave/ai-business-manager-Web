import { create } from 'zustand';
import { api } from '../services/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Funciones de Acceso
  login: (email: string, password: string) => Promise<any>;
  googleLogin: (token: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  
  // Seguridad y Preferencias
  verify2FALogin: (email: string, token: string) => Promise<void>;
  updatePreferences: (preferences: any) => Promise<void>;
  logoutDevice: (sessionId: string) => Promise<void>;
  
  // Recuperación de Contraseña
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,

  // 🚪 Inicio de Sesión Estándar
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.requires2FA) {
        set({ isLoading: false });
        return response.data;
      }

      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      // Inyectamos el token en la API para futuras peticiones
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

  // 🌐 Inicio de Sesión con Google
  googleLogin: async (googleToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/google', { token: googleToken });
      
      if (response.data.requires2FA) {
        set({ isLoading: false });
        return response.data;
      }

      const { token, user } = response.data;
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

  // 📝 Registro de Usuario
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user } = response.data;
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

  // 👋 Cierre de Sesión Completo
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor, limpiando localmente...");
    } finally {
      localStorage.removeItem('auth_token');
      // Limpiamos el cartero de la API
      delete api.defaults.headers.common['Authorization'];
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  // 🔄 Cargar Usuario al recargar la página
  loadUser: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me');
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  // 🔐 Verificación de 2FA
  verify2FALogin: async (email: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/2fa/verify-login', { email, token });
      const { token: authToken, user } = response.data;
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

  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/auth/preferences', preferences);
      set({ user: response.data, error: null });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "No se pudieron guardar las preferencias" });
      throw error;
    }
  },

  logoutDevice: async (sessionId: string) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      const { loadUser } = get();
      if(loadUser) await loadUser(); 
    } catch (error) {
      console.error("Error al cerrar sesión remota", error);
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/forgot-password', { email });
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al enviar el correo',
        isLoading: false 
      });
      throw error;
    }
  },

  resetPassword: async (token: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Enlace inválido o caducado',
        isLoading: false 
      });
      throw error;
    }
  }
}));