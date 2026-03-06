import { useState } from "react";
import { Lock } from "lucide-react";
import { authService } from "../../services/auth.service";

export default function ScurityTab(){
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleChangePassword = async (e:React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setSuccessMsg('');

        if(newPassword !== confirmPassword){
            return setPasswordError('Las contraseñas nuevas no coinciden');
        }
        if(newPassword.length < 6){
            return setPasswordError('La contraseña nueva debe tener al menos 6 caracteres');
        }

        setIsChangingPassword(true);
        try{
            await authService.updatePassword({currentPassword, newPassword});
            setSuccessMsg('Contraseña actualizada correctamente');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(()=> setSuccessMsg(''), 4000);
        }catch(err: any){
            setPasswordError(err.response?.data?.message || 'Error al camnbiar la contraseña');
        }finally{
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        const isConfirmed = window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');
        if(isConfirmed){
            try{
                await authService.deleteAccount();
                authService.logout();
                window.location.href = '/login';
            }catch(err:any){
                alert(err.response?.data?.message || 'Error al eliminar la cuenta');
            }
        }
    };

    return (
    <div className="space-y-6">
      <form onSubmit={handleChangePassword} className="bg-white dark:bg-[#121212] p-8 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm transition-colors">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 flex items-center">
          <Lock className="w-5 h-5 mr-2 text-rose-500" /> Cambio de Contraseña
        </h3>
        <p className="text-sm text-neutral-500 mb-6 font-light">Protege tu cuenta utilizando una contraseña segura y única.</p>
        
        {/* Mensajes de error y éxito locales */}
        {passwordError && (
          <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 rounded-lg text-sm font-medium">
            {passwordError}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium">
            {successMsg}
          </div>
        )}

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Contraseña Actual</label>
            <input 
              type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm outline-none dark:text-white focus:border-neutral-900 dark:focus:border-white transition-all" 
            />
          </div>
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Nueva Contraseña</label>
            <input 
              type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm outline-none dark:text-white focus:border-neutral-900 dark:focus:border-white transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Confirmar Nueva Contraseña</label>
            <input 
              type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm outline-none dark:text-white focus:border-neutral-900 dark:focus:border-white transition-all" 
            />
          </div>
          
          <button 
            type="submit" disabled={isChangingPassword}
            className="mt-6 px-6 py-2.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-all shadow-sm disabled:opacity-50"
          >
            {isChangingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </div>
      </form>
      
      <div className="bg-rose-50/50 dark:bg-rose-900/10 p-8 rounded-2xl border border-rose-200/50 dark:border-rose-900/30 transition-colors">
        <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400 mb-2">Zona de Peligro</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 font-light">Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de estar seguro.</p>
        
        <button 
          onClick={handleDeleteAccount}
          type="button"
          className="px-4 py-2 bg-white dark:bg-[#121212] text-rose-600 dark:text-rose-500 border border-rose-200 dark:border-rose-800 rounded-lg text-sm font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
        >
          Solicitar Eliminación de Cuenta
        </button>
      </div>
    </div>
  );
}