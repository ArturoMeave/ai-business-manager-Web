import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useFinanceStore } from '../stores/financeStore';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Trash2, Calendar, FileText, X, Briefcase, Building, UserCircle, Crown, Calculator, Download, Upload, UploadCloud, Repeat, Archive, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import FinanceModal from '../components/crm/FinanceModal';
import type { Finance, FinanceType } from '../types';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const formatMoney = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount || 0);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

const SummaryCard = ({ title, value, type }: { title: string, value: number, type: 'net' | 'income' | 'expense' }) => (
  <motion.div variants={fadeUp} className="bg-white dark:bg-[#121212] p-6 rounded-[2rem] shadow-sm border border-neutral-200/60 dark:border-neutral-800/60 relative overflow-hidden group transition-colors duration-300">
    <div className="relative z-10">
      <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">{title}</p>
      <h3 className={`text-4xl font-bold tracking-tight ${type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : type === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-white'}`}>
        {type === 'expense' && value > 0 ? '-' : ''}{formatMoney(value)}
      </h3>
    </div>
    <div className="absolute right-0 bottom-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
      {type === 'income' ? <TrendingUp className="w-24 h-24 text-emerald-900 dark:text-emerald-100" /> : type === 'expense' ? <TrendingDown className="w-24 h-24 text-rose-900 dark:text-rose-100" /> : <FileText className="w-24 h-24 text-neutral-900 dark:text-white" />}
    </div>
  </motion.div>
);

