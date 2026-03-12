import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Alert from '../common/Alert';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
  // Extraemos el token secreto de la URL (misitio.com/reset-password/TOKEN)
  const { resettoken } = useParams(); 
  const navigate = useNavigate();
  const { resetPassword, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      return setLocalError('Las contraseñas no coinciden');
    }
    if (password.length < 6) {
      return setLocalError('La contraseña debe tener al menos 6 caracteres');
    }

    try {
      await resetPassword(resettoken!, password);
      // Si funciona, le enviamos directamente a iniciar sesión
      navigate('/login', { replace: true });
    } catch (err) {
      // El error lo maneja Zustand
    }
  };

  return (
    <div className="bg-white dark:bg-[#121212] p-8 rounded-3xl shadow-xl border border-neutral-100 dark:border-neutral-800 w-full max-w-md">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Nueva contraseña</h2>
        <p className="text-neutral-500 dark:text-neutral-400">Escribe una contraseña segura y fácil de recordar.</p>
      </div>

      {(error || localError) && <Alert type="error" message={localError || error!} className="mb-6" />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="label">Nueva Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-10 bg-neutral-50 dark:bg-[#1a1a1a] dark:border-neutral-800 dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Confirmar Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field pl-10 bg-neutral-50 dark:bg-[#1a1a1a] dark:border-neutral-800 dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex justify-center items-center">
          {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Guardar y Entrar'}
        </button>
      </form>
    </div>
  );
}