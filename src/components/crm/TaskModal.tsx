import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Edit2, CheckCircle2, AlertCircle, User, Tag, Euro } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStores';
import { useClientStore } from '../../stores/clientStore';
import type { Task, TaskPriority, TaskStatus, TaskCategory } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultDate?: string | null;
  defaultTime?: string | null;
  preselectedClientId?: string;
}

export default function TaskModal({ 
  isOpen, 
  onClose, 
  taskToEdit, 
  defaultDate, 
  defaultTime,
  preselectedClientId 
}: TaskModalProps) {
  const { addTask, updateTask, isLoading } = useTaskStore();
  const { clients, fetchClients } = useClientStore();

  const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('create');

  const [formData, setFormData] = useState({
    title: '', description: '', status: 'pending' as TaskStatus,
    priority: 'medium' as TaskPriority, category: 'Llamada' as TaskCategory,
    budget: '' as number | '', client: '', dueDate: '', dueTime: '',
  });

  useEffect(() => {
    if (clients.length === 0) fetchClients();
    
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title, description: taskToEdit.description || '',
        status: taskToEdit.status, priority: taskToEdit.priority, category: taskToEdit.category, 
        budget: taskToEdit.budget || '',
        client: taskToEdit.client ? (typeof taskToEdit.client === 'object' ? (taskToEdit.client as any)._id : taskToEdit.client) : '',
        dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '', dueTime: taskToEdit.dueTime || '',
      });
      setModalMode('view');
    } else {
      setFormData({ 
        title: '', description: '', status: 'pending', priority: 'medium', category: 'Llamada', budget: '', 
        client: preselectedClientId || '', 
        dueDate: defaultDate || new Date().toISOString().split('T')[0], 
        dueTime: defaultTime || '' 
      });
      setModalMode('create');
    }
  }, [taskToEdit, isOpen, clients.length, defaultDate, defaultTime, preselectedClientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData, budget: Number(formData.budget) || 0 };
      if (!dataToSend.client || dataToSend.client === '') dataToSend.client = ''; 
      
      if (taskToEdit) {
        await updateTask(taskToEdit._id, dataToSend);
      } else {
        if (dataToSend.client === '') delete (dataToSend as any).client;
        await addTask(dataToSend);
      }
      onClose();
    } catch (error) { console.error(error); }
  };

  const getPriorityStyle = (priority: string) => {
    if (priority === "high") return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400";
    if (priority === "medium") return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
  };

  const getStatusStyle = (status: string) => {
    if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (status === "in progress") return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400";
    return "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-800/50 dark:text-neutral-400";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-sm transition-colors duration-300 touch-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 100 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 100 }} 
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-[#121212] rounded-t-[2.5rem] sm:rounded-[2rem] shadow-xl border border-neutral-200 dark:border-neutral-800 w-full max-w-lg relative z-10 overflow-hidden transition-colors duration-300 mx-auto mt-auto sm:mt-0"
          >
            
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 transition-colors">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white transition-colors">
                {modalMode === 'view' ? 'Detalles de Tarea' : modalMode === 'edit' ? 'Editar Tarea' : 'Nueva Tarea'}
              </h2>
              <div className="flex items-center space-x-2">
                {modalMode === 'view' && (
                  <button onClick={() => setModalMode('edit')} className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                )}
                <button type="button" onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[80vh] overflow-y-auto no-scrollbar touch-pan-y">
              <AnimatePresence mode="wait">
                {modalMode === 'view' ? (
                  <motion.div 
                    key="view" 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="p-8 space-y-8"
                  >
                    <div>
                      <h3 className="text-3xl font-black text-neutral-900 dark:text-white leading-tight">{formData.title}</h3>
                      {formData.description && (
                        <div className="mt-4 p-4 bg-neutral-50 dark:bg-[#1a1a1a] rounded-2xl border border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed italic">
                          "{formData.description}"
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center"><Calendar className="w-3 h-3 mr-1" /> Fecha</label>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{formData.dueDate || 'Sin fecha'}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center"><Clock className="w-3 h-3 mr-1" /> Hora</label>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{formData.dueTime || 'No definida'}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center"><User className="w-3 h-3 mr-1" /> Cliente</label>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">
                          {clients.find(c => c._id === formData.client)?.name || 'Sin asignar'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center"><Tag className="w-3 h-3 mr-1" /> Categoría</label>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{formData.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                      <div className={`px-4 py-2 rounded-full border text-xs font-black uppercase tracking-wider flex items-center ${getStatusStyle(formData.status)}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                        {formData.status === 'completed' ? 'Completada' : formData.status === 'in progress' ? 'En Progreso' : 'Pendiente'}
                      </div>
                      <div className={`px-4 py-2 rounded-full border text-xs font-black uppercase tracking-wider flex items-center ${getPriorityStyle(formData.priority)}`}>
                        <AlertCircle className="w-3.5 h-3.5 mr-2" />
                        {formData.priority === 'high' ? 'Alta 🚨' : formData.priority === 'medium' ? 'Media' : 'Baja'}
                      </div>
                      {formData.budget && (
                        <div className="ml-auto flex items-center text-emerald-600 dark:text-emerald-400 font-black">
                          <Euro className="w-4 h-4 mr-1" />
                          <span>{formData.budget}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-6 space-y-5"
                  >
                    <div>
                      <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Título de la Tarea *</label>
                      <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all" placeholder="Ej. Presentación comercial..." />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      {!preselectedClientId && (
                        <div className="sm:col-span-5">
                          <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Cliente</label>
                          <select value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all">
                            <option value="">Ninguno</option>
                            {clients.map(client => <option key={client._id} value={client._id}>{client.name}</option>)}
                          </select>
                        </div>
                      )}
                      <div className={preselectedClientId ? "sm:col-span-7" : "sm:col-span-4"}>
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center transition-colors"><Calendar className="w-4 h-4 mr-1" /> Fecha</label>
                        <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all" />
                      </div>
                      <div className={preselectedClientId ? "sm:col-span-5" : "sm:col-span-3"}>
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center transition-colors"><Clock className="w-4 h-4 mr-1" /> Hora</label>
                        <input type="time" value={formData.dueTime} onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })} className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all" />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Descripción</label>
                      <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all min-h-[80px] resize-none" placeholder="Detalles extra..." />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Estado</label>
                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })} className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all">
                          <option value="pending">Pendiente</option>
                          <option value="in progress">En Progreso</option>
                          <option value="completed">Completada</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Prioridad</label>
                        <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })} className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all">
                          <option value="low">Baja</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta 🚨</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Cobro (€)</label>
                        <input type="number" min="0" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value === '' ? '' : Number(e.target.value) })} className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all" placeholder="0" />
                      </div>
                    </div>

                    <div className="pt-6 flex items-center justify-end space-x-3 border-t border-neutral-100 dark:border-neutral-800 transition-colors">
                      <button 
                        type="button" 
                        onClick={modalMode === 'edit' ? () => setModalMode('view') : onClose} 
                        className="px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {modalMode === 'edit' ? 'Volver' : 'Cancelar'}
                      </button>
                      <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-medium text-white dark:text-neutral-900 bg-neutral-900 dark:bg-white rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                        {isLoading ? 'Guardando...' : 'Guardar Tarea'}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}