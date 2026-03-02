import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Phone, Building2, Briefcase, DollarSign, Clock, CheckCircle2, Edit2, Trash2, Target, FileText, KanbanSquare, LayoutList, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useClientStore } from '../stores/clientStore';
import { useTaskStore } from '../stores/taskStores';
import { useAuthStore } from '../stores/authStore';
import ClientModal from '../components/crm/ClientModal';
import TaskModal from '../components/crm/TaskModal';
import type { Client, TaskStatus } from '../types';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { clients, fetchClients, deleteClient } = useClientStore();
  
  // ⚡ SOLUCIÓN FASE 2: Usamos clientTasks y fetchClientTasks para NO contaminar el estado global
  const { clientTasks: tasks, fetchClientTasks, updateTask, isLoading: isTasksLoading } = useTaskStore();
  
  const { user } = useAuthStore(); 
  
  const [client, setClient] = useState<Client | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Estados para modales
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); 
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsInitializing(true);
      if (clients.length === 0) await fetchClients();
      
      // ⚡ Llamamos solo a las tareas de este cliente
      if (id) await fetchClientTasks(id); 
      
      setIsInitializing(false);
    };
    loadData();
  }, [id, clients.length, fetchClients, fetchClientTasks]);

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

  // ⚡ LA MAGIA DEL DOSSIER EN PDF MULTIPÁGINA
  const handleDownloadReport = async () => {
    if (!client) return;
    setIsGeneratingPDF(true);
    try {
      const reportElement = document.getElementById('client-report-template');
      if (!reportElement) return;
      
      const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth(); // Ancho A4 (210mm)
      const pageHeight = pdf.internal.pageSize.getHeight(); // Alto A4 (297mm)
      
      // Calculamos la proporción de la imagen
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Pegamos la primera página
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      // Bucle para crear páginas extra si la tabla de tareas es muy larga
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; // Movemos el scroll hacia abajo en la imagen
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

  const moneyGenerated = tasks.filter(t => t.status === 'completed').reduce((total, t) => total + (t.budget || 0), 0);
  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const totalValue = (client as any).totalValue || 0;
  const progressPercent = totalValue > 0 ? Math.min((moneyGenerated / totalValue) * 100, 100) : 0;

  const kanbanColumns: { id: TaskStatus; title: string; count: number }[] = [
    { id: 'pending', title: 'Pendientes', count: tasks.filter(t => t.status === 'pending').length },
    { id: 'in progress', title: 'En Curso', count: tasks.filter(t => t.status === 'in progress').length },
    { id: 'completed', title: 'Completadas', count: tasks.filter(t => t.status === 'completed').length }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 pb-12 max-w-6xl mx-auto transition-colors duration-300 relative">
      
      {/* NAVEGACIÓN SUPERIOR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <button onClick={() => navigate('/clients')} className="group flex items-center text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
          <div className="p-1 rounded-md group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800 transition-colors mr-1"><ArrowLeft className="w-4 h-4" /></div>
          Volver a clientes
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleDownloadReport}
            disabled={isGeneratingPDF || tasks.length === 0}
            className="flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-colors border bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm disabled:opacity-50"
          >
            {isGeneratingPDF ? <div className="w-4 h-4 mr-2 border-2 border-white/30 dark:border-neutral-900/30 border-t-white dark:border-t-neutral-900 rounded-full animate-spin"></div> : <FileText className="w-4 h-4 mr-2" />}
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

      {/* CABECERA DEL PERFIL */}
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

      {/* BARRA DE PROGRESO */}
      {totalValue > 0 && (
        <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl shadow-sm border border-neutral-200/60 dark:border-neutral-800/60 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center">
              <Target className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-500" /> Progreso del Contrato / Proyecto
            </h3>
            <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400">
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(moneyGenerated)} <span className="font-light opacity-60">/ {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalValue)}</span>
            </span>
          </div>
          <div className="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, delay: 0.2 }}
              className={`h-full rounded-full ${progressPercent >= 100 ? 'bg-emerald-500' : 'bg-primary-600 dark:bg-primary-500'}`}
            />
          </div>
        </div>
      )}

      {/* GRID INFERIOR Y KANBAN */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA (KPIs) */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl shadow-sm border border-neutral-200/60 dark:border-neutral-800/60 relative overflow-hidden group transition-colors">
            <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2 flex items-center">
              <DollarSign className="w-4 h-4 mr-1.5 opacity-70" /> Ingresos Reales
            </h3>
            <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-500 tracking-tight">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(moneyGenerated)}</p>
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

        {/* COLUMNA DERECHA (Tablero Kanban del Cliente) */}
        <div className="xl:col-span-9 bg-white dark:bg-[#121212] p-8 rounded-3xl shadow-sm border border-neutral-200/60 dark:border-neutral-800/60 transition-colors flex flex-col">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center tracking-tight">
              <Briefcase className="w-5 h-5 mr-2 opacity-70" /> Flujo de Trabajo
            </h3>
            
            <div className="flex items-center space-x-3">
              {/* 👈 NUEVO: Botón de Crear Tarea para el Cliente */}
              <button 
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-sm font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Añadir Fase
              </button>

              <div className="flex items-center space-x-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                <button onClick={() => setViewMode('kanban')} className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400'}`}>
                  <KanbanSquare className="w-4 h-4 mr-1.5" /> Tablero
                </button>
                <button onClick={() => setViewMode('list')} className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400'}`}>
                  <LayoutList className="w-4 h-4 mr-1.5" /> Lista
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
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
                  <div 
                    key={column.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropKanban(e, column.id)}
                    className="flex-1 min-w-[280px] bg-neutral-50/50 dark:bg-[#1a1a1a] rounded-2xl border border-neutral-200/60 dark:border-neutral-800 flex flex-col"
                  >
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
                          <motion.div
                            key={task._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            draggable onDragStart={(e: any) => handleDragStart(e, task._id)}
                            onClick={() => navigate(`/tasks/${task._id}`)}
                            className={`bg-white dark:bg-[#222] p-3.5 rounded-xl shadow-sm border transition-all cursor-grab active:cursor-grabbing hover:shadow-md ${
                              draggedTaskId === task._id ? 'opacity-50 border-primary-500' : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                            }`}
                          >
                            <h5 className={`font-semibold text-sm mb-2 ${task.status === 'completed' ? 'text-neutral-400 dark:text-neutral-500 line-through' : 'text-neutral-900 dark:text-white'}`}>{task.title}</h5>
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-medium text-emerald-600 dark:text-emerald-500">{task.budget > 0 ? `${task.budget} €` : '—'}</span>
                              {task.dueDate && <span className="text-neutral-400 flex items-center"><CalendarIcon className="w-3 h-3 mr-1" />{new Date(task.dueDate).toLocaleDateString('es-ES', { day:'numeric', month:'short' })}</span>}
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
          </div>
        </div>
      </div>

      <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} clientToEdit={client} />
      
      {/* EL MODAL DE TAREAS: Ahora recibe el ID del cliente para auto-asignarlo */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        preselectedClientId={client._id} 
      />

      {/* --------------------------------------------------------------- */}
      {/* 🧾 PLANTILLA DEL DOSSIER OCULTA (PARA LA GENERACIÓN DEL PDF MULTIPÁGINA) */}
      {/* --------------------------------------------------------------- */}
      <div className="overflow-hidden h-0 w-0 absolute pointer-events-none">
        <div id="client-report-template" className="w-[800px] min-h-[1131px] bg-white text-black p-16 font-sans border-0 shadow-none">
          
          {/* Header del Reporte */}
          <div className="flex justify-between items-start border-b-2 border-neutral-200 pb-8 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">DOSSIER DE CLIENTE</h1>
              <p className="text-neutral-500 font-medium">Historial de Operaciones y Facturación</p>
              <p className="text-neutral-500 font-medium">Fecha de emisión: {new Date().toLocaleDateString('es-ES')}</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-lg text-neutral-900">{user?.name || 'Administración'}</h3>
              <p className="text-neutral-500">{user?.email}</p>
              <p className="text-neutral-500 text-sm mt-1">AI Business Manager</p>
            </div>
          </div>

          {/* Datos del Cliente */}
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
              <div>
                <p className="text-sm text-neutral-500">Email</p>
                <p className="font-medium text-neutral-900">{client.email || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Teléfono</p>
                <p className="font-medium text-neutral-900">{client.phone || '—'}</p>
              </div>
            </div>
          </div>

          {/* Resumen Financiero Rápido */}
          <div className="flex space-x-6 mb-10">
            <div className="flex-1 border-l-4 border-emerald-500 pl-4">
              <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider">Total Facturado</p>
              <p className="text-3xl font-bold text-neutral-900">{moneyGenerated.toFixed(2)} €</p>
            </div>
            {totalValue > 0 && (
              <div className="flex-1 border-l-4 border-primary-500 pl-4">
                <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider">Valor Contrato Total</p>
                <p className="text-3xl font-bold text-neutral-900">{totalValue.toFixed(2)} €</p>
              </div>
            )}
            <div className="flex-1 border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider">Tareas Registradas</p>
              <p className="text-3xl font-bold text-neutral-900">{tasks.length}</p>
            </div>
          </div>

          {/* Tabla de Tareas Completas Restaurada */}
          <h3 className="text-lg font-bold text-neutral-900 mb-4 border-b border-neutral-200 pb-2">Desglose de Operaciones</h3>
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
              {tasks.map(task => (
                <tr key={task._id} className="text-neutral-800">
                  <td className="px-4 py-4">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES') : '—'}</td>
                  <td className="px-4 py-4 font-medium">{task.title}</td>
                  <td className="px-4 py-4">
                    {task.status === 'completed' ? 'Completado' : task.status === 'in progress' ? 'En proceso' : 'Pendiente'}
                  </td>
                  <td className="px-4 py-4 text-right font-bold">{task.budget ? `${task.budget.toFixed(2)} €` : '0.00 €'}</td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-400 italic">No hay historial de tareas para este cliente.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-20 pt-8 border-t border-neutral-200 text-center">
            <p className="text-neutral-400 text-sm font-medium">Este documento es de uso informativo e interno. Generado automáticamente.</p>
          </div>

        </div>
      </div>
      {/* --------------------------------------------------------------- */}

    </motion.div>
  );
}