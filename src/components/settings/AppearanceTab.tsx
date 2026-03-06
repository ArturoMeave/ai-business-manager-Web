import { Palette, Sun, Moon, Monitor} from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

export default function AppearanceTab(){
    const {theme, setTheme} = useThemeStore();

    return(
        <div className="bg-white dark:bg-[#121212] p-8 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm transition-colors">
      <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 flex items-center">
        <Palette className="w-5 h-5 mr-2 text-primary-600" /> Tema del Sistema
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { id: 'light', label: 'Modo Claro', icon: Sun },
          { id: 'dark', label: 'Modo Oscuro', icon: Moon },
          { id: 'system', label: 'Automático', icon: Monitor }
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setTheme(mode.id as any)}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
              theme === mode.id ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800' : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600'
            }`}
          >
            <mode.icon className={`w-8 h-8 mb-3 ${theme === mode.id ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`} />
            <span className={`text-sm font-bold ${theme === mode.id ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}