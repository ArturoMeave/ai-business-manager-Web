import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useTaskStore } from '../stores/taskStores';
import { Plus, CheckSquare, Search, Edit2, Trash2, CheckCircle2, LayoutList, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Archive, XCircle, Clock, X, KanbanSquare } from 'lucide-react';
import TaskModal from '../components/crm/TaskModal';
import type { Task, TaskStatus } from '../types';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export default function Tasks() {
  const navigate = useNavigate();
  
  // ⚡ NUEVO: Extraemos la paginación y los filtros de tu tienda
  const { tasks, isLoading, fetchTasks, deleteTask, updateTask, currentPage, totalPages, totalRecords, setFilters } = useTaskStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); 
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);
  const [agendaDate, setAgendaDate] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar' | 'archive'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ⚡ NUEVAS FUNCIONES: Manejadores de los botones de paginación
  const handlePrevPage = () => { if (currentPage > 1) setFilters({ page: currentPage - 1 }); };
  const handleNextPage = () => { if (currentPage < totalPages) setFilters({ page: currentPage + 1 }); };

  const handleEdit = (task: Task) => { setTaskToEdit(task); setSelectedDate(null); setIsModalOpen(true); setIsAgendaOpen(false); };
  const handleDelete = async (id: string) => { if (window.confirm('¿Eliminar esta tarea definitivamente?')) await deleteTask(id); };
  
  const handleToggleCompleted = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(task._id, { status: newStatus });
  };

  const handleAddInDate = (dateString: string) => {
    setTaskToEdit(null); setSelectedDate(dateString); setIsAgendaOpen(false); setIsModalOpen(true);
  };

  const handleDayClick = (dateString: string, dayTasks: Task[]) => {
    if (dayTasks.length > 1) { setAgendaDate(dateString); setIsAgendaOpen(true); } 
    else { handleAddInDate(dateString); }
  };

  const handleClearArchive = async () => {
    if (window.confirm('¿Estás seguro de que quieres borrar TODAS las tareas completadas? Esta acción no se puede deshacer.')) {
      const completedTasks = tasks.filter(t => t.status === 'completed');
      for (const task of completedTasks) { await deleteTask(task._id); }
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
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

  const handleDropCalendar = async (e: React.DragEvent, newDateString: string) => {
    e.preventDefault();
    if (draggedTaskId) {
      const task = tasks.find(t => t._id === draggedTaskId);
      if (task && task.dueDate !== newDateString) {
        await updateTask(draggedTaskId, { dueDate: newDateString });
      }
      setDraggedTaskId(null);
    }
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const archivedTasks = tasks.filter(t => t.status === 'completed' && t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const allFilteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const agendaTasks = agendaDate ? allFilteredTasks.filter(t => t.dueDate?.startsWith(agendaDate)).sort((a, b) => (a.dueTime || '24:00').localeCompare(b.dueTime || '24:00')) : [];

  const kanbanColumns: { id: TaskStatus; title: string; count: number }[] = [
    { id: 'pending', title: 'Pendientes', count: allFilteredTasks.filter(t => t.status === 'pending').length },
    { id: 'in progress', title: 'En Progreso', count: allFilteredTasks.filter(t => t.status === 'in progress').length },
    { id: 'completed', title: 'Completadas', count: allFilteredTasks.filter(t => t.status === 'completed').length }
  ];

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto transition-colors duration-300">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Proyectos y Tareas</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-light">Planifica, ejecuta y mantén tu espacio de trabajo limpio.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" placeholder="Buscar tarea..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all shadow-sm outline-none"
            />
          </div>
          <button onClick={() => { setTaskToEdit(null); setSelectedDate(null); setIsModalOpen(true); }} className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-sm flex items-center justify-center whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" /> Nueva Tarea
          </button>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-px gap-4">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
          <button onClick={() => setViewMode('list')} className={`flex items-center whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2 ${viewMode === 'list' ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white' : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>
            <LayoutList className="w-4 h-4 mr-2" /> Lista <span className="ml-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 py-0.5 px-2 rounded-full text-xs">{activeTasks.length}</span>
          </button>
          
          <button onClick={() => setViewMode('kanban')} className={`flex items-center whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2 ${viewMode === 'kanban' ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white' : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>
            <KanbanSquare className="w-4 h-4 mr-2" /> Tablero
          </button>

          <button onClick={() => setViewMode('calendar')} className={`flex items-center whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2 ${viewMode === 'calendar' ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white' : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>
            <CalendarIcon className="w-4 h-4 mr-2" /> Calendario
          </button>
          
          <button onClick={() => setViewMode('archive')} className={`flex items-center whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2 ${viewMode === 'archive' ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white' : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>
            <Archive className="w-4 h-4 mr-2" /> Archivo
          </button>
        </div>

        {viewMode === 'archive' && archivedTasks.length > 0 && (
          <button onClick={handleClearArchive} className="flex items-center text-sm font-medium text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-1.5 rounded-lg transition-colors">
            <XCircle className="w-4 h-4 mr-1.5" /> Vaciar archivo
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        
        {/* VISTA 1: LISTA */}
        {viewMode === 'list' && (
          <motion.div key="list" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm overflow-hidden min-h-[300px] transition-colors">
            {activeTasks.length === 0 ? (
              <div className="p-16 text-center">
                <CheckSquare className="w-12 h-12 text-neutral-200 dark:text-neutral-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Todo al día</h3>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1 font-light">No tienes tareas pendientes en esta página.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                <AnimatePresence>
                  {activeTasks.map((task) => (
                    <motion.div key={task._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} onClick={() => navigate(`/tasks/${task._id}`)} className="p-5 hover:bg-neutral-50/80 dark:hover:bg-[#1a1a1a] transition-colors flex items-center justify-between group cursor-pointer">
                      <div className="flex items-start space-x-4">
                        <button onClick={(e) => { e.stopPropagation(); handleToggleCompleted(task); }} className="mt-1 flex-shrink-0 group/btn relative">
                          <div className="w-5 h-5 rounded border-2 border-neutral-300 dark:border-neutral-600 group-hover/btn:border-emerald-500 transition-colors"></div>
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 absolute top-0 left-0 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                        <div>
                          <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{task.title}</h3>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                            <span className={`px-2 py-0.5 rounded-md border ${task.priority === 'high' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800/50' : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'}`}>
                              {task.priority === 'high' ? 'Urgente' : 'Normal'}
                            </span>
                            {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString('es-ES', { day:'numeric', month:'short' })}</span>}
                            {task.dueTime && <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{task.dueTime}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(task); }} className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }} className="p-2 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* VISTA 2: TABLERO KANBAN */}
        {viewMode === 'kanban' && (
          <motion.div key="kanban" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="flex gap-6 overflow-x-auto pb-4 min-h-[500px]">
            {kanbanColumns.map(column => (
              <div 
                key={column.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropKanban(e, column.id)}
                className="flex-shrink-0 w-80 bg-neutral-50/50 dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 flex flex-col transition-colors"
              >
                <div className="p-5 border-b border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
                  <h3 className="font-bold text-neutral-900 dark:text-white flex items-center">
                    {column.id === 'pending' && <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 mr-2"></span>}
                    {column.id === 'in progress' && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>}
                    {column.id === 'completed' && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>}
                    {column.title}
                  </h3>
                  <span className="px-2.5 py-0.5 bg-neutral-200/50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full text-xs font-bold">
                    {column.count}
                  </span>
                </div>

                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  <AnimatePresence>
                    {allFilteredTasks.filter(t => t.status === column.id).map(task => (
                      <motion.div
                        key={task._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        draggable onDragStart={(e: any) => handleDragStart(e, task._id)}
                        onClick={() => navigate(`/tasks/${task._id}`)}
                        className={`bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl shadow-sm border transition-all cursor-grab active:cursor-grabbing hover:shadow-md ${
                          draggedTaskId === task._id ? 'opacity-50 scale-95 border-primary-500' : 'border-neutral-200/60 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            task.priority === 'high' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800/50' : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
                          }`}>
                            {task.priority}
                          </span>
                          {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <h4 className={`font-bold mb-3 ${task.status === 'completed' ? 'text-neutral-400 dark:text-neutral-500 line-through' : 'text-neutral-900 dark:text-white'}`}>{task.title}</h4>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-100 dark:border-neutral-800">
                          {task.dueDate ? (
                            <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                              <CalendarIcon className="w-3 h-3 mr-1" />
                              {new Date(task.dueDate).toLocaleDateString('es-ES', { day:'numeric', month:'short' })}
                            </div>
                          ) : <div />}
                          {task.dueTime && (
                            <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                              <Clock className="w-3 h-3 mr-1" /> {task.dueTime}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {column.count === 0 && (
                    <div className="h-24 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-400 dark:text-neutral-500 text-sm font-medium">
                      Arrastra tareas aquí
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* VISTA 3: ARCHIVO */}
        {viewMode === 'archive' && (
          <motion.div key="archive" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="bg-neutral-50/50 dark:bg-[#121212]/50 rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm overflow-hidden min-h-[300px]">
             {archivedTasks.length === 0 ? (
              <div className="p-16 text-center"><Archive className="w-12 h-12 text-neutral-200 dark:text-neutral-700 mx-auto mb-4" /><h3 className="text-lg font-bold text-neutral-900 dark:text-white">Archivo vacío</h3></div>
            ) : (
              <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                <AnimatePresence>
                  {archivedTasks.map((task) => (
                    <motion.div key={task._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={() => navigate(`/tasks/${task._id}`)} className="p-4 hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors flex items-center justify-between group cursor-pointer">
                      <div className="flex items-start space-x-4 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleToggleCompleted(task); }} className="mt-1" title="Devolver a tareas activas"><CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></button>
                        <div><h3 className="font-semibold text-neutral-500 dark:text-neutral-400 line-through">{task.title}</h3></div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }} className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* VISTA 4: CALENDARIO */}
        {viewMode === 'calendar' && (
          <motion.div key="calendar" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm overflow-hidden p-6 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white capitalize">
                {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex space-x-2">
                <button onClick={prevMonth} className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 text-sm font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors">Hoy</button>
                <button onClick={nextMonth} className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px mb-2">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                <div key={day} className="text-center text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] rounded-xl bg-neutral-50/50 dark:bg-neutral-800/30 border border-neutral-100/50 dark:border-neutral-800/50"></div>
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const tasksForDay = allFilteredTasks.filter(t => t.dueDate && t.dueDate.startsWith(dateString));
                const isToday = new Date().toISOString().split('T')[0] === dateString;

                return (
                  <div 
                    key={day} 
                    onClick={() => handleDayClick(dateString, tasksForDay)}
                    onDragOver={handleDragOver} 
                    onDrop={(e) => handleDropCalendar(e, dateString)} 
                    className={`min-h-[100px] p-2 rounded-xl border transition-all cursor-pointer group ${isToday ? 'border-neutral-900 dark:border-neutral-600 bg-neutral-50/30 dark:bg-neutral-800/50 ring-1 ring-neutral-900 dark:ring-neutral-600' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg ${isToday ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' : 'text-neutral-600 dark:text-neutral-400'}`}>{day}</span>
                      <Plus className="w-4 h-4 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="space-y-1.5 mt-2">
                      {tasksForDay.map(task => (
                        <div 
                          key={task._id} 
                          draggable 
                          onDragStart={(e: any) => { e.stopPropagation(); handleDragStart(e, task._id); }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task._id}`); }}
                          className={`text-xs p-1.5 rounded-md truncate font-medium border hover:scale-[1.02] transition-transform cursor-grab active:cursor-grabbing ${
                            task.status === 'completed' 
                              ? 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-400 dark:text-neutral-500 border-neutral-200 dark:border-neutral-800 line-through opacity-60' 
                              : task.priority === 'high' 
                                ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50' 
                                : 'bg-white dark:bg-[#1a1a1a] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-600'
                          }`}
                        >
                          {task.dueTime && <span className="mr-1 opacity-70">{task.dueTime}</span>}
                          {task.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚡ NUEVO: LA BARRA INFERIOR DE PAGINACIÓN */}
      {totalPages > 1 && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-[#121212] p-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm mt-6">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 sm:mb-0">
            Mostrando página <span className="font-bold text-neutral-900 dark:text-white">{currentPage}</span> de <span className="font-bold text-neutral-900 dark:text-white">{totalPages}</span> 
            <span className="mx-2">•</span> 
            Total: {totalRecords} tareas en tu cuenta
          </p>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              className="px-4 py-2 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold text-neutral-700 dark:text-neutral-300 disabled:opacity-50 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Anterior
            </button>
            <button 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold text-neutral-700 dark:text-neutral-300 disabled:opacity-50 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Siguiente
            </button>
          </div>
        </motion.div>
      )}

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} taskToEdit={taskToEdit} defaultDate={selectedDate} />

      {/* MODAL DE AGENDA DIARIA */}
      <AnimatePresence>
        {isAgendaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAgendaOpen(false)} className="absolute inset-0 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-[#121212] rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-start bg-neutral-50/30 dark:bg-[#1a1a1a]">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Agenda Diaria</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 capitalize">
                    {agendaDate && new Date(agendaDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <button onClick={() => setIsAgendaOpen(false)} className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {agendaTasks.map((task) => (
                  <div key={task._id} onClick={() => { setIsAgendaOpen(false); navigate(`/tasks/${task._id}`); }} className="group relative flex gap-4 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all cursor-pointer bg-white dark:bg-[#1a1a1a]">
                    <div className="flex flex-col items-center min-w-[50px]">
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">{task.dueTime || '--:--'}</span>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mt-0.5">{!task.dueTime && 'Todo el día'}</span>
                    </div>
                    
                    <div className="w-px bg-neutral-100 dark:bg-neutral-800 relative">
                      <div className={`absolute top-1 -left-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#1a1a1a] ${task.status === 'completed' ? 'bg-neutral-300 dark:bg-neutral-600' : task.priority === 'high' ? 'bg-rose-500' : 'bg-primary-500'}`}></div>
                    </div>

                    <div className="flex-1 pb-1">
                      <h4 className={`text-sm font-bold ${task.status === 'completed' ? 'text-neutral-400 dark:text-neutral-600 line-through' : 'text-neutral-900 dark:text-white'}`}>{task.title}</h4>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1a1a1a]">
                <button 
                  onClick={() => handleAddInDate(agendaDate!)} 
                  className="w-full py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-all flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" /> Añadir cita a este día
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}