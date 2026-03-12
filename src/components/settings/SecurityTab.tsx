import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, ShieldCheck, Laptop, Smartphone, AlertTriangle, Trash2, CheckCircle2, ShieldAlert, Monitor, LogOut } from 'lucide-react';
import { api } from '../../services/api'; 
import { useAuthStore } from '../../stores/authStore';

export default function SecurityTab() {
  const { user, loadUser, logout, logoutDevice } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretText, setSecretText] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrorMsg('Las contraseñas nuevas no coinciden.');
      return;
    }
    setIsLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await api.put('/auth/updatepassword', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setSuccessMsg('Contraseña actualizada correctamente.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Error al actualizar contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("¿Estás absolutamente seguro? Esta acción es irreversible.");
    if (confirm) {
        const doubleConfirm = window.prompt("Escribe 'ELIMINAR' para confirmar:");
        if (doubleConfirm === 'ELIMINAR') {
            try {
                await api.delete('/auth/delete-account'); 
                logout();
            } catch (error) {
                alert("Hubo un error al intentar eliminar la cuenta.");
            }
        }
    }
  };

  const start2FASetup = async () => {
    setErrorMsg('');
    try {
      const response = await api.post('/auth/2fa/generate');
      setQrCodeUrl(response.data.qrCodeUrl);
      setSecretText(response.data.secret);
      setIsSettingUp2FA(true);
    } catch (error: any) {
      setErrorMsg('Error al generar el código QR.');
    }
  };

  const verify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const response = await api.post('/auth/2fa/verify', { token: verificationCode });
      await loadUser(); 
      setIsSettingUp2FA(false);
      setSuccessMsg('¡Autenticación de dos pasos activada con éxito!');
      if (response.data.recoveryCodes) setRecoveryCodes(response.data.recoveryCodes);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'El código es incorrecto.');
    } finally {
      setIsLoading(false);
    }
  };

  // ⚡ FUNCIÓN PARA EXPULSAR DISPOSITIVOS
  // Cuando el usuario haga clic en el botón de salida, esta función pregunta por confirmación y luego usa la habilidad que creamos en el store
  const handleLogoutDevice = async (sessionId: string) => {
    if (window.confirm('¿Quieres cerrar sesión en este dispositivo? Aquella pantalla se desconectará al instante.')) {
      await logoutDevice(sessionId);
    }
  };

  // ⚡ FUNCIÓN PARA PONER LA FECHA BONITA
  // El servidor nos manda la fecha en un formato técnico ("2023-10-05T14:48:00.000Z"), esto lo convierte a texto normal que todos entendemos ("5 oct 2023, 16:48")
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Seguridad y Acceso</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Gestiona tus credenciales y dispositivos.</p>
      </div>

      <div className="bg-white dark:bg-[#121212] border border-neutral-200/60 dark:border-neutral-800/60 rounded-[2rem] shadow-sm overflow-hidden transition-colors">
        
        {/* 🔐 SECCIÓN CONTRASEÑA */}
        <div className="p-6 sm:p-8 border-b border-neutral-100 dark:border-neutral-800/60">
           <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center mr-4 shrink-0">
              <Key className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Contraseña de acceso</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Te recomendamos usar una contraseña fuerte.</p>
            </div>
          </div>
          <form onSubmit={handleUpdatePassword} className="max-w-xl space-y-5">
            {errorMsg && !isSettingUp2FA && <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-xl border border-rose-100 dark:border-rose-800/50">{errorMsg}</div>}
            {successMsg && <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded-xl border border-emerald-100 dark:border-emerald-800/50 flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> {successMsg}</div>}

            <div>
              <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block">Contraseña actual</label>
              <input type="password" name="currentPassword" required value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="••••••••" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block">Nueva contraseña</label>
                <input type="password" name="newPassword" required minLength={6} value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 block">Confirmar contraseña</label>
                <input type="password" name="confirmPassword" required minLength={6} value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50">
              Actualizar contraseña
            </button>
          </form>
        </div>

        {/* 🛡️ SECCIÓN 2FA */}
        <div className="p-6 sm:p-8 border-b border-neutral-100 dark:border-neutral-800/60 hover:bg-neutral-50/50 dark:hover:bg-[#1a1a1a]/50 transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 shrink-0 ${user?.isTwoFactorEnabled ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                {user?.isTwoFactorEnabled ? <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <ShieldAlert className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Autenticación de dos pasos (2FA)</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl">
                  {user?.isTwoFactorEnabled 
                    ? 'Tu cuenta está protegida. Necesitarás tu móvil para iniciar sesión en dispositivos nuevos.' 
                    : 'Añade una capa extra de seguridad solicitando un código de tu móvil al iniciar sesión.'}
                </p>
              </div>
            </div>
            
            {!user?.isTwoFactorEnabled && !isSettingUp2FA && (
              <button onClick={start2FASetup} className="shrink-0 px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm">
                Configurar 2FA
              </button>
            )}

            {user?.isTwoFactorEnabled && (
              <span className="shrink-0 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm rounded-lg flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Activado
              </span>
            )}
          </div>

          <AnimatePresence>
            {recoveryCodes.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden mt-6">
                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
                  <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-400 mb-2 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" /> ¡Importante! Guarda estos códigos de emergencia
                  </h4>
                  <p className="text-sm text-emerald-700 dark:text-emerald-500 mb-5">
                    Si pierdes tu móvil o no tienes acceso a tu aplicación de autenticación, podrás usar uno de estos códigos para iniciar sesión. Cada código <strong>solo se puede usar una vez</strong>. Guárdalos en un lugar seguro.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {recoveryCodes.map((code, index) => (
                      <div key={index} className="px-3 py-2.5 bg-white dark:bg-[#121212] border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-center font-mono text-sm font-bold text-emerald-800 dark:text-emerald-300 tracking-wider shadow-sm">
                        {code}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setRecoveryCodes([])} className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm">
                    Ya los he guardado
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isSettingUp2FA && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-800/60 flex flex-col lg:flex-row gap-10">
                  <div className="flex-1 min-w-0 space-y-4">
                    <h4 className="font-bold text-neutral-900 dark:text-white">Paso 1: Escanea el código</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Abre tu aplicación de autenticación y escanea este código QR.</p>
                    <div className="p-4 bg-white border border-neutral-200 rounded-2xl inline-block shadow-sm">
                      <img src={qrCodeUrl} alt="QR Code 2FA" className="w-40 h-40" />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">¿No puedes escanearlo? Introduce este código manualmente:</p>
                      <strong className="tracking-widest mt-1.5 block text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded-xl text-xs break-all border border-neutral-200 dark:border-neutral-700 font-mono">
                        {secretText}
                      </strong>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-4">
                    <h4 className="font-bold text-neutral-900 dark:text-white">Paso 2: Verifica el código</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Escribe el código de 6 dígitos que aparece en tu aplicación para confirmar que está bien configurado.</p>
                    <form onSubmit={verify2FA} className="space-y-4 w-full">
                      {errorMsg && <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-xl border border-rose-100 dark:border-rose-800/50">{errorMsg}</div>}
                      <input type="text" maxLength={6} required value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} className="w-full max-w-[200px] px-4 py-3 bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-xl text-2xl tracking-[0.5em] text-center font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="000000" />
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setIsSettingUp2FA(false)} className="px-5 py-2.5 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-sm rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">Cancelar</button>
                        <button type="submit" disabled={isLoading || verificationCode.length !== 6} className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 whitespace-nowrap">Activar 2FA</button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ⚡ NUEVA SECCIÓN: DISPOSITIVOS CONECTADOS DE VERDAD */}
        <div className="p-6 sm:p-8 hover:bg-neutral-50/50 dark:hover:bg-[#1a1a1a]/50 transition-colors">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center mr-4 shrink-0">
              <Monitor className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Dispositivos conectados</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Dispositivos en los que has iniciado sesión recientemente.</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Aquí empezamos a repasar la libreta real que nos manda el servidor. Por cada dispositivo, dibujamos una caja */}
            {(user?.sessions || []).map((device: any) => (
              <div key={device.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1A1A1A]">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white dark:bg-[#121212] rounded-lg flex items-center justify-center mr-4 shadow-sm border border-neutral-100 dark:border-neutral-800">
                    {/* Si es ordenador dibujamos un portátil, si no, dibujamos un móvil */}
                    {device.type === 'desktop' ? <Laptop className="w-5 h-5 text-neutral-500" /> : <Smartphone className="w-5 h-5 text-neutral-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white flex items-center">
                      {device.os} • {device.browser}
                      {/* Si el dispositivo de la lista es el mismo que estás usando ahora mismo, le ponemos un cartelito */}
                      {device.current && <span className="ml-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] uppercase tracking-wider font-bold rounded-md">Este dispositivo</span>}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{device.location} • {formatDate(device.time)}</p>
                  </div>
                </div>
                
                {/* Si NO es el dispositivo actual, dibujamos el botón para poder cerrarle la sesión a distancia */}
                {!device.current && (
                  <button onClick={() => handleLogoutDevice(device.id)} className="p-2 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Cerrar sesión en este dispositivo">
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-900/10 rounded-[2rem] p-6 sm:p-8 transition-colors mt-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400">Eliminar cuenta permanentemente</h3>
            <p className="text-sm text-rose-600/80 dark:text-rose-400/80 mt-1.5 max-w-2xl font-medium leading-relaxed">
              Una vez que elimines tu cuenta, no hay vuelta atrás. 
            </p>
            <button onClick={handleDeleteAccount} className="mt-6 flex items-center px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors shadow-sm">
              <Trash2 className="w-4 h-4 mr-2" /> Eliminar mi cuenta
            </button>
          </div>
        </div>
      </div>

    </motion.div>
  );
}