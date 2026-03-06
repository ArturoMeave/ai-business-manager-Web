import {Blocks} from 'lucide-react';

export default function AppearanceTab(){
    return (
    <div className="bg-white dark:bg-[#121212] p-8 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm transition-colors flex flex-col items-center justify-center text-center py-20">
      <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
        <Blocks className="w-8 h-8 text-purple-500" />
      </div>
      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">API e Integraciones</h3>
      <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-6 font-light">
        Conecta AI Manager con Google Calendar, Zapier, Stripe y otras herramientas que ya usas cada día.
      </p>
      <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-bold uppercase tracking-wider rounded-lg">
        Próximamente en V2.0
      </span>
    </div>
  );
}