import { useState, useEffect } from 'react';
import { User, Briefcase, Bot, Save, CheckCircle2, Sliders, FileText, Building, Target, Phone, Mail, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/auth.service';
import { motion } from 'framer-motion';

export default function GeneralTab() {
  const { user, updatePreferences, isLoading, loadUser } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState('');

  // 👤 Info Personal
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // 🏢 Info Empresa
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [currency, setCurrency] = useState('€');
  const [monthlyGoal, setMonthlyGoal] = useState<number>(0);

  // 🤖 Info IA
  const [aiTone, setAiTone] = useState<'motivational' | 'analytical' | 'strategic'>('strategic');
  const [aiCreativity, setAiCreativity] = useState(50);
  const [aiContext, setAiContext] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      if (user.preferences) {
        setPhone(user.preferences.phone || '');
        setCompanyName(user.preferences.companyName || '');
        setTaxId(user.preferences.taxId || '');
        setCurrency(user.preferences.currency || '€');
        setMonthlyGoal(user.preferences.monthlyGoal || 0);
        setAiTone(user.preferences.aiTone || 'strategic');
        setAiCreativity(user.preferences.aiCreativity ?? 50);
        setAiContext(user.preferences.aiContext || '');
      }
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      await updatePreferences({ 
        ...user?.preferences, 
        phone, companyName, taxId, currency, monthlyGoal, aiTone, aiCreativity, aiContext 
      });

      if (name !== user?.name || email !== user?.email) {
        await authService.updateDetails({ name, email });
        if (loadUser) await loadUser(); 
      }

      setSuccessMsg('Ajustes generales y de IA actualizados correctamente.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      
      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-400 rounded-xl flex items-center shadow-sm">
          <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-medium">{successMsg}</p>
        </motion.div>
      )}

      {/* ================= SECCIÓN 1: PERFIL PERSONAL ================= */}
      <div className="bg-white dark:bg-[#121212] p-8 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-500" /> Perfil de Administrador
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="md:col-span-1">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center">
              <User className="w-4 h-4 mr-1.5 text-neutral-400" /> Nombre Completo
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm outline-none dark:text-white focus:ring-2 focus:ring-emerald--500 transition-all" />
          </div>
          <div className="md:col-span-1">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center">
              <Mail className="w-4 h-4 mr-1.5 text-neutral-400" /> Correo Electrónico
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm outline-none dark:text-white focus:ring-2 focus:ring-emerald--500 transition-all" />
          </div>
          <div className="md:col-span-1">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center">
              <Phone className="w-4 h-4 mr-1.5 text-neutral-400" /> Teléfono (Opcional)
            </label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+34 600 000 000" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm outline-none dark:text-white focus:ring-2 focus:ring-emerald--500 transition-all" />
          </div>
        </div>
      </div>

      {/* ================= SECCIÓN 2: DETALLES DEL NEGOCIO ================= */}
      <div className="bg-white dark:bg-[#121212] p-8 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-amber-500" /> Configuración del Negocio
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center">
              <Building className="w-4 h-4 mr-1.5 text-neutral-400" /> Nombre de la Empresa / Marca
            </label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ej. Tech Solutions SL" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm outline-none dark:text-white focus:ring-2 focus:ring-emerald--500 transition-all" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center">
              <FileText className="w-4 h-4 mr-1.5 text-neutral-400" /> NIF / CIF / ID Fiscal
            </label>
            <input type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="B12345678" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm outline-none dark:text-white focus:ring-2 focus:ring-emerald--500 transition-all" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center">
              <Target className="w-4 h-4 mr-1.5 text-neutral-400" /> Meta de Facturación Mensual
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-400">{currency}</span>
              <input type="number" value={monthlyGoal} onChange={(e) => setMonthlyGoal(Number(e.target.value))} className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald--500 dark:text-white transition-all" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center">
              <CreditCard className="w-4 h-4 mr-1.5 text-neutral-400" /> Moneda Principal
            </label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald--500 dark:text-white cursor-pointer transition-all">
              <option value="€">Euro (€)</option>
              <option value="$">Dólar ($)</option>
              <option value="£">Libra (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= SECCIÓN 3: CEREBRO IA ================= */}
      <div className="bg-white dark:bg-[#121212] p-8 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl"></div>
        
        <div className="mb-8">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 flex items-center">
            <Bot className="w-5 h-5 mr-2 text-emerald-500" /> Cerebro de Inteligencia Artificial
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Personaliza el comportamiento, la creatividad y el contexto de tu asistente virtual integrado.</p>
        </div>
        
        <div className="space-y-8 relative z-10">
          
          {/* Tono de la IA */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Tono de Respuesta</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'strategic', label: 'Estratégico & Directo', desc: 'Respuestas cortas, concisas y al grano.' },
                { id: 'analytical', label: 'Analítico & Detallado', desc: 'Enfoque profundo en métricas y datos.' },
                { id: 'motivational', label: 'Coach & Mentoring', desc: 'Enfocado en el crecimiento y motivación.' }
              ].map((tone) => (
                <div key={tone.id} onClick={() => setAiTone(tone.id as any)} className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${aiTone === tone.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'}`}>
                  <p className={`text-sm font-bold ${aiTone === tone.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-neutral-700 dark:text-neutral-300'}`}>{tone.label}</p>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">{tone.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Slider de Creatividad */}
          <div className="bg-neutral-50 dark:bg-[#1a1a1a] p-6 rounded-xl border border-neutral-100 dark:border-neutral-800">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center">
                <Sliders className="w-4 h-4 mr-2 text-emerald-500" /> Temperatura / Creatividad
              </label>
              <span className="text-xs font-bold bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-700 px-3 py-1 rounded-lg text-neutral-700 dark:text-neutral-300 shadow-sm">
                {aiCreativity}%
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={aiCreativity} 
              onChange={(e) => setAiCreativity(Number(e.target.value))} 
              className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
            />
            <div className="flex justify-between text-[11px] text-neutral-500 mt-3 font-bold uppercase tracking-wider">
              <span>Robótico y Preciso (0%)</span>
              <span>Equilibrado (50%)</span>
              <span>Muy Creativo (100%)</span>
            </div>
          </div>

          {/* Contexto Personalizado */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-emerald-500" /> Contexto Personalizado (Prompt Oculto)
            </label>
            <p className="text-xs text-neutral-500 mb-3">Estas instrucciones se inyectarán de forma invisible cada vez que hables con la IA para que conozca tu negocio a la perfección.</p>
            <textarea 
              value={aiContext} 
              onChange={(e) => setAiContext(e.target.value)} 
              placeholder="Ej: 'Soy un diseñador gráfico freelance. Mis clientes principales son restaurantes de lujo. Siempre que me hables, ten en cuenta que trabajo solo y me gusta un tono muy profesional y directo.'" 
              rows={5} 
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm outline-none dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all resize-none leading-relaxed"
            />
          </div>

        </div>
      </div>

      {/* ================= BOTÓN DE GUARDAR ================= */}
      <div className="flex justify-end pt-4 pb-10">
        <button type="submit" disabled={isLoading} className="px-8 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-xl shadow-neutral-900/10 flex items-center disabled:opacity-50">
          {isLoading ? 'Guardando cambios...' : <><Save className="w-5 h-5 mr-2" /> Guardar Todos los Ajustes</>}
        </button>
      </div>
    </form>
  );
}