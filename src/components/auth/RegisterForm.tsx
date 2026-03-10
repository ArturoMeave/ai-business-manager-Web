import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useGoogleLogin } from '@react-oauth/google'; // ⚡ USAMOS EL HOOK PARA EL BOTÓN PERSONALIZADO

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register, googleLogin, isLoading, error } = useAuthStore();
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  // ⚡ LA FUNCIÓN MÁGICA QUE ABRE EL POPUP DE GOOGLE
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await googleLogin(tokenResponse.access_token);
        navigate('/dashboard');
      } catch (err) {
        console.error("Error al registrar con Google", err);
      }
    },
    onError: () => {
      console.log('Registro de Google falló en la ventana');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData.email, formData.password, formData.name);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-xl relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"></div>
      
      <AnimatePresence mode="wait">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-neutral-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <Sparkles className="w-6 h-6 text-white dark:text-neutral-900" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Comienza gratis</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2 font-medium">Crea tu cuenta en 30 segundos</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-600 dark:text-rose-400 font-medium text-center">
              {error}
            </motion.div>
          )}

          {/* ⚡ TU BOTÓN PERSONALIZADO (Idéntico al del Login) ⚡ */}
          <button 
            type="button" 
            onClick={() => handleGoogleLogin()} 
            disabled={isLoading}
            className="w-full mb-6 flex items-center justify-center px-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#1A1A1A] text-neutral-700 dark:text-neutral-200 font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Registrarse con Google
          </button>

          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800"></div>
            <span className="flex-shrink-0 mx-4 text-neutral-400 text-xs font-semibold uppercase tracking-wider">O regístrate con email</span>
            <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" placeholder="Juan Pérez" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" placeholder="juan@ejemplo.com" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} minLength={6} className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" placeholder="Mínimo 6 caracteres" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center px-4 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold text-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-md mt-6 disabled:opacity-50">
              {isLoading ? 'Creando cuenta...' : <><span className="mr-2">Crear mi cuenta</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Inicia sesión</Link>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}