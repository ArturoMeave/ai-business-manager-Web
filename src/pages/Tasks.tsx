import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useTaskStore } from "../stores/taskStores";
import { useClientStore } from "../stores/clientStore";
import {
  Plus,
  CheckSquare,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  LayoutList,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Archive,
  Clock,
  KanbanSquare,
  AlertTriangle,
  Target,
  User,
} from "lucide-react";
import TaskModal from "../components/crm/TaskModal";
import type { Task, TaskStatus } from "../types";

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

const getPriorityLabel = (priority: string) => {
  if (priority === "high") return "Alta ";
  if (priority === "medium") return "Media ";
  return "Baja ";
};

const getClientCategoryStyle = (category: string) => {
  switch (category) {
    case "VIP":
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50";
    case "Active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50";
    case "Prospect":
      return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50";
    case "Potencial":
      return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50";
    case "General":
      return "bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700";
    default:
      return "bg-neutral-50 text-neutral-500 border-neutral-200 dark:bg-neutral-800/50 dark:text-neutral-500 dark:border-neutral-700/50";
  }
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
    totalRecords,
    setFilters,
    filters,
  } = useTaskStore();
  const { clients, fetchClients } = useClientStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<
    "list" | "kanban" | "calendar" | "archive"
  >("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeKanbanTab, setActiveKanbanTab] = useState<TaskStatus>("pending");

  useEffect(() => {
    fetchTasks();
    if (clients.length === 0) fetchClients();
  }, [fetchTasks, fetchClients, clients.length]);

  const handlePrevPage = () => {
    if (currentPage > 1) setFilters({ ...filters, page: currentPage - 1 });
  };
  const handleNextPage = () => {
    if (currentPage < totalPages)
      setFilters({ ...filters, page: currentPage + 1 });
  };

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setSelectedDate(null);
    setIsModalOpen(true);
  };
  const handleDelete = async (id: string) => {
    if (window.confirm("¿Eliminar esta tarea definitivamente?"))
      await deleteTask(id);
  };

  const handleToggleCompleted = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    await updateTask(task._id, { status: newStatus });
  };

  const handleAddInDate = (dateString: string) => {
    setTaskToEdit(null);
    setSelectedDate(dateString);
    setIsModalOpen(true);
  };

  const handleDayClick = (dateString: string) => handleAddInDate(dateString);

  const handleDragStart = (e: unknown, id: string) => {
    setDraggedTaskId(id);
    const dragEvent = e as React.DragEvent<HTMLDivElement>;
    if (dragEvent && dragEvent.dataTransfer)
      dragEvent.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropKanban = async (
    e: React.DragEvent<HTMLDivElement>,
    newStatus: TaskStatus,
  ) => {
    e.preventDefault();
    if (draggedTaskId) {
      const task = tasks.find((t) => t._id === draggedTaskId);
      if (task && task.status !== newStatus) {
        await updateTask(draggedTaskId, { status: newStatus });
      }
      setDraggedTaskId(null);
    }
  };

  const handleDropCalendar = async (
    e: React.DragEvent<HTMLDivElement>,
    newDateString: string,
  ) => {
    e.preventDefault();
    if (draggedTaskId) {
      const task = tasks.find((t) => t._id === draggedTaskId);
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

  const allFilteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const activeTasks = allFilteredTasks.filter((t) => t.status !== "completed");
  const archivedTasks = allFilteredTasks.filter(
    (t) => t.status === "completed",
  );

  const todayStr = new Date().toISOString().split("T")[0];
  const overdueTasks = activeTasks.filter(
    (t) => t.dueDate && t.dueDate < todayStr,
  );
  const todayTasks = activeTasks.filter((t) => t.dueDate === todayStr);
  const upcomingTasks = activeTasks.filter(
    (t) => !t.dueDate || t.dueDate > todayStr,
  );

  const kanbanColumns: { id: TaskStatus; title: string; count: number }[] = [
    {
      id: "pending",
      title: "Pendientes",
      count: allFilteredTasks.filter((t) => t.status === "pending").length,
    },
    {
      id: "in progress",
      title: "En Progreso",
      count: allFilteredTasks.filter((t) => t.status === "in progress").length,
    },
    {
      id: "completed",
      title: "Completadas",
      count: allFilteredTasks.filter((t) => t.status === "completed").length,
    },
  ];

  const handleClearArchive = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres borrar TODAS las tareas completadas? Esta acción no se puede deshacer.",
      )
    ) {
      for (const task of archivedTasks) {
        await deleteTask(task._id);
      }
    }
  };

  const renderTaskRow = (task: Task) => {
    const clientObj = task.client
      ? clients.find(
          (c) =>
            c._id ===
            (typeof task.client === "object"
              ? (task.client as any)._id
              : task.client),
        )
      : null;

    return (
      <motion.div
        key={task._id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        onClick={() => navigate(`/tasks/${task._id}`)}
        className="p-4 bg-white dark:bg-[#1A1A1A] border border-neutral-100 dark:border-neutral-800 rounded-xl hover:shadow-md transition-all flex items-center justify-between group cursor-pointer mb-3"
      >
        <div className="flex items-start space-x-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleCompleted(task);
            }}
            className="mt-0.5 flex-shrink-0 group/btn relative"
          >
            <div className="w-5 h-5 rounded border-2 border-neutral-300 dark:border-neutral-600 group-hover/btn:border-emerald-500 transition-colors"></div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 absolute top-0 left-0 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </button>
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-emerald--600 dark:group-hover:text-emerald--400 transition-colors">
              {task.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-medium">
              <span
                className={`px-2 py-0.5 rounded-md border ${getPriorityStyle(task.priority)}`}
              >
                {getPriorityLabel(task.priority)}
              </span>

              {clientObj && (
                <span
                  className={`px-2 py-0.5 rounded-md border flex items-center ${getClientCategoryStyle(clientObj.category)}`}
                >
                  <User className="w-3 h-3 mr-1 opacity-70" />
                  {clientObj.name}
                </span>
              )}

              {task.dueDate && (
                <span className="text-neutral-500 dark:text-neutral-400 flex items-center">
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  {new Date(task.dueDate).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
              {task.dueTime && (
                <span className="text-neutral-500 dark:text-neutral-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {task.dueTime}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(task);
            }}
            className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(task._id);
            }}
            className="p-2 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto transition-colors duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Proyectos y Tareas
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-light">
            Planifica, ejecuta y mantén tu espacio de trabajo limpio.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar tarea..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all shadow-sm outline-none"
            />
          </div>
          <button
            onClick={() => {
              setTaskToEdit(null);
              setSelectedDate(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-sm flex items-center justify-center whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" /> Nueva Tarea
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-px gap-4">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2 ${viewMode === "list" ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white" : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
          >
            <LayoutList className="w-4 h-4 mr-2" /> Lista{" "}
            <span className="ml-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 py-0.5 px-2 rounded-full text-xs">
              {activeTasks.length}
            </span>
          </button>

          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2 ${viewMode === "kanban" ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white" : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
          >
            <KanbanSquare className="w-4 h-4 mr-2" /> Tablero
          </button>

          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2 ${viewMode === "calendar" ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white" : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
          >
            <CalendarIcon className="w-4 h-4 mr-2" /> Calendario
          </button>

          <button
            onClick={() => setViewMode("archive")}
            className={`flex items-center whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2 ${viewMode === "archive" ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white" : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
          >
            <Archive className="w-4 h-4 mr-2" /> Archivo
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "list" && (
          <motion.div
            key="list"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-neutral-50/50 dark:bg-[#121212]/50 rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm p-6 sm:p-8 min-h-[300px] transition-colors"
          >
            {activeTasks.length === 0 ? (
              <div className="p-16 text-center">
                <CheckSquare className="w-12 h-12 text-neutral-200 dark:text-neutral-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Todo al día
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1 font-light">
                  No tienes tareas pendientes. ¡Tómate un respiro!
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                {overdueTasks.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-sm font-bold text-rose-600 dark:text-rose-500 uppercase tracking-wider flex items-center mb-4 border-b border-rose-100 dark:border-rose-900/50 pb-2">
                      <AlertTriangle className="w-4 h-4 mr-2" /> Tareas
                      Atrasadas
                    </h2>
                    <AnimatePresence>
                      {overdueTasks.map((task) => renderTaskRow(task))}
                    </AnimatePresence>
                  </div>
                )}

                {todayTasks.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider flex items-center mb-4 border-b border-emerald-100 dark:border-emerald-900/50 pb-2">
                      <Target className="w-4 h-4 mr-2" /> Para Hoy
                    </h2>
                    <AnimatePresence>
                      {todayTasks.map((task) => renderTaskRow(task))}
                    </AnimatePresence>
                  </div>
                )}

                {upcomingTasks.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                      <CalendarIcon className="w-4 h-4 mr-2" /> Próximas y Sin
                      Fecha
                    </h2>
                    <AnimatePresence>
                      {upcomingTasks.map((task) => renderTaskRow(task))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {viewMode === "kanban" && (
          <motion.div
            key="kanban"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col min-h-[500px]"
          >
            {/* 📱 Selector de Columnas para Móvil */}
            <div className="flex sm:hidden p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl mb-6 shadow-inner transition-colors">
              {kanbanColumns.map((column) => (
                <button
                  key={column.id}
                  onClick={() => setActiveKanbanTab(column.id)}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    activeKanbanTab === column.id
                      ? "bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-sm"
                      : "text-neutral-500"
                  }`}
                >
                  {column.title} ({column.count})
                </button>
              ))}
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 sm:flex-row flex-col">
              {kanbanColumns.map((column) => (
                <div
                  key={column.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropKanban(e, column.id)}
                  className={`flex-shrink-0 w-full sm:w-80 bg-neutral-50/50 dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 flex flex-col transition-all ${
                    activeKanbanTab === column.id ? "flex" : "hidden sm:flex"
                  }`}
                >
                  <div className="p-5 border-b border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
                    <h3 className="font-bold text-neutral-900 dark:text-white flex items-center">
                      {column.id === "pending" && (
                        <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 mr-2"></span>
                      )}
                      {column.id === "in progress" && (
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>
                      )}
                      {column.id === "completed" && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>
                      )}
                      {column.title}
                    </h3>
                    <span className="px-2.5 py-0.5 bg-neutral-200/50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full text-xs font-bold">
                      {column.count}
                    </span>
                  </div>
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    <AnimatePresence>
                      {allFilteredTasks
                        .filter((t) => t.status === column.id)
                        .map((task) => {
                          const clientObj = task.client
                            ? clients.find(
                                (c) =>
                                  c._id ===
                                  (typeof task.client === "object"
                                    ? (task.client as any)._id
                                    : task.client),
                              )
                            : null;

                          return (
                            <motion.div
                              key={task._id}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task._id)}
                              onClick={() => navigate(`/tasks/${task._id}`)}
                              className={`bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl shadow-sm border transition-all cursor-grab active:cursor-grabbing hover:shadow-md ${draggedTaskId === task._id ? "opacity-50 scale-95 border-emerald--500" : "border-neutral-200/60 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600"}`}
                            >
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityStyle(task.priority)}`}
                                >
                                  {getPriorityLabel(task.priority)}
                                </span>
                                {clientObj && (
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center ${getClientCategoryStyle(clientObj.category)}`}
                                  >
                                    <User className="w-3 h-3 mr-1 opacity-70" />{" "}
                                    {clientObj.name.split(" ")[0]}
                                  </span>
                                )}
                              </div>

                              <div className="flex justify-between items-start mb-1">
                                <h4
                                  className={`font-bold ${task.status === "completed" ? "text-neutral-400 dark:text-neutral-500 line-through" : "text-neutral-900 dark:text-white"}`}
                                >
                                  {task.title}
                                </h4>
                                {task.status === "completed" && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-2 flex-shrink-0" />
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                                {task.dueDate ? (
                                  <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                                    <CalendarIcon className="w-3 h-3 mr-1" />
                                    {new Date(task.dueDate).toLocaleDateString(
                                      "es-ES",
                                      { day: "numeric", month: "short" },
                                    )}
                                  </div>
                                ) : (
                                  <div />
                                )}
                                {task.dueTime && (
                                  <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                                    <Clock className="w-3 h-3 mr-1" />{" "}
                                    {task.dueTime}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {viewMode === "archive" && (
          <motion.div
            key="archive"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-neutral-50/50 dark:bg-[#121212]/50 rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm overflow-hidden min-h-[300px]"
          >
            {archivedTasks.length === 0 ? (
              <div className="p-16 text-center">
                <Archive className="w-12 h-12 text-neutral-200 dark:text-neutral-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Archivo vacío
                </h3>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                <div className="p-4 bg-neutral-100 dark:bg-[#1a1a1a] flex justify-end">
                  <button
                    onClick={handleClearArchive}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-500 dark:hover:text-rose-400 transition-colors"
                  >
                    Vaciar archivo
                  </button>
                </div>
                <AnimatePresence>
                  {archivedTasks.map((task) => (
                    <motion.div
                      key={task._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => navigate(`/tasks/${task._id}`)}
                      className="p-4 hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-start space-x-4 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCompleted(task);
                          }}
                          className="mt-1"
                          title="Devolver a tareas activas"
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </button>
                        <div>
                          <h3 className="font-semibold text-neutral-500 dark:text-neutral-400 line-through">
                            {task.title}
                          </h3>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(task._id);
                        }}
                        className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {viewMode === "calendar" && (
          <motion.div
            key="calendar"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm overflow-hidden p-4 sm:p-6 transition-colors"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white capitalize">
                {currentMonth.toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={prevMonth}
                  className="flex-1 sm:flex-none p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex justify-center"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="flex-[2] sm:flex-none px-4 py-2 text-sm font-bold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white transition-all active:scale-95"
                >
                  Hoy
                </button>
                <button
                  onClick={nextMonth}
                  className="flex-1 sm:flex-none p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex justify-center"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px mb-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
                <div
                  key={day}
                  className="text-center text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: startDay }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="min-h-[60px] sm:min-h-[120px] rounded-xl bg-neutral-50/30 dark:bg-neutral-800/20 border border-transparent"
                ></div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const tasksForDay = allFilteredTasks.filter(
                  (t) => t.dueDate && t.dueDate.startsWith(dateString),
                );
                const isToday =
                  new Date().toISOString().split("T")[0] === dateString;

                return (
                  <div
                    key={day}
                    onClick={() => handleDayClick(dateString)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropCalendar(e, dateString)}
                    className={`min-h-[80px] sm:min-h-[140px] p-1.5 sm:p-3 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                      isToday
                        ? "border-neutral-900 dark:border-white bg-neutral-50/50 dark:bg-neutral-800 ring-2 ring-neutral-900 dark:ring-white ring-offset-2 dark:ring-offset-[#121212]"
                        : "border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-lg hover:z-10 bg-white dark:bg-[#1a1a1a]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={`text-xs sm:text-base font-black w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-colors ${
                          isToday
                            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                            : "text-neutral-900 dark:text-neutral-400"
                        }`}
                      >
                        {day}
                      </span>
                      {tasksForDay.length > 0 && (
                        <span className="sm:hidden w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></span>
                      )}
                    </div>

                    <div className="hidden sm:block space-y-1.5 mt-2">
                      {tasksForDay.slice(0, 3).map((task) => (
                        <div
                          key={task._id}
                          className={`text-[10px] p-1.5 rounded-lg truncate font-bold border ${task.status === "completed" ? "opacity-40 grayscale" : getPriorityStyle(task.priority)} shadow-sm`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {tasksForDay.length > 3 && (
                        <p className="text-[9px] font-bold text-neutral-400 text-center">
                          +{tasksForDay.length - 3} más
                        </p>
                      )}
                    </div>

                    {/* Indicador visual de carga de trabajo en móvil por colores */}
                    <div className="sm:hidden absolute bottom-1 right-1 left-1 flex flex-wrap gap-0.5 pointer-events-none">
                      {tasksForDay.slice(0, 4).map((t) => (
                        <div
                          key={t._id}
                          className={`h-1 flex-1 rounded-full ${t.priority === "high" ? "bg-rose-500" : t.priority === "medium" ? "bg-amber-500" : "bg-blue-500"}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {totalPages > 1 && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-[#121212] p-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm mt-6"
        >
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 sm:mb-0">
            Mostrando página{" "}
            <span className="font-bold text-neutral-900 dark:text-white">
              {currentPage}
            </span>{" "}
            de{" "}
            <span className="font-bold text-neutral-900 dark:text-white">
              {totalPages}
            </span>
            <span className="mx-2">•</span> Total: {totalRecords} tareas en tu
            cuenta
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

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultDate={selectedDate}
      />
    </div>
  );
}
