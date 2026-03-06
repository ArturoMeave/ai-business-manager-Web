import { useState, useEffect } from 'react';
import { Receipt, Save, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { motion } from 'framer-motion';

export default function BillingTab() {
  const { user, updatePreferences, isLoading } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  // Usamos el tipo exacto que definiste
  const [currency, setCurrency] = useState<'€' | '$' | '£'>('€');

  useEffect(() => {
    if (user?.preferences) {
      setCompanyName(user.preferences.companyName || '');
      setTaxId(user.preferences.taxId || '');
      setAddress(user.preferences.address || '');
      // 🧹 ADIÓS ANY
      setCurrency(user.preferences.currency || '€');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      // 🧹 ADIÓS ANY
      await updatePreferences({ 
        ...user?.preferences,
        companyName, 
        taxId, 
        address, 
        currency 
      });

      setSuccessMsg('Datos de facturación actualizados.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-400 rounded-xl flex items-center shadow-sm">
          <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-medium">{successMsg}</p>
        </motion.div>
      )}

      <div className="bg-white dark:bg-[#121212] p-8 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm transition-colors">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 flex items-center">
          <Receipt className="w-5 h-5 mr-2 text-primary-600" /> Datos Fiscales
        </h3>
        <p className="text-sm text-neutral-500 mb-6">Esta información aparecerá en tus PDFs y facturas.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Razón Social</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-2 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm outline-none dark:text-white focus:border-neutral-900 dark:focus:border-white" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">NIF / CIF</label>
            <input type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)} className="w-full px-4 py-2 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm outline-none dark:text-white focus:border-neutral-900 dark:focus:border-white" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Dirección Completa</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-2 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm outline-none dark:text-white focus:border-neutral-900 dark:focus:border-white" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Moneda Base</label>
            {/* Aquí sí le pasamos 'as any' solo al evento de HTML, porque el select devuelve un string genérico, pero nuestro estado es seguro */}
            <select value={currency} onChange={(e) => setCurrency(e.target.value as any)} className="w-full px-4 py-2 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm outline-none dark:text-white focus:border-neutral-900 dark:focus:border-white">
              <option value="€">Euro (€)</option>
              <option value="$">Dólar ($)</option>
              <option value="£">Libra (£)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isLoading} className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-sm flex items-center">
          {isLoading ? 'Guardando...' : <><Save className="w-5 h-5 mr-2" /> Guardar Facturación</>}
        </button>
      </div>

    </form>
  );
}