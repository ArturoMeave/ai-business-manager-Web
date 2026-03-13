import { NavLink, useNavigate, Link } from "react-router-dom";
import { Users, CheckSquare, PieChart, Bot, LogOut, X, Settings as SettingsIcon, ChevronDown, Home, Moon, Sun } from 'lucide-react';
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore"; 

interface SidebarProps {
  onClose?: () => void; 
}

const navigation = [
  { name: 'Inicio', href: '/dashboard', icon: Home },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Tareas', href: '/tasks', icon: CheckSquare },
  { name: 'Finanzas', href: '/finance', icon: PieChart },
  { name: 'Socio IA', href: '/ai-chat', icon: Bot },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const { logout, user } = useAuthStore();
  const { theme, setTheme } = useThemeStore(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex flex-col w-64 h-full bg-[#F7F7F5] dark:bg-[#121212] border-r border-neutral-200/60 dark:border-neutral-800/60 z-20 relative font-sans transition-colors duration-300">
      
      <div className="flex items-center justify-between h-16 px-4 mt-2 mb-6 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 mx-2 rounded-xl cursor-pointer transition-colors group">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-neutral-900 dark:bg-white flex items-center justify-center flex-shrink-0 shadow-sm transition-colors">
            <span className="text-white dark:text-neutral-900 font-bold text-sm">AI</span>
          </div>
          <span className="text-base font-bold text-neutral-900 dark:text-white truncate transition-colors">
            {user?.name ? `Espacio de ${user.name.split(' ')[0]}` : 'Mi Espacio'}
          </span>
        </div>
        
        <button onClick={onClose} className="md:hidden p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-md">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-3 mt-2 text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider transition-colors">
          Privado
        </div>
        
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClose} 
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg transition-colors duration-150 group ${
                isActive
                  ? 'bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-900 dark:text-white font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-white font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`flex-shrink-0 w-5 h-5 mr-3 transition-colors ${
                    isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
                  }`}
                />
                <span className="text-base">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 mb-4 space-y-1">
        
        {/* botón de modo oscuro */}
        <button
          onClick={toggleTheme}
          className="flex items-center w-full px-3 py-2.5 text-base font-medium text-neutral-600 dark:text-neutral-400 rounded-lg hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-white transition-colors duration-150 group"
        >
          {theme === 'dark' ? (
            <><Sun className="w-5 h-5 mr-3 text-neutral-500 dark:text-neutral-400 group-hover:text-amber-500 transition-colors" /> Modo Claro</>
          ) : (
            <><Moon className="w-5 h-5 mr-3 text-neutral-500 group-hover:text-indigo-500 transition-colors" /> Modo Oscuro</>
          )}
        </button>

        <Link
          to="/settings"
          onClick={onClose}
          className="flex items-center w-full px-3 py-2.5 text-base font-medium text-neutral-600 dark:text-neutral-400 rounded-lg hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-white transition-colors duration-150 group"
        >
          <SettingsIcon strokeWidth={2} className="w-5 h-5 mr-3 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300" />
          Ajustes
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 text-base font-medium text-neutral-600 dark:text-neutral-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-150 group"
        >
          <LogOut strokeWidth={2} className="w-5 h-5 mr-3 text-neutral-500 dark:text-neutral-500 group-hover:text-rose-500 transition-colors" />
          Cerrar Sesión
        </button>
      </div>

    </div>
  );
}