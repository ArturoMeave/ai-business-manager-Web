import { useState, useEffect } from 'react';
import { User, Briefcase, Bot, UserCircle, Building, Crown, Save, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/auth.service';
import { motion } from 'framer-motion';

export default function GeneralTab() {
  const { user, updatePreferences, isLoading, loadUser } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // ⚡ TypeScript ya sabe qué opciones hay gracias a tu types/index.ts
  const [aiTone, setAiTone] = useState<'motivational' | 'analytical' | 'strategic'>('strategic');
  const [monthlyGoal, setMonthlyGoal] = useState<number>(0);
  const [userRole, setUserRole] = useState<'worker' | 'freelancer' | 'company' | 'god_mode'>('god_mode');

  // 🧹 ADIÓS ANY: Leemos la moneda directamente
  const currency = user?.preferences?.currency || '€';

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      if (user.preferences) {
        setAiTone(user.preferences.aiTone || 'strategic');
        setMonthlyGoal(user.preferences.monthlyGoal || 0);
        // 🧹 ADIÓS ANY: Leemos el rol directamente
        setUserRole(user.preferences.role || 'god_mode');
      }
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      // 🧹 ADIÓS ANY: Guardamos las preferencias de forma segura
      await updatePreferences({ 
        ...user?.preferences, 
        aiTone, 
        monthlyGoal, 
        role: userRole 
      });

      if (name !== user?.name || email !== user?.email) {
        await authService.updateDetails({ name, email });
        if (loadUser) await loadUser(); 
      }

      setSuccessMsg('Ajustes generales actualizados.');
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
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-500" /> Información Personal
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Nombre Completo</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm outline-none dark:text-white focus:border-neutral-900 dark:focus:border-white transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Correo Electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm outline-none dark:text-white focus:border-neutral-900 dark:focus:border-white transition-all" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#121212] p-8 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm transition-colors">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-neutral-400" /> Perfil Operativo
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Modelo de Negocio</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'worker', title: 'Empleado', icon: UserCircle },
                { id: 'freelancer', title: 'Autónomo', icon: Briefcase },
                { id: 'company', title: 'Empresa', icon: Building },
                { id: 'god_mode', title: 'Modo Dios', icon: Crown }
              ].map((role) => (
                <div key={role.id} onClick={() => setUserRole(role.id as any)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center space-x-3 ${userRole === role.id ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800' : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-300'}`}>
                  <role.icon className={`w-5 h-5 ${userRole === role.id ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`} />
                  <span className={`text-sm font-bold ${userRole === role.id ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>{role.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Meta Mensual ({currency})</label>
            <input type="number" value={monthlyGoal} onChange={(e) => setMonthlyGoal(Number(e.target.value))} className="w-full max-w-xs px-4 py-2 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white dark:text-white" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#121212] p-8 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm transition-colors">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 flex items-center">
          <Bot className="w-5 h-5 mr-2 text-primary-600" /> Asistente de IA
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'strategic', label: 'Estratégico' },
            { id: 'analytical', label: 'Analítico' },
            { id: 'motivational', label: 'Motivacional' }
          ].map((tone) => (
            <div key={tone.id} onClick={() => setAiTone(tone.id as any)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${aiTone === tone.id ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>
              <p className="text-sm font-bold">{tone.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isLoading} className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-sm flex items-center">
          {isLoading ? 'Guardando...' : <><Save className="w-5 h-5 mr-2" /> Guardar Ajustes Generales</>}
        </button>
      </div>
    </form>
  );
}