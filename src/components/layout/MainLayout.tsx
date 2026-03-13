import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Menu, X, Bell } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../stores/authStore';
import { useTaskStore } from '../../stores/taskStores';

export default function MainLayout() {
    const location = useLocation();

    // Decide qué título mostrar según la URL
    const getPageTitle = (pathname: string) => {
        if (pathname.startsWith('/clients')) return 'Cartera de Clientes';
        if (pathname.startsWith('/tasks')) return 'Gestión de Tareas';
        if (pathname.startsWith('/finance')) return 'Finanzas y Facturación';
        if (pathname.startsWith('/ai-chat')) return 'AI Business Manager';
        if (pathname.startsWith('/settings')) return 'Ajustes de Cuenta';
        return 'Panel de Control'; // El nombre por defecto para la ruta /dashboard
    }

    const { isAuthenticated } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Notificaciones
    const { tasks, fetchTasks } = useTaskStore();
    const [alerts, setAlerts] = useState<{id: string, title: string, message: string, type: 'warning'|'info'}[]>([]);
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isAuthenticated) fetchTasks();
    }, [isAuthenticated, fetchTasks]);

    useEffect(() => {
        if (tasks.length === 0) return;

        const checkReminders = () => {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

            const newAlerts: typeof alerts = [];

            tasks.forEach(task => {
                if (task.status === 'completed') return;

                if (task.dueDate === todayStr) {
                    if (task.dueTime) {
                        const [tHour, tMin] = task.dueTime.split(':').map(Number);
                        const taskTimeInMinutes = tHour * 60 + tMin;
                        const diff = taskTimeInMinutes - currentTimeInMinutes;
                        
                        // Si falta exactamente 1 hora (entre 1 y 60 min)
                        if (diff > 0 && diff <= 60) {
                            const id = `time-${task._id}`;
                            if (!dismissedAlerts.has(id)) {
                                newAlerts.push({
                                    id,
                                    title: '¡Hora de actuar!',
                                    message: `Tu tarea "${task.title}" está programada para las ${task.dueTime}.`,
                                    type: 'warning'
                                });
                            }
                        }
                    } else {
                        // Es para hoy, pero no tiene hora
                        const id = `day-${task._id}`;
                        if (!dismissedAlerts.has(id)) {
                            newAlerts.push({
                                id,
                                title: 'Último día',
                                message: `Recuerda completar: "${task.title}" antes de que acabe el día.`,
                                type: 'info'
                            });
                        }
                    }
                }
            });

            setAlerts(newAlerts);
        };

        checkReminders();
        const interval = setInterval(checkReminders, 60000); // Revisa las tareas cada minuto
        return () => clearInterval(interval);
    }, [tasks, dismissedAlerts]);

    const dismissAlert = (id: string) => {
        setDismissedAlerts(prev => new Set(prev).add(id));
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
      <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0a0a0a] transition-colors duration-300 overflow-hidden relative">
        
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)} />
        )}

        <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden w-full">
          
          <header className="h-16 md:h-20 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-100/50 dark:border-neutral-800/60 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 transition-colors duration-300">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 rounded-lg text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            
            <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-100 tracking-tight md:hidden">
              {getPageTitle(location.pathname)}
            </h2>
            
            <div className="w-6 md:hidden"></div>
            
            <h2 className="hidden md:block text-xl font-semibold text-gray-800 dark:text-neutral-100 tracking-tight">
              {getPageTitle(location.pathname)}
            </h2>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            <div className="max-w-7xl mx-auto animate-fade-in-up">
              <Outlet />
            </div>
          </main>

        </div>

        {/* notificaciones flotantes */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <AnimatePresence>
            {alerts.map(alert => (
              <motion.div 
                key={alert.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`w-80 p-4 rounded-2xl shadow-xl border flex items-start gap-4 ${
                  alert.type === 'warning' 
                    ? 'bg-rose-50 dark:bg-[#1a1a1a] border-rose-200 dark:border-rose-900/50' 
                    : 'bg-emerald-50 dark:bg-[#1a1a1a] border-emerald-200 dark:border-emerald-900/50'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${alert.type === 'warning' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-500' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500'}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold truncate ${alert.type === 'warning' ? 'text-rose-900 dark:text-white' : 'text-emerald-900 dark:text-white'}`}>
                    {alert.title}
                  </h4>
                  <p className="text-xs mt-1 text-neutral-600 dark:text-neutral-400 font-medium">
                    {alert.message}
                  </p>
                </div>
                <button onClick={() => dismissAlert(alert.id)} className="shrink-0 p-1 rounded-lg text-neutral-400 hover:bg-white/50 dark:hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    );
}