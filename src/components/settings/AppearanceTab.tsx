import { Palette, Sun, Moon, Monitor, CheckCircle2 } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

export default function AppearanceTab() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-[#121212] p-8 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm transition-colors">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 flex items-center">
          <Palette className="w-5 h-5 mr-2 text-neutral-500" /> Iluminación
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">Elige el ambiente de trabajo que prefieras.</p>
        
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: 'light', label: 'Modo Claro', desc: 'Fondo blanco y luminoso.', icon: Sun },
            { id: 'dark', label: 'Modo Oscuro', desc: 'Tonos grises para la noche.', icon: Moon },
            { id: 'system', label: 'Automático', desc: 'Sincroniza con tu PC.', icon: Monitor }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setTheme(mode.id as any)}
              className={`flex items-center p-4 rounded-2xl border-2 transition-all text-left ${
                theme === mode.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mr-4 ${theme === mode.id ? 'bg-white dark:bg-[#121212] shadow-sm' : 'bg-neutral-50 dark:bg-neutral-800/50'}`}>
                <mode.icon className={`w-6 h-6 ${theme === mode.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`} />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${theme === mode.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-neutral-600 dark:text-neutral-300'}`}>{mode.label}</h4>
                <p className="text-xs text-neutral-500 mt-0.5">{mode.desc}</p>
              </div>
              {theme === mode.id && <CheckCircle2 className="w-5 h-5 ml-auto text-emerald-600 dark:text-emerald-400" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}