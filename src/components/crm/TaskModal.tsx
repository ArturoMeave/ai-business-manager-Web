import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock } from 'lucide-react';
import { useTaskStore } from '../../stores/taskStores';
import { useClientStore } from '../../stores/clientStore';
import type { Task, TaskPriority, TaskStatus, TaskCategory } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultDate?: string | null; 
  preselectedClientId?: string; // 👈 NUEVO: Parámetro para forzar un cliente
}

export default function TaskModal({ isOpen, onClose, taskToEdit, defaultDate, preselectedClientId }: TaskModalProps) {
  const { addTask, updateTask, isLoading } = useTaskStore();
  const { clients, fetchClients } = useClientStore();

  const [formData, setFormData] = useState({
    title: '', description: '', status: 'pending' as TaskStatus,
    priority: 'medium' as TaskPriority, category: 'Llamada' as TaskCategory,
    budget: 0, client: '', dueDate: '', dueTime: '',
  });

  useEffect(() => {
    if (clients.length === 0) fetchClients();
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title, description: taskToEdit.description || '',
        status: taskToEdit.status, priority: taskToEdit.priority, category: taskToEdit.category, budget: taskToEdit.budget || 0,
        client: taskToEdit.client ? (typeof taskToEdit.client === 'object' ? (taskToEdit.client as any)._id : taskToEdit.client) : '',
        dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '', dueTime: taskToEdit.dueTime || '',
      });
    } else {
      // 👈 NUEVO: Si recibimos un cliente preseleccionado, lo metemos directamente
      setFormData({ 
        title: '', description: '', status: 'pending', priority: 'medium', category: 'Llamada', budget: 0, 
        client: preselectedClientId || '', 
        dueDate: defaultDate || new Date().toISOString().split('T')[0], dueTime: '' 
      });
    }
  }, [taskToEdit, isOpen, clients.length, defaultDate, preselectedClientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      
      // ⚡ SOLUCIÓN BUG 2: Si el cliente es "Ninguno" (vacío), 
      // no borramos la variable, forzamos que se envíe vacía para que el backend la limpie.
      if (!dataToSend.client || dataToSend.client === '') {
          dataToSend.client = ''; 
      }
      
      if (taskToEdit) {
        await updateTask(taskToEdit._id, dataToSend);
      } else {
        // En la creación, si el cliente está vacío sí podemos borrar la variable para evitar errores.
        if (dataToSend.client === '') delete (dataToSend as any).client;
        await addTask(dataToSend);
      }
      
      onClose();
    } catch (error) { 
      console.error(error); 
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-sm transition-colors duration-300" />
          
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-[#121212] rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 w-full max-w-lg relative z-10 overflow-hidden transition-colors duration-300">
            
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 transition-colors">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white transition-colors">{taskToEdit ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
              <button type="button" onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Título de la Tarea *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all" placeholder="Ej. Presentación comercial..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                
                {/* 👈 NUEVO: Si hay preselectedClientId, OCULTAMOS este bloque */}
                {!preselectedClientId && (
                  <div className="sm:col-span-5">
                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Cliente</label>
                    <select value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all">
                      <option value="">Ninguno</option>
                      {clients.map(client => <option key={client._id} value={client._id}>{client.name}</option>)}
                    </select>
                  </div>
                )}

                {/* 👇 Ajustamos el tamaño (col-span) dinámicamente si ocultamos el cliente */}
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
                  <input type="number" min="0" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all" />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end space-x-3 border-t border-neutral-100 dark:border-neutral-800 transition-colors">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-medium text-white dark:text-neutral-900 bg-neutral-900 dark:bg-white rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                  {isLoading ? 'Guardando...' : 'Guardar Tarea'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}