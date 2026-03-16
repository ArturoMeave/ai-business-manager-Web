import axios, { AxiosError } from "axios";

// Usamos variables de entorno para producción, con la URL de Render correcta como fallback
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://ai-business-manager-backend.onrender.com/api";

class ApiService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Interceptor para enviar el token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Interceptor para detectar si la sesión caducó
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("auth_token");
        }
        return Promise.reject(error);
      },
    );
  }

  get instance() {
    return this.api;
  }
}

export const apiService = new ApiService();
export const api = apiService.instance;
