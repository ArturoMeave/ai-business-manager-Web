import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, User } from 'lucide-react';
import { useFinanceStore } from '../../stores/financeStore';
import { useAuthStore } from '../../stores/authStore'; 
import { useClientStore } from '../../stores/clientStore';
import type { FinanceType, FinanceStatus } from '../../types';

interface FinanceModalProps { 
  isOpen: boolean; 
  onClose: () => void; 
  defaultType?: FinanceType;
  defaultDescription?: string;
  preselectedClientId?: string;
}

// ⚡ CATEGORÍAS 100% REALES Y COTIDIANAS
const CATEGORIES_BY_ROLE = {
  worker: { 
    ingreso: [
      'Nómina', 'Bizum de amigos / Deudas', 'Venta en Wallapop / Vinted', 
      'Paga Extra', 'Regalo familiar', 'Devolución de Hacienda', 
      'Apuestas / Lotería', 'Otros Ingresos'
    ], 
    gasto: [
      'Alquiler / Hipoteca', 'Supermercado y Alimentación', 'Luz / Agua / Gas', 
      'Bares, Cervezas y Salidas', 'Restaurantes / Comida a domicilio', 'Móvil e Internet', 
      'Coche / Gasolina / Taller', 'Transporte público / Uber', 'Ropa y Calzado', 
      'Suscripciones (Netflix, Spotify, Gym)', 'Peluquería / Belleza', 'Farmacia / Médico', 
      'Mascotas (Comida, Vet)', 'Viajes y Vacaciones', 'Tabaco / Vicios', 'Otros Gastos'
    ] 
  },
  freelancer: { 
    ingreso: [
      'Cobro de Factura', 'Ingreso en Efectivo (Sin Factura)', 'Trabajo extra / Chapuza', 
      'Subvención (Kit Digital, etc)', 'Devolución de Hacienda', 'Ingreso pasivo (YouTube, Ads)', 
      'Otros Ingresos'
    ], 
    gasto: [
      'Cuota de Autónomos', 'Liquidación IVA (Trimestral)', 'Liquidación IRPF (Trimestral)', 
      'El Gestor / Asesoría', 'Compras de Material / Stock', 'Dietas / Comida de trabajo', 
      'Gasolina / Desplazamientos', 'Teléfono e Internet', 'Suscripciones (Adobe, ChatGPT, etc)', 
      'Publicidad (Instagram, Google)', 'Equipo Informático (PC, Móvil)', 'Comisiones del Banco / Stripe', 
      'Otros Gastos'
    ] 
  },
  company: { 
    ingreso: [
      'Facturación a Clientes', 'Ventas TPV / Mostrador', 'Préstamo Bancario', 
      'Subvenciones', 'Aportación de Socios', 'Otros Ingresos'
    ], 
    gasto: [
      'Nóminas de Empleados', 'Seguridad Social (TCs)', 'Impuesto de Sociedades', 
      'Pago a Proveedores', 'Alquiler de Local / Nave', 'Suministros (Luz, Agua, Internet)', 
      'Gestoría, Notaría y Abogados', 'Mantenimiento y Limpieza', 'Campaña de Marketing', 
      'Seguros (Local, Responsabilidad)', 'Gastos Financieros / Préstamos', 'Otros Gastos'
    ] 
  },
  god_mode: { 
    ingreso: [
      'Nómina / Honorarios', 'Cobro a Cliente', 'Bizum / Transferencia', 
      'Subvenciones / Préstamos', 'Ventas varias', 'Otros Ingresos'
    ], 
    gasto: [
      'Supermercado y Vida', 'Alquiler / Hipoteca / Local', 'Impuestos y Cuotas', 
      'Proveedores y Material', 'Ocio y Restaurantes', 'Suscripciones y Software', 
      'Transporte / Vehículo', 'Salud y Farmacia', 'Otros Gastos'
    ] 
  }
};

