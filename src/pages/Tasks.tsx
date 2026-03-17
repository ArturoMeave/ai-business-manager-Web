import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useTaskStore } from "../stores/taskStores";
import { useClientStore } from "../stores/clientStore";
import {
  Plus,
  Search,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Archive,
  Trash2,
  LayoutGrid,
  Columns,
  Square,
  Maximize2,
  CalendarDays,
} from "lucide-react";
import TaskModal from "../components/crm/TaskModal";
import type { Task } from "../types";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const getPriorityStyle = (priority: string) => {
  if (priority === "high")
    return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50";
  if (priority === "medium")
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
  return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50";
};

export default function Tasks() {
  const navigate = useNavigate();

  const {
    tasks,
    fetchTasks,
    deleteTask,
    updateTask,
    currentPage,
    totalPages,
    setFilters,
  } = useTaskStore();
  const { clients, fetchClients } = useClientStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"calendar" | "archive">("calendar");
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month" | "year">("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [baseDate, setBaseDate] = useState(new Date());

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
    if (clients.length === 0) fetchClients();
  }, [fetchTasks, fetchClients, clients.length]);


  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setSelectedDate(null);
    setSelectedTime(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Eliminar esta tarea definitivamente?"))
      await deleteTask(id);
  };


  const handleDateSelection = (dateString: string, timeString?: string) => {
    setTaskToEdit(null);
    setSelectedDate(dateString);
    setSelectedTime(timeString || null);
    setIsModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  };

  const handleDropCalendar = async (e: React.DragEvent, newDateString: string) => {
    e.preventDefault();
    if (draggedTaskId) {
      const task = tasks.find((t) => t._id === draggedTaskId);
      if (task && task.dueDate !== newDateString) {
        await updateTask(draggedTaskId, { dueDate: newDateString });
      }
      setDraggedTaskId(null);
    }
  };

  // --- Lógica de Navegación ---
  const navigatePrev = () => {
    const newDate = new Date(baseDate);
    if (calendarView === "day") newDate.setDate(newDate.getDate() - 1);
    else if (calendarView === "week") newDate.setDate(newDate.getDate() - 7);
    else if (calendarView === "month") newDate.setMonth(newDate.getMonth() - 1);
    else if (calendarView === "year") newDate.setFullYear(newDate.getFullYear() - 1);
    setBaseDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(baseDate);
    if (calendarView === "day") newDate.setDate(newDate.getDate() + 1);
    else if (calendarView === "week") newDate.setDate(newDate.getDate() + 7);
    else if (calendarView === "month") newDate.setMonth(newDate.getMonth() + 1);
    else if (calendarView === "year") newDate.setFullYear(newDate.getFullYear() + 1);
    setBaseDate(newDate);
  };

  const goToToday = () => setBaseDate(new Date());

  // --- Helpers de Fecha ---
  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const isToday = (date: Date) => formatDate(date) === formatDate(new Date());
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getStartDayOfMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Lunes
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const allFilteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const archivedTasks = allFilteredTasks.filter((t) => t.status === "completed");

  const handleClearArchive = async () => {
    if (window.confirm("¿Estás seguro de que quieres borrar TODAS las tareas completadas?")) {
      for (const task of archivedTasks) await deleteTask(task._id);
    }
  };

  // --- Renderers ---

  const TaskPill = ({ task, isSmall = false }: { task: Task; isSmall?: boolean }) => (
    <div
      key={task._id}
      draggable
      onDragStart={(e) => handleDragStart(e, task._id)}
      onClick={(e) => {
        e.stopPropagation();
        handleEdit(task);
      }}
      className={`rounded-lg truncate font-bold border cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all flex items-center ${
        task.status === "completed" ? "opacity-40 grayscale" : getPriorityStyle(task.priority)
      } ${isSmall ? "text-[8px] p-0.5" : "text-[10px] p-1.5"}`}
    >
      {task.dueTime && (
        <span className={`${isSmall ? "text-[6px]" : "text-[8px]"} opacity-70 mr-1 flex-shrink-0`}>
          {task.dueTime}
        </span>
      )}
      <span className="truncate">{task.title}</span>
    </div>
  );

  const YearView = () => {
    const year = baseDate.getFullYear();
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
        {months.map((monthName, mIdx) => {
          const daysInMonth = getDaysInMonth(year, mIdx);
          const startDay = getStartDayOfMonth(year, mIdx);
          
          return (
            <div key={monthName} className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3 flex items-center justify-between">
                {monthName}
                <span className="text-[10px] opacity-40 uppercase">{year}</span>
              </h3>
              <div className="grid grid-cols-7 gap-1 text-center">
                {["L", "M", "X", "J", "V", "S", "D"].map(d => (
                  <div key={d} className="text-[8px] font-black text-neutral-400 dark:text-neutral-600">{d}</div>
                ))}
                {Array.from({ length: startDay }).map((_, i) => <div key={i} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(mIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const tasksOnDay = allFilteredTasks.filter(t => t.dueDate === dateStr);
                  const isCurToday = formatDate(new Date()) === dateStr;

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(dateStr)} // Solo seleccionar para el Tooltip visual
                      onDoubleClick={() => {
                        setBaseDate(new Date(year, mIdx, day));
                        setCalendarView("day");
                      }}
                      className={`relative group h-6 w-full flex items-center justify-center text-[10px] rounded-lg cursor-pointer transition-all ${
                        isCurToday ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold" : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      {day}
                      {tasksOnDay.length > 0 && (
                        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                          <div className={`w-1 h-1 rounded-full ${isCurToday ? "bg-emerald-400" : "bg-emerald-500"}`} />
                        </div>
                      )}
                      {/* Tooltip Simplificado Popover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                        <div className="bg-neutral-900 text-white text-[10px] py-1 px-3 rounded-xl whitespace-nowrap shadow-xl">
                          {tasksOnDay.length > 0 ? `${tasksOnDay.length} tareas` : "Sin tareas"}
                        </div>
                        <div className="w-2 h-2 bg-neutral-900 rotate-45 mx-auto -mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const MonthView = () => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getStartDayOfMonth(year, month);
    const todayStr = formatDate(new Date());

    return (
      <div className="flex flex-col">
        <div className="grid grid-cols-7 gap-px mb-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
          {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((day) => (
            <div key={day} className="text-center text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[60px] sm:min-h-[120px] rounded-xl bg-neutral-50/30 dark:bg-neutral-800/20" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const tasksForDay = allFilteredTasks.filter((t) => t.dueDate === dateStr);
            const isCurToday = todayStr === dateStr;

            return (
              <div
                key={day}
                onClick={() => {
                  setBaseDate(new Date(year, month, day));
                  setCalendarView("day");
                }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropCalendar(e, dateStr)}
                className={`min-h-[80px] sm:min-h-[140px] p-2 rounded-2xl border transition-all cursor-pointer group flex flex-col items-center sm:items-stretch ${
                  isCurToday ? "border-neutral-950 dark:border-white bg-neutral-50/50 dark:bg-neutral-800/50" : "border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] hover:border-neutral-200 dark:hover:border-neutral-700"
                }`}
              >
                <span className={`text-sm sm:text-base font-bold w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all ${
                  isCurToday ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900" : "text-neutral-900 dark:text-neutral-400 group-hover:text-neutral-600"
                }`}>
                  {day}
                </span>
                <div className="hidden sm:block space-y-1 mt-2">
                  {tasksForDay.slice(0, 3).map(t => <TaskPill key={t._id} task={t} />)}
                  {tasksForDay.length > 3 && <p className="text-[9px] font-bold text-neutral-400 text-center">+{tasksForDay.length - 3} más</p>}
                </div>
                {/* Mobile dots */}
                <div className="sm:hidden mt-auto flex gap-0.5">
                  {tasksForDay.slice(0, 3).map(t => <div key={t._id} className="w-1 h-1 rounded-full bg-emerald-500" />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const DayWeekView = () => {
    const days = calendarView === "week" ? getWeekDays(baseDate) : [baseDate];
    const hours = Array.from({ length: 24 }).map((_, i) => `${String(i).padStart(2, "0")}:00`);

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header de días */}
        <div className="flex ml-16 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          {days.map((day) => (
            <div key={day.toISOString()} className="flex-1 text-center">
              <div className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1">
                {day.toLocaleDateString("es-ES", { weekday: "short" })}
              </div>
              <div className={`mx-auto w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold ${
                isToday(day) ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-900 shadow-md" : "text-neutral-900 dark:text-white"
              }`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Grid de Horas Scrollable */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 scrollbar-hide">
          <div className="relative flex">
            {/* Eje de Horas */}
            <div className="w-16 flex-shrink-0">
              {hours.map((hour) => (
                <div key={hour} className="h-20 -mt-2 text-[10px] font-bold text-neutral-400 flex justify-center items-start pt-1">
                  {hour}
                </div>
              ))}
            </div>

            {/* Columnas de Días */}
            <div className={`flex-1 grid ${calendarView === 'week' ? 'grid-cols-7' : 'grid-cols-1'} divide-x divide-neutral-100 dark:divide-neutral-800`}>
              {days.map((day) => {
                const dayDateStr = formatDate(day);
                const dailyTasks = allFilteredTasks.filter(t => t.dueDate === dayDateStr);

                return (
                  <div key={day.toISOString()} className="relative divide-y divide-neutral-50 dark:divide-neutral-800/50">
                    {hours.map((hour) => {
                      const hourNum = parseInt(hour.split(":")[0]);
                      const slotTasks = dailyTasks.filter(t => t.dueTime && parseInt(t.dueTime.split(":")[0]) === hourNum);
                      
                      return (
                        <div
                          key={hour}
                          onClick={() => handleDateSelection(dayDateStr, hour)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropCalendar(e, dayDateStr)}
                          className="h-20 p-1 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors cursor-pointer group relative"
                        >
                          <div className="flex flex-col gap-1">
                            {slotTasks.map(t => <TaskPill key={t._id} task={t} />)}
                          </div>
                          {/* Botón flotante al pasar el mouse */}
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-3 h-3 text-neutral-300" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- JSX Principal ---

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto transition-colors duration-300">
      {/* Header Superior */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center">
            <CalendarDays className="w-8 h-8 mr-3 text-neutral-400" />
            Calendario
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-medium italic">Gestión inteligente del tiempo.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* Selector de Vistas Estilo Google */}
          <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl shadow-inner border border-neutral-200 dark:border-neutral-700 w-full sm:w-auto">
            {[
              { id: 'day', label: 'Día', icon: Square },
              { id: 'week', label: 'Semana', icon: Columns },
              { id: 'month', label: 'Mes', icon: LayoutGrid },
              { id: 'year', label: 'Año', icon: Maximize2 }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setCalendarView(v.id as any)}
                className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2 rounded-xl text-xs font-black transition-all gap-2 ${
                  calendarView === v.id
                    ? "bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                <v.icon className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{v.label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm shadow-sm outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tabs Principales */}
      <div className="flex items-center space-x-2 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setViewMode("calendar")}
          className={`px-6 py-3 text-sm font-bold transition-all relative ${
            viewMode === "calendar" ? "text-neutral-900 dark:text-white" : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          Resumen Temporal
          {viewMode === "calendar" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white" />}
        </button>
        <button
          onClick={() => setViewMode("archive")}
          className={`px-6 py-3 text-sm font-bold transition-all relative ${
            viewMode === "archive" ? "text-neutral-900 dark:text-white" : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          Archivo
          {viewMode === "archive" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "archive" && (
          <motion.div key="archive" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
            <div className="bg-neutral-50/50 dark:bg-[#121212]/50 rounded-[2.5rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm overflow-hidden min-h-[400px]">
            {archivedTasks.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                  <Archive className="w-10 h-10 text-neutral-300" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Archivo despejado</h3>
                <p className="text-neutral-500 text-sm mt-2">No tienes tareas completadas para mostrar.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                <div className="p-4 flex justify-end">
                  <button onClick={handleClearArchive} className="text-xs font-black text-rose-600 hover:text-rose-700 uppercase tracking-widest px-4 py-2 hover:bg-rose-50 rounded-xl transition-all">Limpiar Historial</button>
                </div>
                {archivedTasks.map((task) => (
                  <div key={task._id} onClick={() => navigate(`/tasks/${task._id}`)} className="p-6 hover:bg-white dark:hover:bg-[#1a1a1a] transition-all flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center space-x-4 opacity-70 group-hover:opacity-100">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      <h3 className="font-bold text-neutral-900 dark:text-white line-through">{task.title}</h3>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }} className="p-3 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            </div>

            {totalPages > 1 && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-[#121212] p-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm"
              >
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 sm:mb-0">
                  Mostrando página{" "}
                  <span className="font-bold text-neutral-900 dark:text-white">{currentPage}</span> de{" "}
                  <span className="font-bold text-neutral-900 dark:text-white">{totalPages}</span>
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFilters({ page: Math.max(1, currentPage - 1) })}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold text-neutral-700 dark:text-neutral-300 disabled:opacity-50 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setFilters({ page: Math.min(totalPages, currentPage + 1) })}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold text-neutral-700 dark:text-neutral-300 disabled:opacity-50 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Siguiente
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {viewMode === "calendar" && (
          <motion.div key="calendar" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="bg-white dark:bg-[#121212] rounded-[2.5rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-2xl p-6 sm:p-10 transition-all">
            {/* Cabecera del Calendario Selectivo */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6">
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white capitalize flex items-center">
                  {baseDate.toLocaleDateString("es-ES", {
                    month: calendarView === 'year' ? undefined : "long",
                    year: "numeric",
                    day: calendarView === 'day' ? 'numeric' : undefined
                  })}
                  {calendarView === 'week' && <span className="ml-2 text-neutral-400 dark:text-neutral-600 font-light">• Semana {Math.ceil(baseDate.getDate() / 7)}</span>}
                </h2>
                {calendarView === 'day' && <p className="text-xs font-bold text-neutral-400 p-0.5">{baseDate.toLocaleDateString("es-ES", { weekday: 'long' })}</p>}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-neutral-50 dark:bg-neutral-800/50 p-1.5 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/50">
                  <button onClick={navigatePrev} className="p-2 rounded-xl hover:bg-white dark:hover:bg-neutral-800 shadow-sm transition-all"><ChevronLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-300" /></button>
                  <button onClick={goToToday} className="px-5 py-2 text-xs font-black uppercase text-neutral-900 dark:text-white hover:bg-white dark:hover:bg-neutral-800 rounded-xl transition-all tracking-widest mx-1">Hoy</button>
                  <button onClick={navigateNext} className="p-2 rounded-xl hover:bg-white dark:hover:bg-neutral-800 shadow-sm transition-all"><ChevronRight className="w-5 h-5 text-neutral-600 dark:text-neutral-300" /></button>
                </div>
                <button
                  onClick={() => handleDateSelection(formatDate(baseDate))}
                  className="p-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Contenedor Responsivo dinámico */}
            <div className="min-h-[600px] animate-in fade-in zoom-in-95 duration-500">
              {calendarView === "month" && <MonthView />}
              {calendarView === "year" && <YearView />}
              {(calendarView === "day" || calendarView === "week") && <DayWeekView />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
          setSelectedTime(null);
        }}
        taskToEdit={taskToEdit}
        defaultDate={selectedDate}
        defaultTime={selectedTime}
      />
    </div>
  );
}
