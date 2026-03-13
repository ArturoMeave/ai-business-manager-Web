import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Building2, Receipt, CreditCard, MapPin, Map, Phone, Globe, Hash } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';

export default function BillingTab() {
  const { user, loadUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    companyName: user?.preferences?.companyName || '',
    taxId: user?.preferences?.taxId || '',
    address: user?.preferences?.address || '',
    city: user?.preferences?.city || '',
    zipCode: user?.preferences?.zipCode || '',
    country: user?.preferences?.country || '',
    phone: user?.preferences?.phone || '',
    iban: user?.preferences?.iban || '',
    currency: user?.preferences?.currency || 'EUR'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg('');
    try {
      await api.put('/auth/preferences', formData);
      await loadUser(); // Recargamos el usuario global
      setSuccessMsg('Datos fiscales actualizados correctamente.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Datos Fiscales y Facturación</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Esta información se utilizará automáticamente al generar facturas y presupuestos en PDF.
        </p>
      </div>

      <div className="bg-white dark:bg-[#121212] border border-neutral-200/60 dark:border-neutral-800/60 rounded-3xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center"><Building2 className="w-4 h-4 mr-1.5" /> Nombre o Razón Social</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Ej. Tech Solutions S.L." />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center"><Receipt className="w-4 h-4 mr-1.5" /> NIF / CIF</label>
              <input type="text" name="taxId" value={formData.taxId} onChange={handleChange} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Ej. B12345678" />
            </div>
          </div>

          {/* bloque de dirección */}
          <div className="border-t border-neutral-100 dark:border-neutral-800/60 pt-6">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">Dirección y Contacto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> Dirección (Calle, Número, Piso)</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Ej. Calle Gran Vía, 4, 2ºA" />
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center"><Map className="w-4 h-4 mr-1.5" /> Ciudad / Provincia</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Ej. Madrid" />
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center"><Hash className="w-4 h-4 mr-1.5" /> Código Postal</label>
                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Ej. 28013" />
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center"><Globe className="w-4 h-4 mr-1.5" /> País</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Ej. España" />
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center"><Phone className="w-4 h-4 mr-1.5" /> Teléfono Comercial</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Ej. +34 600 000 000" />
              </div>
            </div>
          </div>

          {/* configuración bancaria */}
          <div className="border-t border-neutral-100 dark:border-neutral-800/60 pt-6">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">Datos Bancarios</h3>
            <div>
              <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center"><CreditCard className="w-4 h-4 mr-1.5" /> IBAN / Número de Cuenta (Aparecerá en la factura)</label>
              <input type="text" name="iban" value={formData.iban} onChange={handleChange} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Ej. ES91 1234 1234 12 1234567890" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
            {successMsg ? <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{successMsg}</span> : <span />}
            <button type="submit" disabled={isLoading} className="flex items-center px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Datos'}
            </button>
          </div>

        </form>
      </div>
    </motion.div>
  );
}