export default function FinanceModal({ isOpen, onClose, defaultType, defaultDescription, preselectedClientId }: FinanceModalProps) {
  const { addFinance, isLoading } = useFinanceStore();
  const { clients, fetchClients } = useClientStore();
  const { user } = useAuthStore(); 
  
  const userRole = user?.preferences?.role || 'god_mode';
  const availableCategories = CATEGORIES_BY_ROLE[userRole as keyof typeof CATEGORIES_BY_ROLE] || CATEGORIES_BY_ROLE['god_mode'];

  const [formData, setFormData] = useState({ 
    type: 'ingreso' as FinanceType, 
    amount: '' as number | '', 
    description: '',
    title: '', 
    category: availableCategories.ingreso[0], 
    status: 'completado' as FinanceStatus, 
    date: new Date().toISOString().split('T')[0],
    client: '' 
  });

  useEffect(() => {
    if (clients.length === 0) fetchClients();
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const type = defaultType || 'ingreso';
      setFormData({
        type: type,
        amount: '',
        description: defaultDescription || '',
        title: '',
        category: availableCategories[type][0],
        status: 'completado',
        date: new Date().toISOString().split('T')[0],
        client: preselectedClientId || '' 
      });
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, defaultType, defaultDescription, preselectedClientId, clients.length, availableCategories]);

  const handleTypeChange = (newType: FinanceType) => { 
    setFormData({ ...formData, type: newType, category: availableCategories[newType][0] }); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData, amount: Number(formData.amount) || 0 };
      if (!dataToSend.client || dataToSend.client === '') {
        delete (dataToSend as any).client;
      }
      await addFinance(dataToSend);
      onClose();
    } catch (error) { console.error(error); }
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
            className="bg-white dark:bg-[#121212] rounded-t-[2.5rem] sm:rounded-3xl shadow-xl border border-neutral-200/60 dark:border-neutral-800 w-full max-w-lg relative z-10 overflow-hidden transition-colors duration-300 mt-auto sm:mt-0"
          >
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 transition-colors">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white transition-colors">Registrar Movimiento</h2>
              <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto no-scrollbar touch-pan-y">
              <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl transition-colors">
                <button type="button" onClick={() => handleTypeChange('ingreso')} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${formData.type === 'ingreso' ? 'bg-white dark:bg-[#1a1a1a] text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>Ingreso (+€)</button>
                <button type="button" onClick={() => handleTypeChange('gasto')} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${formData.type === 'gasto' ? 'bg-white dark:bg-[#1a1a1a] text-rose-700 dark:text-rose-400 shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>Gasto (-€)</button>
              </div>

              {!preselectedClientId && (
                <div>
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center transition-colors"><User className="w-3.5 h-3.5 mr-1" /> Cliente Vinculado (Opcional)</label>
                  <select value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 outline-none transition-all">
                    <option value="">Ninguno</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Cantidad (€) *</label>
                  <input type="number" step="0.01" min="0" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value === '' ? '' : Number(e.target.value) })} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-lg font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 outline-none transition-all" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Fecha *</label>
                  <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Título del Movimiento (Opcional)</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 outline-none transition-all" placeholder="Ej. Factura Enero, Compra Material..." />
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Descripción / Notas *</label>
                <input type="text" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 outline-none transition-all" placeholder="Detalles del pago o cobro..." />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center transition-colors"><Tag className="w-3.5 h-3.5 mr-1" /> Categoría</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 outline-none transition-all">
                    {availableCategories[formData.type].map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block transition-colors">Estado</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as FinanceStatus })} className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 outline-none transition-all">
                    <option value="completado">Pagado / Cobrado</option>
                    <option value="estimado">Pendiente / Estimado</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end space-x-3 border-t border-neutral-100 dark:border-neutral-800 transition-colors">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-medium text-white dark:text-neutral-900 bg-neutral-900 dark:bg-white rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                  {isLoading ? 'Guardando...' : 'Guardar Movimiento'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}