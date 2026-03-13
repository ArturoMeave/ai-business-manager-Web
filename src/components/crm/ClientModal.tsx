import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign } from 'lucide-react';
import { useClientStore } from '../../stores/clientStore';
import type { Client, ClientCategory } from '../../types';

interface ClientCardProps {
    isOpen: boolean;
    onClose: () => void;
    clientToEdit?: Client | null; 
}

const CATEGORIES: ClientCategory[] = ['General', 'Prospect', 'Potencial', 'Active', 'VIP', 'Inactive'];

export default function ClientModal({ isOpen, onClose, clientToEdit }: ClientCardProps) {
    const { addClient, updateClient, isLoading } = useClientStore();

    const [formData, setFormData] = useState({ 
        name: '', companyName: '', email: '', phone: '', category: 'General' as ClientCategory, totalValue: '' as number | '' 
    });

    useEffect(() => {
        if (clientToEdit) {
            setFormData({ 
                name: clientToEdit.name, companyName: clientToEdit.companyName || '', 
                email: clientToEdit.email || '', phone: clientToEdit.phone || '', 
                category: clientToEdit.category, 
                totalValue: (clientToEdit as any).totalValue || ''
            });
        } else {
            setFormData({ name: '', companyName: '', email: '', phone: '', category: 'General', totalValue: '' });
        }
    }, [clientToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Aseguramos que se envía un número real a la base de datos
            const dataToSend = { ...formData, totalValue: Number(formData.totalValue) || 0 };
            if (clientToEdit) await updateClient(clientToEdit._id, dataToSend);
            else await addClient(dataToSend);
            onClose();
        } catch (error) { console.error('Error al guardar el cliente', error); }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-sm transition-colors duration-300" />

                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-[#121212] rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 w-full max-w-lg relative z-10 overflow-hidden transition-colors duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 transition-colors">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white transition-colors">
                                {clientToEdit ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
                            </h2>
                            <button type="button" onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Nombre del Contacto *</label>
                                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all" placeholder="Ej. Ana García" />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Empresa / Proyecto</label>
                                    <input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all" placeholder="Ej. Reforma Chalet" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center transition-colors">
                                        <DollarSign className="w-4 h-4 mr-1" /> Valor Total (€)
                                    </label>
                                    <input type="number" min="0" value={formData.totalValue} onChange={(e) => setFormData({ ...formData, totalValue: e.target.value === '' ? '' : Number(e.target.value) })} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all" placeholder="0" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Email</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all" placeholder="ana@empresa.com" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Teléfono</label>
                                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all" placeholder="+34 600 000 000" />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Estado / Categoría</label>
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as ClientCategory })} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 outline-none transition-all">
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            
                            <div className="pt-6 flex items-center justify-end space-x-3 border-t border-neutral-100 dark:border-neutral-800 transition-colors">
                                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">Cancelar</button>
                                <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-medium text-white dark:text-neutral-900 bg-neutral-900 dark:bg-white rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                                    {isLoading ? 'Guardando...' : 'Guardar Cliente'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}