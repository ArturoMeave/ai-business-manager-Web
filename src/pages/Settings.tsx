import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { Shield, Settings2, Palette, Lock, Receipt } from 'lucide-react';

// ⚡ IMPORTAMOS SOLO LOS CAJONES QUE NECESITAMOS
import GeneralTab from '../components/settings/GeneralTab';
import BillingTab from '../components/settings/BillingTab';
import AppearanceTab from '../components/settings/AppearanceTab';
import SecurityTab from '../components/settings/SecurityTab';

export default function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'general'|'billing'|'appearance'|'security'>('general');

  const menuItems = [
    { id: 'general', label: 'General e IA', icon: Settings2 },
    { id: 'billing', label: 'Facturación', icon: Receipt },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
    { id: 'security', label: 'Seguridad', icon: Lock },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto transition-colors duration-300">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Ajustes del Espacio</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-light">Configura tu entorno de trabajo a medida.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        <div className="md:col-span-4 space-y-6 sticky top-24">
          
          <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-50 dark:bg-neutral-800/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col items-center text-center pt-4">
              <div className="w-20 h-20 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-3xl shadow-md border-4 border-white dark:border-[#121212] mb-3 transition-colors">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{user?.name}</h2>
              <div className="inline-flex items-center mt-1.5 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                <Shield className="w-3 h-3 mr-1.5" /> Admin
              </div>
            </div>
          </div>

          <nav className="bg-white dark:bg-[#121212] p-3 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm transition-colors flex flex-col space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === item.id 
                    ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-white shadow-sm' 
                    : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                <item.icon className={`w-4 h-4 mr-3 ${activeTab === item.id ? 'text-emerald--600 dark:text-emerald--400' : 'opacity-70'}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="md:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === 'general' && <GeneralTab />}
              {activeTab === 'billing' && <BillingTab />}
              {activeTab === 'appearance' && <AppearanceTab />}
              {activeTab === 'security' && <SecurityTab />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}