const ROLE_CONTENT = {
  worker: { title: "Mis Finanzas", subtitle: "Controla tu nómina, ahorros, recibos y gastos del día a día.", net: "Ahorro Mensual", income: "Ingresos Netos", expense: "Gastos Personales", empty: "Registra tu primera nómina o compras del súper." },
  freelancer: { title: "Finanzas Freelance", subtitle: "Gestiona tu facturación, cuotas de autónomo e impuestos.", net: "Beneficio Neto", income: "Facturación Bruta", expense: "Gastos Profesionales", empty: "Registra tu primera factura o cuota de autónomos." },
  company: { title: "Tesorería y Finanzas", subtitle: "Control total de liquidez, pago a proveedores y nóminas.", net: "Beneficio Operativo", income: "Facturación Total", expense: "Costes Fijos / Variables", empty: "Registra ventas B2B o el pago de proveedores." },
  god_mode: { title: "Panel Financiero", subtitle: "Visión absoluta de todos los movimientos y categorías.", net: "Balance Total", income: "Ingresos Globales", expense: "Gastos Globales", empty: "Libro mayor vacío. Registra tu primer movimiento." }
};

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export default function Finance() {
  const { finances, summary, isLoading, fetchFinances, fetchSummary, deleteFinance, addFinance, updateFinance } = useFinanceStore();
  const { user, loadUser } = useAuthStore(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Finance | null>(null);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false); 
  const [reportTimeframe, setReportTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'all'>('monthly');

  const [visibleCount, setVisibleCount] = useState(6);
  const [visibleSimulatorCount, setVisibleSimulatorCount] = useState(6);
  const [showArchived, setShowArchived] = useState(false);

  const currentUserRole = user?.preferences?.role || 'god_mode';
  
  const [simulatorRows, setSimulatorRows] = useState<{id: string, type: FinanceType, name: string, amount: number, isFixed?: boolean}[]>(() => {
    const saved = localStorage.getItem('ai_manager_simulator');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      } catch (error) {
        console.error("Error parsing simulator data from localStorage:", error);
        localStorage.removeItem('ai_manager_simulator');
      }
    }
    return [
      { id: generateId(), type: 'ingreso', name: 'Ej. Factura Cliente', amount: 1200, isFixed: false },
      { id: generateId(), type: 'gasto', name: 'Ej. Cuota Autónomo', amount: 294, isFixed: true }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ai_manager_simulator', JSON.stringify(simulatorRows));
  }, [simulatorRows]);

  useEffect(() => { fetchSummary(); fetchFinances(); }, [fetchSummary, fetchFinances]);
  useEffect(() => { if(!user) loadUser(); }, [user, loadUser]);

  useEffect(() => {
    setVisibleCount(6);
    setSelectedTransaction(null);
  }, [showArchived]);

  const updateSimulatorRow = (id: string, field: string, value: any) => {
    setSimulatorRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const displayedFinances = finances.filter(f => showArchived ? (f as any).isArchived : !(f as any).isArchived);
  const visibleFinances = displayedFinances.slice(0, visibleCount);
  
  const visibleSimulatorRows = simulatorRows.slice(0, visibleSimulatorCount);

  const handleToggleArchive = async (finance: Finance) => {
    const isCurrentlyArchived = (finance as any).isArchived;
    await updateFinance(finance._id, { isArchived: !isCurrentlyArchived } as any);
    setSelectedTransaction(null); 
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este movimiento? Afectará a los cálculos totales.')) {
      await deleteFinance(id);
      setSelectedTransaction(null);
    }
  };

  const handleUploadRow = async (row: {id: string, type: FinanceType, name: string, amount: number, isFixed?: boolean}) => {
    if (!row.name || row.amount <= 0) { alert("Añade un nombre y una cantidad mayor a 0 antes de subirlo."); return; }
    try {
      await addFinance({ type: row.type, amount: row.amount, description: row.name, category: row.isFixed ? 'Gastos Fijos' : 'Otros', status: 'completado', date: new Date().toISOString().split('T')[0] });
      if (!row.isFixed) setSimulatorRows(prev => prev.filter(r => r.id !== row.id));
      else alert(`"${row.name}" registrado en tu cuenta con éxito. Al ser un concepto FIJO, se mantendrá aquí para el mes que viene.`);
    } catch (error) { console.error(error); alert('Error al subir el movimiento.'); }
  };

  const handleUploadAll = async () => {
    const validRows = simulatorRows.filter(r => r.name && r.amount > 0);
    if (validRows.length === 0) return;
    if (!window.confirm(`¿Subir estos ${validRows.length} conceptos a tu balance real?`)) return;
    try {
      for (const row of validRows) {
        await addFinance({ type: row.type, amount: row.amount, description: row.name, category: row.isFixed ? 'Gastos Fijos' : 'Otros', status: 'completado', date: new Date().toISOString().split('T')[0] });
      }
      setSimulatorRows(prev => prev.filter(r => r.isFixed)); 
    } catch (error) { console.error(error); }
  };

  const handleDownloadInvoice = async (financeId: string) => {
    try {
      setIsDownloadingInvoice(true);
      const response = await api.get(`/finance/${financeId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', `Factura_${financeId}.pdf`);
      document.body.appendChild(link); link.click();
      if (link.parentNode) link.parentNode.removeChild(link);
    } catch (error) { console.error(error); alert("Hubo un error al generar la factura."); } 
    finally { setIsDownloadingInvoice(false); }
  };

  const filteredFinancesForReport = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7);
    const currentYearStr = todayStr.substring(0, 4);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    return finances.filter(f => {
      if (reportTimeframe === 'daily') return f.date.startsWith(todayStr);
      if (reportTimeframe === 'weekly') return new Date(f.date) >= lastWeek;
      if (reportTimeframe === 'monthly') return f.date.startsWith(currentMonthStr);
      if (reportTimeframe === 'yearly') return f.date.startsWith(currentYearStr);
      return true; 
    });
  }, [finances, reportTimeframe]);

  // No se usan estas variables para el renderizado directo, se calculan si se necesitan
  // o se pueden eliminar si solo se usaban para el reporte de forma interna.

  const timeframeLabels = { daily: 'Hoy', weekly: 'Última Semana', monthly: 'Este Mes', yearly: 'Este Año', all: 'Histórico' };

  const handleDownloadReport = async () => {
    if (filteredFinancesForReport.length === 0) { alert(`No hay movimientos en: ${timeframeLabels[reportTimeframe]}`); return; }
    setIsGeneratingPDF(true);
    try {
      const reportElement = document.getElementById('financial-report-template');
      if (!reportElement) return;
      const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight(); 
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight; let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) { position = heightLeft - imgHeight; pdf.addPage(); pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight); heightLeft -= pageHeight; }
      pdf.save(`Reporte_Financiero_${reportTimeframe}.pdf`);
    } catch (error) { console.error(error); alert("Error al generar PDF."); } 
    finally { setIsGeneratingPDF(false); }
  };

  const donutData = [{ name: 'Ingresos', value: summary?.totalIncome || 0, color: '#10b981' }, { name: 'Gastos', value: summary?.totalExpenses || 0, color: '#f43f5e' }];
  const chartData = useMemo(() => {
    const groupedData: Record<string, { date: string, income: number, expense: number }> = {};
    [...finances].reverse().forEach(item => {
      const dateKey = new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      if (!groupedData[dateKey]) groupedData[dateKey] = { date: dateKey, income: 0, expense: 0 };
      if (item.type === 'ingreso') groupedData[dateKey].income += item.amount;
      else groupedData[dateKey].expense += item.amount;
    });
    return Object.values(groupedData).slice(-10);
  }, [finances]);

  const content = ROLE_CONTENT[currentUserRole as keyof typeof ROLE_CONTENT] || ROLE_CONTENT['god_mode'];
  const getRoleBadge = (role: string) => {
      switch(role) {
          case 'freelancer': return <><Briefcase className="w-3.5 h-3.5 mr-1.5" /> Autónomo</>;
          case 'company': return <><Building className="w-3.5 h-3.5 mr-1.5" /> Empresa</>;
          case 'worker': return <><UserCircle className="w-3.5 h-3.5 mr-1.5" /> Trabajador</>;
          default: return <><Crown className="w-3.5 h-3.5 mr-1.5 text-yellow-600" /> Panel Financiero</>;
      }
  };

  const simulatorTotal = simulatorRows.reduce((acc, row) => row.type === 'ingreso' ? acc + (row.amount || 0) : acc - (row.amount || 0), 0);

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto transition-colors duration-300 relative">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">{content.title}</h1>
            <div className="flex items-center px-2.5 py-1 bg-neutral-100/80 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider shadow-sm transition-colors">
              {getRoleBadge(currentUserRole)}
            </div>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light">{content.subtitle}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-700 rounded-xl p-1 shadow-sm transition-colors">
            <select value={reportTimeframe} onChange={(e) => setReportTimeframe(e.target.value as any)} className="bg-transparent text-sm font-semibold text-neutral-700 dark:text-neutral-300 pl-3 pr-8 py-2 outline-none cursor-pointer">
              <option value="daily" className="bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white">Hoy</option>
              <option value="weekly" className="bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white">Última Semana</option>
              <option value="monthly" className="bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white">Este Mes</option>
              <option value="yearly" className="bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white">Este Año</option>
              <option value="all" className="bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white">Todo (Histórico)</option>
            </select>
            <button onClick={handleDownloadReport} disabled={isGeneratingPDF} className="flex items-center px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50">
              {isGeneratingPDF ? <div className="w-4 h-4 mr-1.5 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin"></div> : <Download className="w-4 h-4 mr-1.5" />} PDF
            </button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 lg:flex-none px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-md flex items-center justify-center">
            <Plus className="w-4 h-4 mr-2" /> Movimiento
          </button>
        </div>
      </div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title={content.net} value={summary?.netProfit || 0} type="net" />
        <SummaryCard title={content.income} value={summary?.totalIncome || 0} type="income" />
        <SummaryCard title={content.expense} value={summary?.totalExpenses || 0} type="expense" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-white dark:bg-[#121212] p-8 rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm flex flex-col items-center justify-center min-h-[320px] transition-colors duration-300">
          <h3 className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider w-full text-left mb-6">Proporción</h3>
          {(summary?.totalIncome === 0 && summary?.totalExpenses === 0) ? (
            <div className="text-neutral-400 dark:text-neutral-500 text-sm flex items-center justify-center h-full">Sin datos para mostrar</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={donutData} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none" cornerRadius={4}>
                  {donutData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value: any) => formatMoney(Number(value))} cursor={false} contentStyle={{ borderRadius: '12px', border: 'none', background: '#1A1A1A', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex space-x-6 mt-4 text-sm font-medium text-neutral-600 dark:text-neutral-300">
            <span className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></div> {content.income}</span>
            <span className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2"></div> {content.expense}</span>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-2 bg-white dark:bg-[#121212] p-8 rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm min-h-[320px] flex flex-col transition-colors duration-300">
          <h3 className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-8">Evolución de Cuentas</h3>
          {chartData.length === 0 ? (
            <div className="text-neutral-400 dark:text-neutral-500 text-sm flex items-center justify-center h-full flex-1">Faltan datos para mostrar la gráfica</div>
          ) : (
            <div className="flex-1 w-full h-full min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={32}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888', fontWeight: 500 }} tickFormatter={(value) => `${value}€`} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }} formatter={(value: any) => formatMoney(Number(value))} contentStyle={{ borderRadius: '12px', border: 'none', background: '#1A1A1A', color: '#fff' }} />
                  <Bar dataKey="income" name="Ingresos" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Gastos" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* CONTENEDOR DE COLUMNAS (Mantiene su forma natural sin pegarse) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LISTA IZQUIERDA (Libro de Registros) */}
        <div className={`bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm overflow-hidden flex-1 transition-all duration-300 ${selectedTransaction ? 'lg:w-2/3' : 'w-full lg:w-1/2'} flex flex-col`}>
          
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/30 dark:bg-[#1a1a1a] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">Libro de Registros</h2>
            <div className="flex bg-neutral-200/50 dark:bg-neutral-800 p-1 rounded-xl">
               <button onClick={() => setShowArchived(false)} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${!showArchived ? 'bg-white dark:bg-[#121212] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>Activos</button>
               <button onClick={() => setShowArchived(true)} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${showArchived ? 'bg-white dark:bg-[#121212] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>Archivados</button>
            </div>
          </div>

          <div className="flex-1">
            {isLoading && finances.length === 0 ? (
               <div className="p-12 text-center text-neutral-400 dark:text-neutral-500">Sincronizando caja...</div>
            ) : displayedFinances.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-200 dark:border-neutral-700/50"><FileText className="w-6 h-6 text-neutral-400 dark:text-neutral-500" /></div>
                <p className="text-neutral-900 dark:text-white font-bold text-lg">{showArchived ? 'Archivo vacío' : 'Caja vacía'}</p>
                <p className="text-neutral-500 dark:text-neutral-400 font-light mt-1">{showArchived ? 'No hay registros archivados.' : content.empty}</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {visibleFinances.map((finance) => (
                  <div key={finance._id} onClick={() => setSelectedTransaction(finance)} className={`p-5 transition-colors flex items-center justify-between group cursor-pointer ${selectedTransaction?._id === finance._id ? 'bg-neutral-50/80 dark:bg-[#1a1a1a] border-l-4 border-neutral-900 dark:border-white' : 'hover:bg-neutral-50/50 dark:hover:bg-[#1a1a1a]/50 border-l-4 border-transparent'}`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${finance.type === 'ingreso' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/50'}`}>
                        {finance.type === 'ingreso' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                          {finance.title || finance.description}
                          {(finance as any).isArchived && <span className="px-2 py-0.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-[10px] rounded uppercase tracking-wider">Archivado</span>}
                        </h4>
                        <div className="flex flex-col mt-0.5">
                          {finance.title && <p className="text-xs text-neutral-400 dark:text-neutral-500 line-clamp-1 mb-1">{finance.description}</p>}
                          <div className="flex items-center text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                            <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" /> {formatDate(finance.date)}</span>
                            <span className="mx-2 opacity-50">•</span>
                            <span className="px-2 py-0.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm">{finance.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold text-lg block ${finance.type === 'ingreso' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{finance.type === 'ingreso' ? '+' : '-'}{formatMoney(finance.amount)}</span>
                      <span className="text-xs text-neutral-400 dark:text-neutral-500 capitalize font-medium">{finance.status}</span>
                    </div>
                  </div>
                ))}
                
                <div className="p-4 flex justify-center gap-4 bg-neutral-50/30 dark:bg-[#1a1a1a]/30">
                  {displayedFinances.length > visibleCount && (
                    <button onClick={() => setVisibleCount(v => v + 6)} className="px-5 py-2 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-sm rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm flex items-center">
                      <ChevronDown className="w-4 h-4 mr-1.5" /> Ver más
                    </button>
                  )}
                  {visibleCount > 6 && (
                    <button onClick={() => setVisibleCount(6)} className="px-5 py-2 bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-sm rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm flex items-center">
                      <ChevronUp className="w-4 h-4 mr-1.5" /> Ver menos
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: DETALLE / SIMULADOR (SIN EFECTO STICKY) */}
        {selectedTransaction ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-1/3 bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-lg p-8 relative flex flex-col h-fit transition-colors">
            <button onClick={() => setSelectedTransaction(null)} className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            <div className="mb-8 mt-2">
              <div className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-4 border ${selectedTransaction.type === 'ingreso' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'}`}>
                {selectedTransaction.type === 'ingreso' ? 'Ingreso Registrado' : 'Gasto Registrado'}
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white leading-tight pr-8">{selectedTransaction.description}</h3>
            </div>
            <div className="space-y-6 mb-10 flex-1">
              <div className="bg-neutral-50/50 dark:bg-neutral-800/50 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Total</p>
                <p className={`text-4xl font-bold tracking-tight ${selectedTransaction.type === 'ingreso' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{formatMoney(selectedTransaction.amount)}</p>
              </div>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 px-2">
                <div><p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Fecha</p><p className="text-sm font-semibold text-neutral-900 dark:text-white">{formatDate(selectedTransaction.date)}</p></div>
                <div><p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Categoría</p><p className="text-sm font-semibold text-neutral-900 dark:text-white">{selectedTransaction.category}</p></div>
                <div><p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Estado</p><p className="text-sm font-semibold text-neutral-900 dark:text-white capitalize">{selectedTransaction.status}</p></div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => handleDownloadInvoice(selectedTransaction._id)} disabled={isDownloadingInvoice} className="w-full py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center shadow-sm disabled:opacity-50">
                {isDownloadingInvoice ? <div className="w-4 h-4 mr-2 border-2 border-neutral-400 border-t-white rounded-full animate-spin"></div> : <Download className="w-4 h-4 mr-2" />} Descargar Factura Oficial
              </button>
              
              <div className="flex gap-3">
                <button onClick={() => handleToggleArchive(selectedTransaction)} className="flex-1 py-3.5 bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center border border-transparent">
                  <Archive className="w-4 h-4 mr-2" /> {(selectedTransaction as any).isArchived ? 'Desarchivar' : 'Archivar'}
                </button>
                <button onClick={() => handleDelete(selectedTransaction._id)} className="flex-1 py-3.5 bg-white dark:bg-transparent text-rose-600 dark:text-rose-400 font-bold rounded-xl border border-rose-200 dark:border-rose-800/80 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center justify-center shadow-sm">
                  <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full lg:w-1/2 h-fit">
            <div className="bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm p-6 flex flex-col transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center tracking-tight">
                  <Calculator className="w-5 h-5 mr-2 text-emerald--600 dark:text-emerald--400" /> Planificador de Presupuesto
                </h3>
                <button onClick={() => setSimulatorRows([...simulatorRows, { id: generateId(), type: 'gasto', name: '', amount: 0, isFixed: false }])} className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-md transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light mb-6">Calcula tus operaciones a futuro y añádelas a tu cuenta con un clic.</p>
              
              <div className="space-y-3">
                {visibleSimulatorRows.map((item) => (
                  <div key={item.id} className="flex items-center space-x-1 sm:space-x-2 group">
                    <button onClick={() => updateSimulatorRow(item.id, 'type', item.type === 'ingreso' ? 'gasto' : 'ingreso')} className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-sm font-bold border transition-colors ${item.type === 'ingreso' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'}`}>
                      {item.type === 'ingreso' ? '+' : '-'}
                    </button>
                    <input type="text" placeholder="Concepto..." value={item.name} onChange={(e) => updateSimulatorRow(item.id, 'name', e.target.value)} className="flex-1 min-w-0 px-3 py-2 text-sm bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:bg-white dark:focus:bg-black rounded-lg transition-all outline-none font-medium text-neutral-700 dark:text-neutral-200" />
                    <div className="relative w-24 sm:w-28 flex-shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-sm font-medium">€</span>
                      <input type="number" min="0" value={item.amount || ''} onChange={(e) => updateSimulatorRow(item.id, 'amount', Number(e.target.value))} className={`w-full pl-7 pr-1 sm:pr-3 py-2 text-sm font-bold bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:bg-white dark:focus:bg-black rounded-lg transition-all outline-none ${item.type === 'ingreso' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`} />
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button onClick={() => updateSimulatorRow(item.id, 'isFixed', !item.isFixed)} title={item.isFixed ? "Es un gasto/ingreso fijo (se repetirá el próximo mes)" : "Marcar como recurrente mensual"} className={`p-2 rounded-lg transition-colors ${item.isFixed ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
                        <Repeat className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleUploadRow(item)} title="Registrar en la cuenta real" className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                        <Upload className="w-4 h-4" />
                      </button>
                      <button onClick={() => setSimulatorRows(simulatorRows.filter(t => t.id !== item.id))} className="p-2 text-neutral-300 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {simulatorRows.length === 0 && <p className="text-sm text-neutral-400 dark:text-neutral-500 italic text-center py-4">Añade conceptos para planificar tu mes.</p>}
              </div>

              {(simulatorRows.length > 6 || visibleSimulatorCount > 6) && (
                <div className="flex justify-center gap-3 mt-4">
                  {simulatorRows.length > visibleSimulatorCount && (
                    <button onClick={() => setVisibleSimulatorCount(v => v + 6)} className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center">
                      <ChevronDown className="w-3 h-3 mr-1" /> Ver más ({simulatorRows.length - visibleSimulatorCount})
                    </button>
                  )}
                  {visibleSimulatorCount > 6 && (
                    <button onClick={() => setVisibleSimulatorCount(6)} className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center">
                      <ChevronUp className="w-3 h-3 mr-1" /> Ver menos
                    </button>
                  )}
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Total Planificado</span>
                  <span className={`text-2xl font-bold tracking-tight px-4 py-1.5 rounded-xl ${simulatorTotal >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'}`}>
                    {formatMoney(simulatorTotal)}
                  </span>
                </div>
                <button onClick={handleUploadAll} disabled={simulatorRows.length === 0} className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center shadow-sm disabled:opacity-50">
                  <UploadCloud className="w-4 h-4 mr-2" /> Subir Todo a mi Cuenta Real
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </div>

      <FinanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* --------------------------------------------------------------- */}
      {/* TEMPLATE PARA REPORTE PDF (OCULTO) */}
      <div className="overflow-hidden h-0 w-0 absolute pointer-events-none">
        <div id="financial-report-template" className="w-[800px] bg-white text-black p-12 font-sans border-0 shadow-none">
          {/* Cabecera del Reporte */}
          <div className="flex justify-between items-start border-b-2 border-neutral-200 pb-8 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-1">REPORTE FINANCIERO</h1>
              <p className="text-neutral-500 font-bold uppercase tracking-wider text-sm">{timeframeLabels[reportTimeframe]}</p>
              <p className="text-neutral-400 text-xs mt-2">Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-lg text-neutral-900">{user?.name || 'Usuario'}</h3>
              <p className="text-neutral-500 text-sm">{user?.email}</p>
              <p className="text-emerald-600 font-bold text-xs mt-1">AI Business Manager Premium</p>
            </div>
          </div>

          {/* Resumen de Cifras */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Balance Neto</p>
              <p className={`text-2xl font-black ${filteredFinancesForReport.reduce((acc, f) => f.type === 'ingreso' ? acc + f.amount : acc - f.amount, 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatMoney(filteredFinancesForReport.reduce((acc, f) => f.type === 'ingreso' ? acc + f.amount : acc - f.amount, 0))}
              </p>
            </div>
            <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Total Ingresos</p>
              <p className="text-2xl font-black text-emerald-600">
                {formatMoney(filteredFinancesForReport.filter(f => f.type === 'ingreso').reduce((acc, f) => acc + f.amount, 0))}
              </p>
            </div>
            <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Total Gastos</p>
              <p className="text-2xl font-black text-rose-600">
                {formatMoney(filteredFinancesForReport.filter(f => f.type === 'gasto').reduce((acc, f) => acc + f.amount, 0))}
              </p>
            </div>
          </div>

          {/* Tabla de Movimientos */}
          <div>
            <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-4 border-l-4 border-neutral-900 pl-3">Detalle de Operaciones</h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-900 text-white font-bold">
                  <th className="p-3 rounded-tl-xl">Fecha</th>
                  <th className="p-3">Concepto / Descripción</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3 text-right rounded-tr-xl">Cantidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredFinancesForReport.map((f, i) => (
                  <tr key={f._id} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}>
                    <td className="p-3 font-medium text-neutral-500">{new Date(f.date).toLocaleDateString('es-ES')}</td>
                    <td className="p-3">
                      <p className="font-bold text-neutral-900">{f.title || f.description}</p>
                      {f.title && <p className="text-[10px] text-neutral-400 italic">{f.description}</p>}
                    </td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-[9px] font-bold uppercase">{f.category}</span></td>
                    <td className={`p-3 text-right font-black ${f.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {f.type === 'ingreso' ? '+' : '-'}{formatMoney(f.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pie de página del Reporte */}
          <div className="mt-12 pt-8 border-t border-neutral-100 text-center">
            <p className="text-[10px] text-neutral-400 font-medium">Este documento es un extracto informativo generado automáticamente por AI Business Manager.</p>
            <p className="text-[10px] text-neutral-300 mt-1">© 2026 AI Business Manager - Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}