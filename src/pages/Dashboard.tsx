import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useFinanceStore } from '../stores/financeStore';
import { useTaskStore } from '../stores/taskStores';
import { useClientStore } from '../stores/clientStore';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Clock, Plus, Target, CheckSquare, Users, FileText, Zap, BarChart3, UsersRound, LineChart } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

import TaskModal from '../components/crm/TaskModal';
import FinanceModal from '../components/crm/FinanceModal';
import ClientModal from '../components/crm/ClientModal';

const formatMoney = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount || 0);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { summary: financeSummary, finances, fetchFinances, fetchSummary } = useFinanceStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { clients, fetchClients } = useClientStore();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  
  const [chartView, setChartView] = useState<'finances' | 'clients'>('finances');
  const [chartStyle, setChartStyle] = useState<'bar' | 'area'>('bar');

  useEffect(() => {
    fetchSummary();
    fetchFinances();
    fetchTasks();
    fetchClients();
  }, [fetchSummary, fetchFinances, fetchTasks, fetchClients]);

  const dashboardTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    return tasks.filter(t => {
      if (t.status === 'completed') return false; 
      if (!t.dueDate) return true; 
      if (t.dueDate <= todayStr) return true; 
      if (t.dueDate > todayStr && t.priority === 'high') return true; 
      return false; 
    }).slice(0, 6); 
  }, [tasks]);

  const financeChartData = useMemo(() => {
    const groupedData: Record<string, { date: string, income: number, expense: number }> = {};
    [...finances].reverse().slice(-14).forEach(item => {
      const dateKey = new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      if (!groupedData[dateKey]) groupedData[dateKey] = { date: dateKey, income: 0, expense: 0 };
      if (item.type === 'ingreso') groupedData[dateKey].income += item.amount;
      else groupedData[dateKey].expense += item.amount;
    });
    return Object.values(groupedData).slice(-7); 
  }, [finances]);

  const clientChartData = useMemo(() => {
    const data = [];
    let currentTotal = clients.length;
    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - (i * 5)); 
      data.push({
        date: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        clientes: Math.max(0, currentTotal - Math.floor(Math.random() * 3)) 
      });
      currentTotal = Math.max(0, currentTotal - 1);
    }
    return data;
  }, [clients]);

  const totalClients = clients.length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 transition-colors duration-300">
      
      {/* 🚀 CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {getGreeting()}, <span className="text-emerald-600 dark:text-emerald-400">{user?.name?.split(' ')[0]}</span>.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-neutral-500 dark:text-neutral-400 font-medium mt-1">
            Aquí tienes el resumen interactivo de tu negocio.
          </motion.p>
        </div>
      </div>

      {/* 📊 FILA 1: KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div onClick={() => navigate('/finance')} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm flex flex-col justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] transition-colors group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Beneficio Neto</p>
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-md"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
          </div>
          <h3 className="text-2xl font-black text-neutral-900 dark:text-white">{formatMoney(financeSummary?.netProfit || 0)}</h3>
        </motion.div>

        <motion.div onClick={() => navigate('/finance')} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm flex flex-col justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] transition-colors group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">Ingresos</p>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md"><ArrowUpRight className="w-4 h-4 text-blue-600" /></div>
          </div>
          <h3 className="text-2xl font-black text-neutral-900 dark:text-white">{formatMoney(financeSummary?.totalIncome || 0)}</h3>
        </motion.div>

        <motion.div onClick={() => navigate('/finance')} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm flex flex-col justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] transition-colors group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider group-hover:text-rose-600 transition-colors">Gastos</p>
            <div className="p-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-md"><ArrowDownRight className="w-4 h-4 text-rose-600" /></div>
          </div>
          <h3 className="text-2xl font-black text-neutral-900 dark:text-white">{formatMoney(financeSummary?.totalExpenses || 0)}</h3>
        </motion.div>

        <motion.div onClick={() => navigate('/clients')} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm flex flex-col justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] transition-colors group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider group-hover:text-amber-600 transition-colors">Clientes Activos</p>
            <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-md"><Users className="w-4 h-4 text-amber-600" /></div>
          </div>
          <h3 className="text-2xl font-black text-neutral-900 dark:text-white">{totalClients}</h3>
        </motion.div>
      </div>

      {/* ⚡ FILA 2: GRÁFICA MULTIUSO Y ACCIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICA */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm p-6 flex flex-col min-h-[350px] transition-colors">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center">
              <Target className="w-4 h-4 mr-2" /> Rendimiento Global
            </h3>
            
            <div className="flex items-center gap-2">
              <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                <button onClick={() => setChartView('finances')} className={`flex items-center px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${chartView === 'finances' ? 'bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>
                  <BarChart3 className="w-4 h-4 mr-2" /> Finanzas
                </button>
                <button onClick={() => setChartView('clients')} className={`flex items-center px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${chartView === 'clients' ? 'bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>
                  <UsersRound className="w-4 h-4 mr-2" /> Clientes
                </button>
              </div>

              {chartView === 'finances' && (
                <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                  <button onClick={() => setChartStyle('bar')} title="Gráfico de Barras" className={`p-1.5 rounded-lg transition-all ${chartStyle === 'bar' ? 'bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setChartStyle('area')} title="Gráfico de Área" className={`p-1.5 rounded-lg transition-all ${chartStyle === 'area' ? 'bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>
                    <LineChart className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 w-full h-full">
            {chartView === 'finances' ? (
              financeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartStyle === 'bar' ? (
                    <BarChart data={financeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(value) => `€${value}`} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(20,20,20,0.9)', color: '#fff' }} formatter={(value: any) => formatMoney(Number(value))} />
                      <Bar dataKey="income" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <AreaChart data={financeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(value) => `€${value}`} />
                      <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.1)' }} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(20,20,20,0.9)', color: '#fff' }} formatter={(value: any) => formatMoney(Number(value))} />
                      <Area type="monotone" dataKey="income" name="Ingresos" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                      <Area type="monotone" dataKey="expense" name="Gastos" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-400 text-sm">Registra movimientos para ver tu gráfica</div>
              )
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clientChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                  <defs>
                    <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.1)' }} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(20,20,20,0.9)', color: '#fff' }} />
                  <Area type="monotone" dataKey="clientes" name="Total Clientes" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorClients)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* ⚡ BOTONES DE ACCIÓN RÁPIDA (Arreglado el Modo Claro) */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-[#121212] border border-neutral-200/60 dark:border-neutral-800/60 rounded-[2rem] p-6 shadow-sm flex flex-col h-[350px] transition-colors">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-6 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-yellow-500" /> Acciones Rápidas
          </h3>
          <div className="flex flex-col justify-center gap-4 flex-1">
            <button onClick={() => setIsFinanceModalOpen(true)} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-[#1A1A1A] hover:bg-neutral-100 dark:hover:bg-[#222] rounded-2xl text-neutral-900 dark:text-white font-bold transition-all border border-neutral-200/60 dark:border-neutral-800/60 hover:scale-[1.02] group">
              <span className="flex items-center"><FileText className="w-5 h-5 mr-3 text-emerald-600 dark:text-emerald-400" /> Nuevo Movimiento</span>
              <Plus className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity text-neutral-500 dark:text-neutral-400" />
            </button>
            <button onClick={() => setIsTaskModalOpen(true)} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-[#1A1A1A] hover:bg-neutral-100 dark:hover:bg-[#222] rounded-2xl text-neutral-900 dark:text-white font-bold transition-all border border-neutral-200/60 dark:border-neutral-800/60 hover:scale-[1.02] group">
              <span className="flex items-center"><CheckSquare className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" /> Nueva Tarea</span>
              <Plus className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity text-neutral-500 dark:text-neutral-400" />
            </button>
            <button onClick={() => setIsClientModalOpen(true)} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-[#1A1A1A] hover:bg-neutral-100 dark:hover:bg-[#222] rounded-2xl text-neutral-900 dark:text-white font-bold transition-all border border-neutral-200/60 dark:border-neutral-800/60 hover:scale-[1.02] group">
              <span className="flex items-center"><Users className="w-5 h-5 mr-3 text-amber-600 dark:text-amber-400" /> Añadir Cliente</span>
              <Plus className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity text-neutral-500 dark:text-neutral-400" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* 📋 FILA 3: AGENDA INTELIGENTE */}
      <div className="grid grid-cols-1 gap-6 pt-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 p-6 sm:p-8 shadow-sm transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center">
              <Clock className="w-5 h-5 mr-2 text-neutral-400" /> Tu Agenda
              <span className="ml-3 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded text-[10px]">Filtrado Inteligente</span>
            </h3>
            <button onClick={() => navigate('/tasks')} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">Ver todo</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardTasks.length === 0 ? (
              <div className="md:col-span-2 text-center py-8 text-neutral-500">No hay tareas pendientes en tu radar. ¡Día libre! 🎉</div>
            ) : (
              dashboardTasks.map(task => {
                let label = '';
                const todayStr = new Date().toISOString().split('T')[0];
                if (!task.dueDate) label = 'Sin fecha';
                else if (task.dueDate < todayStr) label = 'Atrasada';
                else if (task.dueDate === todayStr) label = 'Hoy';
                else label = 'Futura Urgente';

                return (
                  <div key={task._id} onClick={() => navigate(`/tasks/${task._id}`)} className="flex flex-col justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-100 dark:border-neutral-800/50 cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 mr-3 shrink-0 ${task.priority === 'high' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 transition-colors">{task.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pl-5">
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'En algún momento'}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        label === 'Atrasada' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 
                        label === 'Hoy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                        'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}>
                        {label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
      <FinanceModal isOpen={isFinanceModalOpen} onClose={() => setIsFinanceModalOpen(false)} />
      <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />
      
    </div>
  );
}