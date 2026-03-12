import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { forgotPassword, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      // El error ya lo maneja el store y se muestra en la variable 'error'
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 text-center border border-neutral-200 dark:border-neutral-800">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Revisa tu correo</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Hemos enviado las instrucciones a <span className="font-semibold">{email}</span>.
        </p>
        <Link to="/login" className="text-emerald-600 font-medium hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-800">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">¿Olvidaste tu contraseña?</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Introduce tu email y te enviaremos un enlace para restablecerla.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="ejemplo@correo.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</> : 'Enviar instrucciones'}
        </button>

        <Link to="/login" className="flex items-center justify-center gap-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al login
        </Link>
      </form>
    </div>
  );
}