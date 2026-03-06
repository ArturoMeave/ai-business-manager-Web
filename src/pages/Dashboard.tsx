import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useClientStore } from '../stores/clientStore';
import { useTaskStore } from '../stores/taskStores';
import { api } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CheckSquare, TrendingUp, Target, Plus, ArrowRight, Clock, Calendar, Briefcase, Building, UserCircle, Crown, CheckCircle2, Bell, AlertCircle, PieChart } from 'lucide-react';
import type { Task } from '../types';
import type { DashboardData } from '../types';
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const formatMoney = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount || 0);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { clients, fetchClients } = useClientStore();
  const { tasks, fetchTasks, updateTask } = useTaskStore(); 

  const [greeting, setGreeting] = useState('Hola');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeChart, setActiveChart] = useState<'finance' | 'clients'>('finance');

  useEffect(() => {
    fetchClients();
    fetchTasks();
    api.get('/dashboard').then(res => setDashboardData(res.data.data)).catch(console.error);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 20) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, [fetchClients, fetchTasks]);

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const todayTasks = pendingTasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0]);
  
  // 🧹 ADIÓS ANY: Leemos las preferencias de forma segura
  const monthlyGoal = user?.preferences?.monthlyGoal || 0;
  const currentIncome = dashboardData?.kpis?.monthlyIncome || 0;
  const progressPercent = monthlyGoal > 0 ? Math.min((currentIncome / monthlyGoal) * 100, 100) : 0;

  // 🧹 ADIÓS ANY: Leemos el rol de forma segura
  const userRole = user?.preferences?.role || 'god_mode';
  const getRoleIcon = () => {
    switch(userRole) {
      case 'worker': return <UserCircle className="w-5 h-5 text-neutral-400" />;
      case 'freelancer': return <Briefcase className="w-5 h-5 text-neutral-400" />;
      case 'company': return <Building className="w-5 h-5 text-neutral-400" />;
      default: return <Crown className="w-5 h-5 text-yellow-500" />;
    }
  };

  const handleCompleteTask = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation(); 
    await updateTask(task._id, { status: 'completed' });
  };

  // NOTIFICACIONES
  const notifications = [];
  if (todayTasks.length > 0) notifications.push({ id: 1, title: 'Agenda Activa', text: `Tienes ${todayTasks.length} tareas que caducan hoy.`, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' });
  if (progressPercent >= 100) notifications.push({ id: 2, title: '¡Meta Superada!', text: 'Has alcanzado tu objetivo de facturación mensual.', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' });
  if (pendingTasks.length > 10) notifications.push({ id: 3, title: 'Alta carga de trabajo', text: `Se acumulan ${pendingTasks.length} tareas pendientes. ¡Prioriza!`, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' });
  if (dashboardData && dashboardData.kpis.monthlyExpenses > dashboardData.kpis.monthlyIncome) notifications.push({ id: 4, title: 'Alerta Financiera', text: 'Tus gastos superan tus ingresos este mes.', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' });

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      
      {/* CABECERA Y CAMPANA */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-neutral-200/60 dark:border-neutral-800/60 transition-colors relative">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            {getRoleIcon()}
            <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Centro de Mando</span>
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tight transition-colors">
            {greeting}, {user?.name?.split(' ')[0] || 'Líder'}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 font-light text-lg transition-colors">Aquí tienes el resumen de tu espacio de trabajo hoy.</p>
        </div>

        <div className="flex items-center gap-3">
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className="p-3 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shadow-sm relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border-2 border-white dark:border-[#121212]"></span>}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#121212]">
                    <h4 className="font-bold text-neutral-900 dark:text-white">Notificaciones</h4>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-neutral-500 dark:text-neutral-400 text-sm">No tienes avisos nuevos. ¡Todo en orden!</div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors mb-1 cursor-default">
                          <div className="flex items-start space-x-3">
                            <div className={`mt-0.5 p-1.5 rounded-lg ${notif.bg} ${notif.color}`}><AlertCircle className="w-4 h-4" /></div>
                            <div>
                              <p className="text-sm font-bold text-neutral-900 dark:text-white">{notif.title}</p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">{notif.text}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => navigate('/tasks')} className="px-4 py-2.5 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shadow-sm hidden sm:flex items-center">
            <CheckSquare className="w-4 h-4 mr-2 opacity-50" /> Tarea
          </button>
          <button onClick={() => navigate('/finance')} className="px-4 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-sm flex items-center">
            <Plus className="w-4 h-4 mr-2" /> Movimiento
          </button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* WIDGET 1: TAREAS */}
        <motion.div variants={itemVariants} onClick={() => navigate('/tasks')} className="md:col-span-4 bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm p-6 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><CheckSquare className="w-24 h-24 text-primary-900 dark:text-white" /></div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400"><CheckSquare className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Tareas Activas</h3>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-bold text-neutral-900 dark:text-white tracking-tighter transition-colors">{pendingTasks.length}</span>
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">pendientes</span>
          </div>
        </motion.div>

        {/* WIDGET 2: CLIENTES */}
        <motion.div variants={itemVariants} onClick={() => navigate('/clients')} className="md:col-span-4 bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm p-6 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Users className="w-24 h-24 text-emerald-900 dark:text-emerald-500" /></div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><Users className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Directorio</h3>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-bold text-neutral-900 dark:text-white tracking-tighter transition-colors">{clients.length}</span>
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">clientes registrados</span>
          </div>
        </motion.div>

        {/* WIDGET 3: META FINANCIERA */}
        <motion.div variants={itemVariants} onClick={() => navigate('/finance')} className="md:col-span-4 bg-neutral-900 dark:bg-[#1c1c1c] rounded-[2rem] shadow-md p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden text-white dark:text-white border border-transparent dark:border-neutral-800/60">
          <div className="absolute top-0 right-0 p-6 opacity-10 dark:opacity-[0.03] group-hover:scale-110 transition-transform"><Target className="w-24 h-24" /></div>
          <div className="flex items-center space-x-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-neutral-800 flex items-center justify-center backdrop-blur-sm"><TrendingUp className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold">Progreso Mensual</h3>
          </div>
          
          <div className="relative z-10 mb-4">
            <span className="text-4xl font-bold tracking-tighter">{formatMoney(currentIncome)}</span>
            {monthlyGoal > 0 && <span className="text-sm font-medium opacity-70 ml-2">/ {formatMoney(monthlyGoal)}</span>}
          </div>

          {monthlyGoal > 0 ? (
            <div className="relative z-10">
              <div className="flex justify-between text-xs font-semibold opacity-80 mb-2">
                <span>Meta mensual</span>
                <span>{progressPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-black/20 dark:bg-neutral-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${progressPercent >= 100 ? 'bg-emerald-400 dark:bg-emerald-500' : 'bg-white dark:bg-neutral-300'}`}
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 text-xs opacity-70 font-light relative z-10">Configura tu meta mensual en Ajustes.</div>
          )}
        </motion.div>

        {/* WIDGET GIGANTE 4: EL GRÁFICO */}
        <motion.div variants={itemVariants} className="md:col-span-12 bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm p-8 transition-colors">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center tracking-tight">
                <PieChart className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" /> Rendimiento Histórico
              </h3>
              <p className="text-sm text-neutral-500 mt-1 font-light">Evolución de los últimos 6 meses</p>
            </div>
            
            {/* INTERRUPTOR */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <button 
                onClick={() => setActiveChart('finance')}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeChart === 'finance' ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
              >
                Finanzas
              </button>
              <button 
                onClick={() => setActiveChart('clients')}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeChart === 'clients' ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
              >
                Nuevos Clientes
              </button>
            </div>
          </div>
          
          <div className="h-72 w-full">
            {!dashboardData?.chartData ? (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">Cargando gráfico...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'finance' ? (
                  <AreaChart data={dashboardData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIngreso" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" strokeOpacity={0.1} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dx={-10} tickFormatter={(value) => `${value}€`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold' }} 
                      itemStyle={{ color: '#fff' }}
                      formatter={(value) => [`${value} €`]}
                    />
                    <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIngreso)" />
                    <Area type="monotone" dataKey="gastos" name="Gastos" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorGasto)" />
                  </AreaChart>
                ) : (
                  <AreaChart data={dashboardData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorClientes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" strokeOpacity={0.1} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dx={-10} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold' }} 
                      itemStyle={{ color: '#fff' }}
                      formatter={(value) => [`${value} clientes`, 'Nuevos Clientes']}
                    />
                    <Area type="monotone" dataKey="nuevosClientes" name="Nuevos Clientes" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorClientes)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

      </motion.div>

      {/* AGENDA DEL DÍA */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm p-8 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center tracking-tight">
            <Calendar className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" /> Agenda de Hoy
          </h3>
          <button onClick={() => navigate('/tasks')} className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Ver todo</button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="py-8 text-center bg-neutral-50/50 dark:bg-neutral-800/30 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">No tienes tareas programadas para hoy.</p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">¡Aprovecha para adelantar trabajo o descansar!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayTasks.sort((a, b) => (a.dueTime || '24:00').localeCompare(b.dueTime || '24:00')).map(task => (
              <div 
                key={task._id} 
                onClick={() => navigate(`/tasks/${task._id}`)} 
                className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all cursor-pointer group bg-white dark:bg-[#1a1a1a]"
              >
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={(e) => handleCompleteTask(e, task)} 
                    className="flex-shrink-0 group/btn relative"
                  >
                    <div className="w-5 h-5 rounded border-2 border-neutral-300 dark:border-neutral-600 group-hover/btn:border-emerald-500 transition-colors"></div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 absolute top-0 left-0 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </button>
                  
                  <div className="flex flex-col items-center justify-center min-w-[45px]">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">{task.dueTime || '--:--'}</span>
                  </div>
                  
                  <div className={`w-1 h-8 rounded-full ${task.priority === 'high' ? 'bg-rose-500' : 'bg-primary-500'}`}></div>
                  
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate max-w-[200px]">{task.title}</h4>
                    {task.client && <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">Cliente asignado</p>}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="w-5 h-5 text-neutral-400 dark:text-neutral-500" /></div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

    </div>
  );
}