import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useFinanceStore } from '../stores/financeStore';
import { useAuthStore } from '../stores/authStore';
import { Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Trash2, Calendar, FileText, X, Briefcase, Building, UserCircle, Crown, Calculator, Download } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import FinanceModal from '../components/crm/FinanceModal';
import type { Finance } from '../types';

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

const getInitialSimulator = (role: string) => {
  switch(role) {
    case 'worker': return [ { id: 1, type: 'ingreso', name: 'Sueldo Base Mensual', amount: 1800 }, { id: 2, type: 'gasto', name: 'Alquiler / Hipoteca', amount: 650 }, { id: 3, type: 'gasto', name: 'Gastos de Luz y Agua', amount: 120 } ];
    case 'freelancer': return [ { id: 1, type: 'ingreso', name: 'Previsión de Facturación', amount: 3500 }, { id: 2, type: 'gasto', name: 'Cuota de Autónomos', amount: 295 }, { id: 3, type: 'gasto', name: 'Apartado IRPF (20%)', amount: 700 } ];
    case 'company': return [ { id: 1, type: 'ingreso', name: 'Previsión Ventas B2B', amount: 15000 }, { id: 2, type: 'gasto', name: 'Nóminas (Ej. Juan, María)', amount: 3800 }, { id: 3, type: 'gasto', name: 'Alquiler Oficina', amount: 1200 } ];
    default: return [ { id: 1, type: 'ingreso', name: 'Fondo Inicial', amount: 5000 }, { id: 2, type: 'gasto', name: 'Gasto Previsto', amount: 1000 } ];
  }
};

