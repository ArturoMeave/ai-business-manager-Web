import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Phone, Building2, Briefcase, DollarSign, Clock, CheckCircle2, Edit2, Trash2, Target, FileText, KanbanSquare, LayoutList, Calendar, Plus, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useClientStore } from '../stores/clientStore';
import { useTaskStore } from '../stores/taskStores';
import { useFinanceStore } from '../stores/financeStore'; 
import { useAuthStore } from '../stores/authStore';
import ClientModal from '../components/crm/ClientModal';
import TaskModal from '../components/crm/TaskModal';
import FinanceModal from '../components/crm/FinanceModal'; 
import type { Client, TaskStatus, FinanceType } from '../types';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const formatMoney = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount || 0);

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { clients, fetchClients, deleteClient } = useClientStore();
  const { clientTasks: tasks, fetchClientTasks, updateTask, isLoading: isTasksLoading } = useTaskStore();
  const { finances, fetchFinances, deleteFinance } = useFinanceStore(); 
  const { user } = useAuthStore(); 
  
  const [client, setClient] = useState<Client | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [financeConfig, setFinanceConfig] = useState<{type: FinanceType, desc: string}>({type: 'ingreso', desc: ''});

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); 
  
  const [activeTab, setActiveTab] = useState<'tasks' | 'finances'>('tasks');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban'); 
  
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsInitializing(true);
      if (clients.length === 0) await fetchClients();
      if (finances.length === 0) await fetchFinances(); 
      if (id) await fetchClientTasks(id); 
      setIsInitializing(false);
    };
    loadData();
  }, [id, clients.length, finances.length, fetchClients, fetchFinances, fetchClientTasks]);

  useEffect(() => {
    if (clients.length > 0 && id) {
      const found = clients.find(c => c._id === id);
      setClient(found || null);
    }
  }, [clients, id]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar a este cliente? Perderás su contacto en la base de datos.')) {
      if (client) {
        await deleteClient(client._id);
        navigate('/clients');
      }
    }
  };

  const handleDeleteFinance = async (financeId: string) => {
    if (window.confirm('¿Eliminar este registro? Esta acción se descontará del balance de este cliente y de tus finanzas generales.')) {
      await deleteFinance(financeId);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropKanban = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      const task = tasks.find(t => t._id === draggedTaskId);
      if (task && task.status !== newStatus) {
        await updateTask(draggedTaskId, { status: newStatus });
      }
      setDraggedTaskId(null);
    }
  };

  const openFinance = (type: FinanceType) => {
    setFinanceConfig({ type, desc: `Operación con ${client?.companyName || client?.name} - ` });
    setIsFinanceModalOpen(true);
  };

  const handleDownloadReport = async () => {
    if (!client) return;
    setIsGeneratingPDF(true);
    try {
      const reportElement = document.getElementById('client-report-template');
      if (!reportElement) return;
      
      const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth(); 
      const pageHeight = pdf.internal.pageSize.getHeight(); 
      
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight; 
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Dossier_${client.companyName || client.name}.pdf`);
    } catch (error) {
      console.error("Error generando PDF", error);
      alert("Hubo un error al generar el PDF del historial.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isInitializing) {
    return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white"></div></div>;
  }

  if (!client) {
    return (
      <div className="text-center py-32 max-w-md mx-auto">
        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6"><Building2 className="w-8 h-8 text-neutral-400 dark:text-neutral-500" /></div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Cliente no encontrado</h2>
        <button onClick={() => navigate('/clients')} className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all">Volver a la cartera</button>
      </div>
    );
  }

  const clientFinances = finances.filter(f => {
    const fClientId = typeof f.client === 'object' ? (f.client as any)?._id : f.client;
    return fClientId === client._id;
  });

  const completedFinances = clientFinances.filter(f => f.status === 'completado');
  const totalIngresos = completedFinances.filter(f => f.type === 'ingreso').reduce((acc, f) => acc + f.amount, 0);
  const totalGastos = completedFinances.filter(f => f.type === 'gasto').reduce((acc, f) => acc + f.amount, 0);
  const balanceNeto = totalIngresos - totalGastos;

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const totalValue = (client as any).totalValue || 0;
  const progressPercent = totalValue > 0 ? Math.min((totalIngresos / totalValue) * 100, 100) : 0;

  const kanbanColumns: { id: TaskStatus; title: string; count: number }[] = [
    { id: 'pending', title: 'Pendientes', count: tasks.filter(t => t.status === 'pending').length },
    { id: 'in progress', title: 'En Curso', count: tasks.filter(t => t.status === 'in progress').length },
    { id: 'completed', title: 'Completadas', count: tasks.filter(t => t.status === 'completed').length }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 pb-12 max-w-6xl mx-auto transition-colors duration-300 relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <button onClick={() => navigate('/clients')} className="group flex items-center text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
          <div className="p-1 rounded-md group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800 transition-colors mr-1"><ArrowLeft className="w-4 h-4" /></div>
          Volver a clientes
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button disabled={isGeneratingPDF || (tasks.length === 0 && clientFinances.length === 0)} onClick={handleDownloadReport} className="flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-colors border bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm disabled:opacity-50">
            {isGeneratingPDF ? <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <FileText className="w-4 h-4 mr-2" />}
            Descargar Dossier
          </button>
          <button onClick={() => setIsClientModalOpen(true)} className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm">
            <Edit2 className="w-4 h-4 mr-2 opacity-70" /> Editar
          </button>
          <button onClick={handleDelete} className="flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#121212] p-8 rounded-[2rem] shadow-sm border border-neutral-200/60 dark:border-neutral-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neutral-50 dark:bg-neutral-800/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex items-center space-x-6 relative z-10">
          <div className="w-24 h-24 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-4xl shadow-md border-4 border-white dark:border-[#121212] transition-colors">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight mb-3 transition-colors">{client.name}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-neutral-500 dark:text-neutral-400 font-medium">
              {client.companyName && <span className="flex items-center"><Building2 className="w-4 h-4 mr-1.5 opacity-70" /> {client.companyName}</span>}
              {client.email && <a href={`mailto:${client.email}`} className="flex items-center hover:text-neutral-900 dark:hover:text-white transition-colors underline-offset-4 hover:underline"><Mail className="w-4 h-4 mr-1.5 opacity-70" /> {client.email}</a>}
              {client.phone && <a href={`tel:${client.phone}`} className="flex items-center hover:text-neutral-900 dark:hover:text-white transition-colors underline-offset-4 hover:underline"><Phone className="w-4 h-4 mr-1.5 opacity-70" /> {client.phone}</a>}
            </div>
          </div>
        </div>
        <div className="px-4 py-1.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full text-sm font-semibold border border-neutral-200 dark:border-neutral-700 relative z-10 transition-colors">
          {client.category}
        </div>
      </div>

      {totalValue > 0 && (
        <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl shadow-sm border border-neutral-200/60 dark:border-neutral-800/60 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center">
              <Target className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-500" /> Progreso del Contrato / Proyecto
            </h3>
            <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400">
              {formatMoney(totalIngresos)} <span className="font-light opacity-60">/ {formatMoney(totalValue)}</span>
            </span>
          </div>
          <div className="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, delay: 0.2 }}
              className={`h-full rounded-full ${progressPercent >= 100 ? 'bg-emerald-500' : 'bg-emerald--600 dark:bg-emerald--500'}`}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA: KPIs LIMPIOS */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* ⚡ BALANCE NETO SIMPLIFICADO */}
          <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl shadow-sm border border-neutral-200/60 dark:border-neutral-800/60 relative overflow-hidden transition-colors">
            <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2 flex items-center">
              <DollarSign className="w-4 h-4 mr-1.5 opacity-70" /> Balance Neto
            </h3>
            <p className={`text-4xl font-bold tracking-tight ${balanceNeto >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
              {balanceNeto > 0 ? '+' : ''}{formatMoney(balanceNeto)}
            </p>
          </div>

          <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl shadow-sm border border-neutral-200/60 dark:border-neutral-800/60 relative overflow-hidden transition-colors">
            <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-1.5 opacity-70" /> Tareas Pendientes
            </h3>
            <div className="flex items-baseline space-x-2">
              <p className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">{pendingTasksCount}</p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (Pestañas Dinámicas) */}
        <div className="xl:col-span-9 flex flex-col">
          
          <div className="flex p-1.5 bg-neutral-100 dark:bg-[#121212] rounded-2xl mb-6 w-full sm:w-fit border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm">
            <button 
              onClick={() => setActiveTab('tasks')} 
              className={`flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'tasks' ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
            >
              <Briefcase className="w-4 h-4 mr-2" /> Flujo de Tareas
            </button>
            <button 
              onClick={() => setActiveTab('finances')} 
              className={`flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'finances' ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
            >
              <Wallet className="w-4 h-4 mr-2" /> Libro de Registros
            </button>
          </div>

          <div className="flex-1">
            
            {/* PESTAÑA 1: TAREAS */}
            {activeTab === 'tasks' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#121212] p-8 rounded-3xl shadow-sm border border-neutral-200/60 dark:border-neutral-800/60">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center tracking-tight">
                    Tablero del Proyecto
                  </h3>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => setIsTaskModalOpen(true)} className="flex items-center px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-sm font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm">
                      <Plus className="w-4 h-4 mr-1.5" /> Añadir Fase
                    </button>
                    <div className="hidden sm:flex items-center space-x-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                      <button onClick={() => setViewMode('kanban')} className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        <KanbanSquare className="w-4 h-4" />
                      </button>
                      <button onClick={() => setViewMode('list')} className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        <LayoutList className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {isTasksLoading ? (
                  <div className="p-8 text-center text-neutral-400 dark:text-neutral-500 text-sm">Cargando flujo de trabajo...</div>
                ) : tasks.length === 0 ? (
                  <div className="p-10 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-center bg-neutral-50/50 dark:bg-neutral-800/30">
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium mb-1">Proyecto en blanco.</p>
                    <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-4">Añade fases o tareas para organizar el trabajo con este cliente.</p>
                    <button onClick={() => setIsTaskModalOpen(true)} className="px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-sm font-bold shadow-sm">Crear primera tarea</button>
                  </div>
                ) : viewMode === 'kanban' ? (
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {kanbanColumns.map(column => (
                      <div key={column.id} onDragOver={handleDragOver} onDrop={(e) => handleDropKanban(e, column.id)} className="flex-1 min-w-[280px] bg-neutral-50/50 dark:bg-[#1a1a1a] rounded-2xl border border-neutral-200/60 dark:border-neutral-800 flex flex-col">
                        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                          <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center">
                            {column.id === 'pending' && <span className="w-2 h-2 rounded-full bg-neutral-400 mr-2"></span>}
                            {column.id === 'in progress' && <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>}
                            {column.id === 'completed' && <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>}
                            {column.title}
                          </h4>
                          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{column.count}</span>
                        </div>
                        <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[300px]">
                          <AnimatePresence>
                            {tasks.filter(t => t.status === column.id).map(task => (
                              <motion.div key={task._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} draggable onDragStart={(e: any) => handleDragStart(e, task._id)} onClick={() => navigate(`/tasks/${task._id}`)} className={`bg-white dark:bg-[#222] p-3.5 rounded-xl shadow-sm border transition-all cursor-grab active:cursor-grabbing hover:shadow-md ${draggedTaskId === task._id ? 'opacity-50 border-emerald--500' : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'}`}>
                                <h5 className={`font-semibold text-sm mb-2 ${task.status === 'completed' ? 'text-neutral-400 dark:text-neutral-500 line-through' : 'text-neutral-900 dark:text-white'}`}>{task.title}</h5>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-medium text-emerald-600 dark:text-emerald-500">{task.budget > 0 ? `${task.budget} €` : '—'}</span>
                                  {task.dueDate && <span className="text-neutral-400 flex items-center"><Calendar className="w-3 h-3 mr-1" />{new Date(task.dueDate).toLocaleDateString('es-ES', { day:'numeric', month:'short' })}</span>}
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div key={task._id} onClick={() => navigate(`/tasks/${task._id}`)} className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800/60 flex justify-between items-center hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                        <div className="flex items-center space-x-4">
                          {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-600" /> : <div className="w-5 h-5 rounded-full border-2 border-neutral-300 dark:border-neutral-600"></div>}
                          <p className={`font-medium ${task.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-white'}`}>{task.title}</p>
                        </div>
                        <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">{task.budget > 0 ? `${task.budget} €` : ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* PESTAÑA 2: EL LIBRO DE REGISTROS */}
            {activeTab === 'finances' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm overflow-hidden transition-colors">
                
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/30 dark:bg-[#1a1a1a] flex justify-between items-center">
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">Historial Financiero</h2>
                  <button onClick={() => openFinance('ingreso')} className="flex items-center px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-sm font-bold shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                    <Plus className="w-4 h-4 mr-1.5" /> Añadir Movimiento
                  </button>
                </div>
                
                {clientFinances.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-200 dark:border-neutral-700/50">
                      <FileText className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
                    </div>
                    <p className="text-neutral-900 dark:text-white font-bold text-lg">Historial vacío</p>
                    <p className="text-neutral-500 dark:text-neutral-400 font-light mt-1">Usa el botón superior para registrar dinero.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                    <AnimatePresence>
                      {clientFinances.map(finance => (
                        <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} key={finance._id} className="p-5 transition-colors flex items-center justify-between group hover:bg-neutral-50/50 dark:hover:bg-[#1a1a1a]/50">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${finance.type === 'ingreso' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/50'}`}>
                              {finance.type === 'ingreso' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                            </div>
                            <div>
                              <h4 className="font-bold text-neutral-900 dark:text-white">{finance.description}</h4>
                              <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                                <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" /> {new Date(finance.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                <span className="mx-2 opacity-50">•</span><span className="px-2 py-0.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm">{finance.category}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right mr-2">
                              <span className={`font-bold text-lg block ${finance.type === 'ingreso' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {finance.type === 'ingreso' ? '+' : '-'}{formatMoney(finance.amount)}
                              </span>
                              <span className="text-xs text-neutral-400 dark:text-neutral-500 capitalize font-medium">{finance.status}</span>
                            </div>
                            <button 
                              onClick={() => handleDeleteFinance(finance._id)}
                              className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Eliminar movimiento"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

          </div>
        </div>
      </div>

      <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} clientToEdit={client} />
      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} preselectedClientId={client._id} />
      <FinanceModal isOpen={isFinanceModalOpen} onClose={() => setIsFinanceModalOpen(false)} defaultType={financeConfig.type} defaultDescription={financeConfig.desc} preselectedClientId={client._id} />

      {/* PLANTILLA PDF OCULTA */}
      <div className="overflow-hidden h-0 w-0 absolute pointer-events-none">
        <div id="client-report-template" className="w-[800px] min-h-[1131px] bg-white text-black p-16 font-sans border-0 shadow-none">
          <div className="flex justify-between items-start border-b-2 border-neutral-200 pb-8 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">DOSSIER DE CLIENTE</h1>
              <p className="text-neutral-500 font-medium">Historial de Operaciones y Facturación</p>
              <p className="text-neutral-500 font-medium">Fecha de emisión: {new Date().toLocaleDateString('es-ES')}</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-lg text-neutral-900">{user?.name || 'Administración'}</h3>
              <p className="text-neutral-500">{user?.email}</p>
            </div>
          </div>
          
          <div className="bg-neutral-50 p-6 rounded-xl mb-10 border border-neutral-100">
            <p className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Información del Cliente</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">Nombre / Empresa</p>
                <p className="font-bold text-lg text-neutral-900">{client.companyName || client.name}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Contacto Directo</p>
                <p className="font-bold text-lg text-neutral-900">{client.name}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-6 mb-10">
            <div className="flex-1 border-l-4 border-emerald-500 pl-4">
              <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider">Ingresos</p>
              <p className="text-3xl font-bold text-neutral-900">{totalIngresos.toFixed(2)} €</p>
            </div>
            <div className="flex-1 border-l-4 border-rose-500 pl-4">
              <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider">Gastos</p>
              <p className="text-3xl font-bold text-neutral-900">{totalGastos.toFixed(2)} €</p>
            </div>
            <div className={`flex-1 border-l-4 pl-4 ${balanceNeto >= 0 ? 'border-emerald-500' : 'border-rose-500'}`}>
              <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider">Beneficio Neto</p>
              <p className="text-3xl font-bold text-neutral-900">{balanceNeto.toFixed(2)} €</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-neutral-900 mb-4 border-b border-neutral-200 pb-2">Historial de Movimientos</h3>
          <table className="w-full text-left text-sm mb-12">
            <thead className="bg-neutral-100 text-neutral-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Fecha</th>
                <th className="px-4 py-3">Concepto</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {clientFinances.map(f => (
                <tr key={f._id} className="text-neutral-800">
                  <td className="px-4 py-4">{new Date(f.date).toLocaleDateString('es-ES')}</td>
                  <td className="px-4 py-4 font-medium">{f.description}</td>
                  <td className="px-4 py-4">{f.status === 'completado' ? 'Completado' : 'Pendiente'}</td>
                  <td className={`px-4 py-4 text-right font-bold ${f.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {f.type === 'ingreso' ? '+' : '-'}{f.amount.toFixed(2)} €
                  </td>
                </tr>
              ))}
              {clientFinances.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-400 italic">No hay historial para este cliente.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  );
}