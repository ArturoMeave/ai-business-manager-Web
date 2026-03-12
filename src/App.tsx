import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './stores/themeStore'; 
import { useAuthStore } from './stores/authStore'; 

// Componentes de Autenticación
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// Layout y Páginas
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

// 🎨 AuthWrapper (Diseño premium para auth)
const AuthWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA] dark:bg-[#050505] relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
    <div className="relative z-10 w-full flex justify-center">
      {children}
    </div>
  </div>
);

// 🛡️ ProtectedRoute (Solo para usuarios con sesión)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return null; // Evita parpadeos mientras carga
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>; 
};

// 🛡️ PublicRoute (Solo para usuarios SIN sesión activa)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default function App() {
  const { theme } = useThemeStore();
  const { loadUser, isAuthenticated } = useAuthStore();

  // ⚡ SE CARGA UNA SOLA VEZ AL INICIO
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // 🌗 Lógica de Temas
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
          
          {/* Rutas Públicas (Login, Registro, Password) */}
          <Route path="/login" element={<PublicRoute><AuthWrapper><LoginForm /></AuthWrapper></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><AuthWrapper><RegisterForm /></AuthWrapper></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><AuthWrapper><ForgotPassword /></AuthWrapper></PublicRoute>} />
          <Route path="/reset-password/:resettoken" element={<PublicRoute><AuthWrapper><ResetPassword /></AuthWrapper></PublicRoute>} />
          
          {/* Rutas Protegidas (Dashboard y demás) */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:id" element={<TaskDetails />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/ai-chat" element={<AiChat />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* Redirección Inteligente */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}