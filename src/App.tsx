import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './stores/themeStore'; // El cerebro del tema
import { useAuthStore } from './stores/authStore'; // ⚡ NUEVO: Importamos la tienda de sesión

import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import Finance from './pages/Finance';
import AiChat from './pages/AiChat';
import Settings from './pages/Settings';
import Landing from './pages/Landing';

// ⚡ Contenedor para centrar el Login y el Registro de forma elegante
const AuthWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA] dark:bg-[#050505] relative overflow-hidden">
    {/* Resplandor de fondo premium */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
    <div className="relative z-10 w-full flex justify-center">
      {children}
    </div>
  </div>
);

export default function App() {
  const { theme } = useThemeStore();
  
  // ⚡ NUEVO: Traemos la función para cargar al usuario
  const { loadUser } = useAuthStore();

  // ⚡ NUEVO: Este disparador se ejecuta UNA SOLA VEZ nada más encender la web.
  // Es el que lee el ticket 'auth_token' guardado y le dice a tu app quién eres.
  useEffect(() => {
    loadUser();
  }, []);

  // MAGIA DEL MODO OSCURO
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      root.classList.remove('light', 'dark');
      if (theme === 'system') {
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      } else {
        root.classList.add(theme);
      }
    };

    applyTheme();

    const handler = () => { if (theme === 'system') applyTheme(); };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          
          {/* APLICAMOS EL WRAPPER A LAS RUTAS DE AUTENTICACIÓN */}
          <Route path="/login" element={<AuthWrapper><LoginForm /></AuthWrapper>} />
          <Route path="/register" element={<AuthWrapper><RegisterForm /></AuthWrapper>} />
          
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:id" element={<TaskDetails />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/ai-chat" element={<AiChat />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}