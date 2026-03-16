import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useClientStore } from '../stores/clientStore';
import { Plus, Search, Building2, Mail, Phone, Edit2, Trash2, ArrowRight, Filter } from 'lucide-react';
import Alert from '../components/common/Alert';
import ClientModal from '../components/crm/ClientModal';
import type { Client } from '../types';


const getCategoryColor = (category: string) => {
  switch (category) {
    case 'VIP': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50';
    case 'Active': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
    case 'Prospect': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
    case 'Potencial': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'; 
    case 'General': return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50'; 
    case 'Inactive': return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700';
    default: return 'bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700/50';
  }
};

export default function Clients() {
  const navigate = useNavigate();
  const { clients, isLoading, error, fetchClients, deleteClient } = useClientStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleEdit = (client: Client) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) await deleteClient(id);
  };

  const filteredClients = clients.filter(c => {
    // 1. Filtro de Búsqueda (Texto)
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Filtro de Categoría
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;

    // 3. Filtro de Tipo (Empresa o Particular)
    const matchesType = 
      selectedType === 'All' || 
      (selectedType === 'Company' && c.companyName && c.companyName.trim() !== '') ||
      (selectedType === 'Individual' && (!c.companyName || c.companyName.trim() === ''));

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto transition-colors duration-300">
      
      {/* cabecera y filtros */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Directorio de Clientes</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-light">Gestiona tu cartera y su valor financiero.</p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center gap-3 w-full xl:w-auto">
          
          {/* 🔍 Buscador */}
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" placeholder="Buscar cliente..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white outline-none transition-all shadow-sm"
            />
          </div>

          {/* 🗂️ Filtros Desplegables */}
          <div className="flex w-full lg:w-auto gap-3">
            <div className="relative w-1/2 lg:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white outline-none transition-all shadow-sm appearance-none cursor-pointer"
              >
                <option value="All">Todas las categorías</option>
                <option value="VIP"> VIP</option>
                <option value="Active"> Activo</option>
                <option value="Potencial"> Potencial</option>
                <option value="Prospect"> Prospecto</option>
                <option value="General"> General</option>
                <option value="Inactive"> Inactivo</option>
              </select>
            </div>

            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-1/2 lg:w-auto px-4 py-2.5 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white outline-none transition-all shadow-sm cursor-pointer"
            >
              <option value="All">Todos los tipos</option>
              <option value="Company"> Empresas</option>
              <option value="Individual"> Particulares</option>
            </select>
          </div>

          {/* ➕ Botón Añadir */}
          <button onClick={() => { setClientToEdit(null); setIsModalOpen(true); }} className="w-full lg:w-auto px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-sm flex items-center justify-center whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" /> Añadir
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {/* 💻 VISTA DE TABLA (ESCRITORIO) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50/50 dark:bg-[#1a1a1a] text-neutral-500 dark:text-neutral-400 font-semibold text-xs uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800/60">
              <tr>
                <th className="px-6 py-4">Cliente / Empresa</th>
                <th className="px-6 py-4">Información de Contacto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {isLoading && clients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col justify-center items-center space-y-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-900 dark:border-white"></div>
                      <span className="text-neutral-500 dark:text-neutral-400 font-medium text-sm">Cargando directorio...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && filteredClients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700 mb-4">
                      <Filter className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">Sin resultados</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 font-light">No hemos encontrado clientes con estos filtros.</p>
                  </td>
                </tr>
              )}

              <AnimatePresence>
                {filteredClients.map((client) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    key={client._id} onClick={() => navigate(`/clients/${client._id}`)} 
                    className="hover:bg-neutral-50/80 dark:hover:bg-[#1a1a1a] transition-all duration-200 group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-sm border border-neutral-200 dark:border-neutral-700 shadow-sm group-hover:bg-white dark:group-hover:bg-[#222] transition-colors">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">{client.name}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center mt-0.5 font-medium">
                            <Building2 className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                            {client.companyName || 'Independiente'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1.5">
                        <span className="text-neutral-600 dark:text-neutral-300 font-medium flex items-center text-sm">
                          <Mail className="w-3.5 h-3.5 mr-2 text-neutral-400 dark:text-neutral-500" />
                          {client.email || '—'}
                        </span>
                        <span className="text-neutral-500 dark:text-neutral-400 font-medium flex items-center text-xs">
                          <Phone className="w-3.5 h-3.5 mr-2 text-neutral-400 dark:text-neutral-500" />
                          {client.phone || '—'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded border ${getCategoryColor(client.category)}`}>
                        {client.category}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 mr-4">
                            <button onClick={(e) => { e.stopPropagation(); handleEdit(client); }} className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-700 rounded-lg transition-colors" title="Editar">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(client._id); }} className="p-2 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Eliminar">
                              <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* 📱 VISTA DE TARJETAS (MÓVIL) */}
        <div className="sm:hidden grid grid-cols-1 divide-y divide-neutral-100 dark:divide-neutral-800/60 p-2">
          {isLoading && clients.length === 0 && (
            <div className="py-20 text-center text-neutral-500 dark:text-neutral-400">Cargando...</div>
          )}
          
          {!isLoading && filteredClients.length === 0 && (
            <div className="py-20 text-center text-neutral-500 dark:text-neutral-400 text-sm">Sin resultados</div>
          )}

          {filteredClients.map((client) => (
            <motion.div 
              key={client._id} 
              onClick={() => navigate(`/clients/${client._id}`)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-5 active:bg-neutral-50 dark:active:bg-[#1a1a1a] transition-colors flex flex-col space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold border border-neutral-200">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white text-base leading-tight">{client.name}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium flex items-center mt-0.5">
                      <Building2 className="w-3 h-3 mr-1" /> {client.companyName || 'Particular'}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded border ${getCategoryColor(client.category)}`}>
                  {client.category}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 bg-neutral-50/50 dark:bg-[#1a1a1a]/50 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  <Mail className="w-3.5 h-3.5 mr-2 text-neutral-400" /> {client.email || '—'}
                </div>
                <div className="flex items-center text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  <Phone className="w-3.5 h-3.5 mr-2 text-neutral-400" /> {client.phone || '—'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex space-x-4">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(client); }} className="text-xs font-bold text-neutral-500 flex items-center gap-1.5"><Edit2 className="w-3.5 h-3.5" /> Editar</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(client._id); }} className="text-xs font-bold text-rose-500 flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Borrar</button>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} clientToEdit={clientToEdit} />
    </div>
  );
}