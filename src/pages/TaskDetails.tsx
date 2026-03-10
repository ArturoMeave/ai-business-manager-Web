import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, AlertCircle, DollarSign, AlignLeft, CheckCircle2, Edit2, Trash2, User, FileText, Download, ArrowDownRight, Target } from 'lucide-react';
import { useTaskStore } from '../stores/taskStores';
import { useClientStore } from '../stores/clientStore';
import { useAuthStore } from '../stores/authStore';
import TaskModal from '../components/crm/TaskModal';
import type { Task } from '../types';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { tasks, fetchTasks, updateTask, deleteTask } = useTaskStore();
  const { clients, fetchClients } = useClientStore();
  const { user } = useAuthStore(); 
  
  const [task, setTask] = useState<Task | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [taxRate, setTaxRate] = useState(21);

  const currencySymbol = user?.preferences?.currency || '€';

  useEffect(() => {
    const loadData = async () => {
      setIsInitializing(true);
      if (tasks.length === 0) await fetchTasks();
      if (clients.length === 0) await fetchClients();
      setIsInitializing(false);
    };
    loadData();
  }, [tasks.length, clients.length, fetchTasks, fetchClients]);

  useEffect(() => {
    if (tasks.length > 0 && id) {
      const found = tasks.find(t => t._id === id);
      setTask(found || null);
    }
  }, [tasks, id]);

  const handleDelete = async () => {
    if (window.confirm('¿Eliminar esta tarea definitivamente?')) {
      if (task) {
        await deleteTask(task._id);
        navigate('/tasks'); 
      }
    }
  };

  const handleToggleComplete = async () => {
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await updateTask(task._id, { status: newStatus });
    }
  };

  if (isInitializing) {
    return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white"></div></div>;
  }

  if (!task) {
    return (
      <div className="text-center py-32 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Documento no encontrado</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 font-light">La tarea que buscas no existe o ha sido eliminada.</p>
        <button onClick={() => navigate('/tasks')} className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-medium">Volver a Proyectos</button>
      </div>
    );
  }

  // ⚡ BUG ARREGLADO: Doble validación para evitar el error "null"
  const taskClientId = task?.client && typeof task.client === 'object' ? (task.client as any)._id : task?.client;
  const associatedClient = clients.find(c => c._id === taskClientId);

  const handleDownloadInvoice = async () => {
    if (!task || !associatedClient) {
      alert("Para generar una factura, primero debes asignarle un Cliente a esta tarea (Haz clic en Editar).");
      return;
    }
    if (task.budget <= 0) {
      alert("El cobro de esta tarea es 0. Edita la tarea para añadir un presupuesto válido antes de facturar.");
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const invoiceElement = document.getElementById('invoice-template');
      if (!invoiceElement) return;

      const canvas = await html2canvas(invoiceElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Factura_${associatedClient.companyName || associatedClient.name}_${task.title.substring(0,10)}.pdf`);
    } catch (error) {
      console.error("Error generando PDF", error);
      alert("Hubo un error al generar el PDF.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const subtotal = task.budget;
  const iva = subtotal * (taxRate / 100);
  const total = subtotal + iva;
  const invoiceNumber = `FAC-${new Date().getFullYear()}-${task._id.substring(task._id.length - 4).toUpperCase()}`;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 pb-12 max-w-4xl mx-auto transition-colors duration-300 relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <button onClick={() => navigate('/tasks')} className="group flex items-center text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
          <div className="p-1 rounded-md group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800 transition-colors mr-1"><ArrowLeft className="w-4 h-4" /></div>
          Volver a Proyectos
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-700 rounded-lg p-1 shadow-sm transition-colors">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 pl-2">IVA:</span>
            <select value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="bg-transparent text-sm font-bold text-neutral-900 dark:text-white pl-2 pr-6 py-1.5 outline-none cursor-pointer">
              <option value={0}>0%</option>
              <option value={4}>4%</option>
              <option value={10}>10%</option>
              <option value={16}>16%</option>
              <option value={21}>21%</option>
            </select>
          </div>

          <button onClick={handleDownloadInvoice} disabled={isGeneratingPDF} className="flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-colors border bg-primary-900 dark:bg-white text-white dark:text-neutral-900 border-primary-900 hover:bg-primary-800 shadow-md disabled:opacity-50">
            {isGeneratingPDF ? <div className="w-4 h-4 mr-2 border-2 border-white/30 dark:border-neutral-900/30 border-t-white dark:border-t-neutral-900 rounded-full animate-spin"></div> : <FileText className="w-4 h-4 mr-2" />}
            Generar Factura
          </button>

          <button onClick={handleToggleComplete} className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${task.status === 'completed' ? 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800' : 'bg-white dark:bg-[#121212] text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50 hover:bg-green-50 dark:hover:bg-green-900/20 shadow-sm'}`}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {task.status === 'completed' ? 'Reabrir Tarea' : 'Completar'}
          </button>
          
          <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-sm transition-colors"><Edit2 className="w-4 h-4 mr-2 opacity-70" /> Editar</button>
          <button onClick={handleDelete} className="p-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#121212] px-8 py-10 rounded-[2rem] shadow-sm border border-neutral-200/60 dark:border-neutral-800/60 transition-colors">
        <h1 className={`text-4xl font-bold tracking-tight mb-8 ${task.status === 'completed' ? 'text-neutral-400 dark:text-neutral-600 line-through decoration-neutral-300 dark:decoration-neutral-700' : 'text-neutral-900 dark:text-white'}`}>
          {task.title}
        </h1>

        <div className="space-y-4 max-w-2xl mb-12">
          
          <div className="flex items-center group">
            <div className="w-40 flex items-center text-neutral-500 dark:text-neutral-400 text-sm font-medium"><CheckCircle2 className="w-4 h-4 mr-2 opacity-60" /> Estado</div>
            <div className={`px-2.5 py-1 text-sm font-medium rounded-md border ${
              task.status === 'completed' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700' :
              task.status === 'in progress' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800/50' : 
              'bg-white dark:bg-[#1a1a1a] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 shadow-sm'
            }`}>
              {task.status === 'in progress' ? 'En proceso' : task.status === 'pending' ? 'Pendiente' : 'Completada'}
            </div>
          </div>

          <div className="flex items-center group">
            <div className="w-40 flex items-center text-neutral-500 dark:text-neutral-400 text-sm font-medium"><Calendar className="w-4 h-4 mr-2 opacity-60" /> Fecha</div>
            <div className="text-sm text-neutral-900 dark:text-white font-medium">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : <span className="text-neutral-400 dark:text-neutral-500 italic">Sin fecha asignada</span>}
              {task.dueTime && <span className="ml-2 text-neutral-500 dark:text-neutral-400 border-l border-neutral-200 dark:border-neutral-700 pl-2">{task.dueTime}</span>}
            </div>
          </div>

          <div className="flex items-center group">
            <div className="w-40 flex items-center text-neutral-500 dark:text-neutral-400 text-sm font-medium"><User className="w-4 h-4 mr-2 opacity-60" /> Cliente</div>
            <div>
              {associatedClient ? (
                <Link to={`/clients/${associatedClient._id}`} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline flex items-center">
                  {associatedClient.name} <ArrowLeft className="w-3 h-3 ml-1 rotate-135" style={{ transform: 'rotate(135deg)' }} />
                </Link>
              ) : (
                <span className="text-sm text-neutral-400 dark:text-neutral-500">Cliente no asignado</span>
              )}
            </div>
          </div>

          <div className="flex items-center group">
            <div className="w-40 flex items-center text-neutral-500 dark:text-neutral-400 text-sm font-medium"><DollarSign className="w-4 h-4 mr-2 opacity-60" /> Cobro</div>
            <div className="text-sm font-bold text-neutral-900 dark:text-white">
              {task.budget > 0 ? `${task.budget} ${currencySymbol}` : <span className="text-neutral-400 font-normal">0 {currencySymbol}</span>}
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800 my-8"></div>

        <div>
          <h3 className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center mb-4"><AlignLeft className="w-4 h-4 mr-2" /> Notas y Detalles</h3>
          {task.description ? (
            <div className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-light whitespace-pre-wrap bg-neutral-50/50 dark:bg-[#1a1a1a] p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800/60">{task.description}</div>
          ) : (
            <p className="text-neutral-400 dark:text-neutral-500 italic font-light p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700">Esta tarea no tiene notas adicionales.</p>
          )}
        </div>
      </div>

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} taskToEdit={task} />

      <div className="overflow-hidden h-0 w-0 absolute pointer-events-none">
        <div id="invoice-template" className="w-[800px] min-h-[1131px] bg-white text-black p-16 font-sans border-0 shadow-none">
          {/* Factura en PDF sin modificar */}
          <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">FACTURA</h1>
              <p className="text-gray-500 font-medium">Nº: {invoiceNumber}</p>
              <p className="text-gray-500 font-medium">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-3xl font-bold ml-auto mb-3">{(user?.preferences?.companyName || user?.name)?.charAt(0).toUpperCase() || 'U'}</div>
              <h3 className="font-bold text-lg text-gray-900 uppercase">{user?.preferences?.companyName || user?.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="mb-12">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Facturado a:</p>
            <h3 className="text-xl font-bold text-gray-900">{associatedClient?.companyName || associatedClient?.name}</h3>
            <p className="text-gray-600 mt-1">{associatedClient?.email}</p>
          </div>
          
          <table className="w-full mb-12">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-600 uppercase tracking-wider rounded-l-lg">Concepto / Servicio</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-600 uppercase tracking-wider rounded-r-lg">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-6"><p className="font-bold text-gray-900 text-lg">{task.title}</p></td>
                <td className="px-4 py-6 text-right font-bold text-gray-900 text-lg">{subtotal.toFixed(2)} {currencySymbol}</td>
              </tr>
            </tbody>
          </table>
          
          <div className="flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex justify-between items-center text-gray-600"><span>Subtotal</span><span className="font-medium">{subtotal.toFixed(2)} {currencySymbol}</span></div>
              <div className="flex justify-between items-center text-gray-600 pb-3 border-b border-gray-200"><span>IVA ({taxRate}%)</span><span className="font-medium">{iva.toFixed(2)} {currencySymbol}</span></div>
              <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-1"><span>Total a pagar</span><span>{total.toFixed(2)} {currencySymbol}</span></div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}