export default function Finance() {
  const { finances, summary, isLoading, fetchFinances, fetchSummary, deleteFinance } = useFinanceStore();
  const { user, loadUser } = useAuthStore(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Finance | null>(null);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [reportTimeframe, setReportTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'all'>('monthly');

  const currentUserRole = (user?.preferences as any)?.role || 'god_mode';
  const [simulatorRows, setSimulatorRows] = useState(getInitialSimulator(currentUserRole));

  useEffect(() => { setSimulatorRows(getInitialSimulator(currentUserRole)); }, [currentUserRole]);
  useEffect(() => { fetchSummary(); fetchFinances(); }, [fetchSummary, fetchFinances]);
  useEffect(() => { if(!user) loadUser(); }, [user, loadUser]);

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este movimiento? Afectará a los cálculos totales.')) {
      await deleteFinance(id);
      setSelectedTransaction(null);
    }
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

  const pdfIncome = filteredFinancesForReport.filter(f => f.type === 'ingreso').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pdfExpense = filteredFinancesForReport.filter(f => f.type === 'gasto').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pdfNet = pdfIncome - pdfExpense;

  const timeframeLabels = {
    daily: 'Reporte Diario (Hoy)',
    weekly: 'Reporte Semanal (Últimos 7 días)',
    monthly: 'Reporte Mensual',
    yearly: 'Reporte Anual',
    all: 'Histórico Completo'
  };

  // ⚡ SOLUCIÓN PDF MULTIPÁGINA
  const handleDownloadReport = async () => {
    if (filteredFinancesForReport.length === 0) {
      alert(`No hay movimientos registrados para el período: ${timeframeLabels[reportTimeframe]}`);
      return;
    }

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
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      // El Bucle para añadir páginas si el histórico es muy largo
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; 
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Reporte_Financiero_${reportTimeframe}_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error("Error generando PDF", error);
      alert("Hubo un error al generar el PDF.");
    } finally {
      setIsGeneratingPDF(false);
    }
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
          default: return <><Crown className="w-3.5 h-3.5 mr-1.5 text-yellow-600" /> Modo Dios</>;
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
            <select 
              value={reportTimeframe} 
              onChange={(e) => setReportTimeframe(e.target.value as any)}
              className="bg-transparent text-sm font-semibold text-neutral-700 dark:text-neutral-300 pl-3 pr-8 py-2 outline-none cursor-pointer"
            >
              <option value="daily" className="bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white">Hoy</option>
              <option value="weekly" className="bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white">Última Semana</option>
              <option value="monthly" className="bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white">Este Mes</option>
              <option value="yearly" className="bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white">Este Año</option>
              <option value="all" className="bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white">Todo (Histórico)</option>
            </select>
            
            <button 
              onClick={handleDownloadReport} 
              disabled={isGeneratingPDF}
              className="flex items-center px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50"
              title="Descargar Reporte en PDF"
            >
              {isGeneratingPDF ? (
                <div className="w-4 h-4 mr-1.5 border-2 border-neutral-400 dark:border-neutral-500 border-t-neutral-900 dark:border-t-white rounded-full animate-spin"></div>
              ) : (
                <Download className="w-4 h-4 mr-1.5" />
              )}
              PDF
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
                <Tooltip formatter={(value: any) => formatMoney(Number(value))} cursor={false} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(20,20,20,0.9)', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }} itemStyle={{ color: '#fff' }} />
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
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }} formatter={(value: any) => formatMoney(Number(value))} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(20,20,20,0.9)', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }} itemStyle={{ color: '#fff' }} />
                  <Bar dataKey="income" name="Ingresos" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Gastos" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LISTA IZQUIERDA */}
        <div className={`bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm overflow-hidden flex-1 transition-all duration-300 ${selectedTransaction ? 'lg:w-2/3' : 'w-full lg:w-1/2'}`}>
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/30 dark:bg-[#1a1a1a]">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">Libro de Registros</h2>
          </div>
          {isLoading && finances.length === 0 ? (
             <div className="p-12 text-center text-neutral-400 dark:text-neutral-500">Sincronizando caja...</div>
          ) : finances.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-200 dark:border-neutral-700/50"><FileText className="w-6 h-6 text-neutral-400 dark:text-neutral-500" /></div>
              <p className="text-neutral-900 dark:text-white font-bold text-lg">Caja vacía</p>
              <p className="text-neutral-500 dark:text-neutral-400 font-light mt-1">{content.empty}</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {finances.map((finance) => (
                <div key={finance._id} onClick={() => setSelectedTransaction(finance)} className={`p-5 transition-colors flex items-center justify-between group cursor-pointer ${selectedTransaction?._id === finance._id ? 'bg-neutral-50/80 dark:bg-[#1a1a1a] border-l-4 border-neutral-900 dark:border-white' : 'hover:bg-neutral-50/50 dark:hover:bg-[#1a1a1a]/50 border-l-4 border-transparent'}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${finance.type === 'ingreso' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/50'}`}>
                      {finance.type === 'ingreso' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white">{finance.description}</h4>
                      <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                        <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" /> {formatDate(finance.date)}</span>
                        <span className="mx-2 opacity-50">•</span><span className="px-2 py-0.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm">{finance.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-lg block ${finance.type === 'ingreso' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{finance.type === 'ingreso' ? '+' : '-'}{formatMoney(finance.amount)}</span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500 capitalize font-medium">{finance.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA */}
        {selectedTransaction ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-1/3 bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-lg p-8 relative flex flex-col h-fit sticky top-24 transition-colors">
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
            <button onClick={() => handleDelete(selectedTransaction._id)} className="w-full py-3.5 bg-white dark:bg-transparent text-rose-600 dark:text-rose-400 font-bold rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center justify-center shadow-sm"><Trash2 className="w-4 h-4 mr-2" /> Anular Movimiento</button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full lg:w-1/2">
            <div className="bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm p-6 flex flex-col h-full transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center tracking-tight">
                  <Calculator className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" /> Simulador de Presupuesto
                </h3>
                <button onClick={() => setSimulatorRows([...simulatorRows, { id: Date.now(), type: 'gasto', name: '', amount: 0 }])} className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-md transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light mb-6">Haz cálculos rápidos sin afectar a tu contabilidad real.</p>
              
              <div className="space-y-3 flex-1">
                {simulatorRows.map((item, index) => (
                  <div key={item.id} className="flex items-center space-x-2 group">
                    <button 
                      onClick={() => { const newArr = [...simulatorRows]; newArr[index].type = item.type === 'ingreso' ? 'gasto' : 'ingreso'; setSimulatorRows(newArr); }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border transition-colors ${item.type === 'ingreso' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'}`}
                    >
                      {item.type === 'ingreso' ? '+' : '-'}
                    </button>
                    <input type="text" placeholder="Concepto..." value={item.name} onChange={(e) => { const newArr = [...simulatorRows]; newArr[index].name = e.target.value; setSimulatorRows(newArr); }} className="flex-1 px-3 py-2 text-sm bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:bg-white dark:focus:bg-black rounded-lg transition-all outline-none font-medium text-neutral-700 dark:text-neutral-200" />
                    <div className="relative w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-sm font-medium">€</span>
                      <input type="number" value={item.amount || ''} onChange={(e) => { const newArr = [...simulatorRows]; newArr[index].amount = Number(e.target.value); setSimulatorRows(newArr); }} className={`w-full pl-7 pr-3 py-2 text-sm font-bold bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:bg-white dark:focus:bg-black rounded-lg transition-all outline-none ${item.type === 'ingreso' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`} />
                    </div>
                    <button onClick={() => setSimulatorRows(simulatorRows.filter(t => t.id !== item.id))} className="p-2 text-neutral-300 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {simulatorRows.length === 0 && <p className="text-sm text-neutral-400 dark:text-neutral-500 italic text-center py-4">Añade conceptos para calcular.</p>}
              </div>

              <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Total Calculado</span>
                <span className={`text-2xl font-bold tracking-tight px-4 py-1.5 rounded-xl ${simulatorTotal >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'}`}>
                  {formatMoney(simulatorTotal)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <FinanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* --------------------------------------------------------------- */}
      {/* 🧾 PLANTILLA DEL REPORTE FINANCIERO OCULTA (SOLO PDF) */}
      {/* --------------------------------------------------------------- */}
      <div className="overflow-hidden h-0 w-0 absolute pointer-events-none">
        <div id="financial-report-template" className="w-[800px] bg-white text-black p-16 font-sans border-0 shadow-none">
          
          <div className="flex justify-between items-start border-b-2 border-neutral-200 pb-8 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">REPORTE FINANCIERO</h1>
              <p className="text-neutral-500 font-bold uppercase tracking-wider">{timeframeLabels[reportTimeframe]}</p>
              <p className="text-neutral-500 font-medium mt-1">Fecha de emisión: {new Date().toLocaleDateString('es-ES')}</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-lg text-neutral-900">{user?.name || 'Administración'}</h3>
              <p className="text-neutral-500">{user?.email}</p>
              <p className="text-neutral-500 text-sm mt-1">AI Business Manager</p>
            </div>
          </div>

          <div className="flex space-x-6 mb-10">
            <div className="flex-1 border-l-4 border-emerald-500 pl-4">
              <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider">Ingresos Totales</p>
              <p className="text-3xl font-bold text-emerald-600">{pdfIncome.toFixed(2)} €</p>
            </div>
            <div className="flex-1 border-l-4 border-rose-500 pl-4">
              <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider">Gastos Totales</p>
              <p className="text-3xl font-bold text-rose-600">{pdfExpense.toFixed(2)} €</p>
            </div>
            <div className="flex-1 border-l-4 border-neutral-900 pl-4">
              <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider">Beneficio Neto</p>
              <p className={`text-3xl font-bold ${pdfNet >= 0 ? 'text-neutral-900' : 'text-rose-600'}`}>{pdfNet.toFixed(2)} €</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-neutral-900 mb-4 border-b border-neutral-200 pb-2">Desglose de Movimientos</h3>
          <table className="w-full text-left text-sm mb-12">
            <thead className="bg-neutral-100 text-neutral-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Fecha</th>
                <th className="px-4 py-3">Concepto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredFinancesForReport.slice(0, 40).map(item => (
                <tr key={item._id} className="text-neutral-800">
                  <td className="px-4 py-4">{new Date(item.date).toLocaleDateString('es-ES')}</td>
                  <td className="px-4 py-4 font-medium">{item.description}</td>
                  <td className="px-4 py-4 text-neutral-500">{item.category}</td>
                  <td className={`px-4 py-4 text-right font-bold ${item.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.type === 'ingreso' ? '+' : '-'}{item.amount.toFixed(2)} €
                  </td>
                </tr>
              ))}
              {filteredFinancesForReport.length > 40 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-neutral-500 italic text-xs">Mostrando los últimos 40 movimientos del período.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-20 pt-8 border-t border-neutral-200 text-center">
            <p className="text-neutral-400 text-sm font-medium">Documento de uso analítico e interno. Generado automáticamente.</p>
          </div>

        </div>
      </div>
      {/* --------------------------------------------------------------- */}

    </div>
  );
}