import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion'; 
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, PieChart, Users, CheckSquare, Sparkles, LayoutGrid, ArrowUpRight, Zap, Globe, Shield, Building, BarChart2, Lock, TrendingUp } from 'lucide-react';

import heroImg from '../assets/hero-dashboard.png';
import financeImg from '../assets/finance-bento.png';
import aiChatImg from '../assets/ai-chat-bento.png';
import clientsImg from '../assets/clients-bento.png';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const features = [
  {
    icon: Users,
    title: 'CRM de Clientes',
    desc: 'Gestiona contactos, historial y documentos de cada cliente en un perfil unificado.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: PieChart,
    title: 'Gestión Financiera',
    desc: 'Genera presupuestos, registra movimientos y descarga facturas PDF en segundos.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: CheckSquare,
    title: 'Proyectos y Tareas',
    desc: 'Vistas de Lista, Kanban o Calendario. Asigna tareas directamente a tus clientes.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Bot,
    title: 'Asistente con IA',
    desc: 'Responde preguntas, redacta correos y analiza tu negocio con lenguaje natural.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: BarChart2,
    title: 'Panel de Control',
    desc: 'Dashboard con métricas clave, ventas recientes y actividad de tu equipo en tiempo real.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Lock,
    title: 'Seguridad y Acceso',
    desc: 'Autenticación de dos factores, gestión de sesiones y control de dispositivos activos.',
    color: 'text-neutral-500',
    bg: 'bg-neutral-500/10',
  },
];

const steps = [
  {
    number: '01',
    title: 'Crea tu cuenta',
    desc: 'Regístrate en menos de 60 segundos. Solo necesitas tu nombre y email. Sin tarjeta de crédito.',
  },
  {
    number: '02',
    title: 'Configura tu empresa',
    desc: 'Añade tus clientes, define tu equipo y personaliza el panel según las necesidades de tu negocio.',
  },
  {
    number: '03',
    title: 'Conecta tus herramientas',
    desc: 'Centraliza proyectos, finanzas y clientes en una sola plataforma. Sin doble entrada de datos.',
  },
  {
    number: '04',
    title: 'Escala con IA',
    desc: 'Activa el asistente IA para automatizar análisis, responder consultas y tomar mejores decisiones.',
  },
];

const stats = [
  { value: '80%', label: 'Reducción en tiempo de gestión' },
  { value: '24/7', label: 'Disponibilidad de la plataforma' },
  { value: '0', label: 'Apps adicionales necesarias' },
  { value: '10min', label: 'Para configurar tu cuenta' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#000000] selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black overflow-hidden font-sans transition-colors duration-300 text-neutral-900 dark:text-white">
      
      {/* navbar */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-[#000000]/80 backdrop-blur-md border-b border-neutral-200/60 dark:border-neutral-800/60 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-md flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 text-white dark:text-neutral-900" />
              </div>
              <span className="font-bold text-lg tracking-tight">AI Manager</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-600 dark:text-neutral-400">
              <a href="#funciones" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Funciones</a>
              <a href="#como-funciona" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Cómo funciona</a>
              <a href="#suite" className="hover:text-neutral-900 dark:hover:text-white transition-colors">La Suite</a>
              <a href="#precios" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Precios</a>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="hidden sm:block text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm">
              Prueba gratuita
            </Link>
          </div>
        </div>
      </nav>

      {/* sección hero */}
      <section className="pt-48 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-4xl z-10 flex flex-col items-center">
          
          <motion.div variants={fadeUp} className="inline-flex items-center px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111] mb-8">
            <Sparkles className="w-3.5 h-3.5 mr-2 text-neutral-500 dark:text-neutral-400" />
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-widest">El fin de las apps desconectadas</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] mb-8">
            El sistema operativo <br className="hidden md:block" />
            <span className="text-neutral-400 dark:text-neutral-500">para tu empresa.</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-xl text-neutral-500 dark:text-neutral-400 mb-10 max-w-2xl font-light leading-relaxed">
            Reemplaza tu amalgama de herramientas en silos. Administra ventas, finanzas, proyectos e Inteligencia Artificial desde una única plataforma nativa.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold text-base transition-transform hover:scale-[1.02] shadow-lg flex items-center justify-center">
              Crear cuenta gratis <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <a href="#como-funciona" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-black text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 rounded-xl font-bold text-base transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900 flex items-center justify-center">
              Ver cómo funciona
            </a>
          </motion.div>
        </motion.div>

        {/* imagen principal */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, delay: 0.2, ease: [0.25, 1, 0.5, 1] }} 
          className="mt-24 w-full max-w-6xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent z-10 h-1/2 bottom-0 pointer-events-none"></div>
          <div className="bg-neutral-50 dark:bg-[#0A0A0A] rounded-[2rem] border border-neutral-200/80 dark:border-neutral-800 shadow-2xl p-2 md:p-4">
            <div className="aspect-[16/9] w-full rounded-xl md:rounded-[1.5rem] overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50">
              <img src={heroImg} alt="AI Manager Dashboard" className="w-full h-full object-cover object-top" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* prueba social */}
      <section className="py-12 border-y border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 grayscale dark:invert">
          <p className="text-sm font-bold uppercase tracking-widest text-neutral-500">Confiado por innovadores</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center text-xl font-bold tracking-tight"><Building className="w-5 h-5 mr-2" /> AcmeCorp</div>
            <div className="flex items-center text-xl font-bold tracking-tight"><Globe className="w-5 h-5 mr-2" /> GlobalTech</div>
            <div className="flex items-center text-xl font-bold tracking-tight"><Shield className="w-5 h-5 mr-2" /> SecureSys</div>
            <div className="flex items-center text-xl font-bold tracking-tight"><Zap className="w-5 h-5 mr-2" /> Velocity</div>
          </div>
        </div>
      </section>

      {/* ===== NUEVA SECCIÓN: Funciones ===== */}
      <section id="funciones" className="py-32 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111] mb-6">
            <TrendingUp className="w-3.5 h-3.5 mr-2 text-emerald-500" />
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-widest">Funciones</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Todo lo que tu empresa <br className="hidden md:block" />necesita, en un solo lugar.</h2>
          <p className="text-xl text-neutral-500 dark:text-neutral-400 font-light">Un sistema completo que trabaja solo, para que tú te concentres en lo que importa: hacer crecer tu negocio.</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="bg-neutral-50 dark:bg-[#0A0A0A] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 hover:border-neutral-300 dark:hover:border-neutral-700 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-6`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <h3 className="text-lg font-bold mb-3 tracking-tight">{title}</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed font-light">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== NUEVA SECCIÓN: Cómo funciona ===== */}
      <section id="como-funciona" className="py-32 px-6 border-y border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111] mb-6">
              <Sparkles className="w-3.5 h-3.5 mr-2 text-emerald-500" />
              <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-widest">Cómo funciona</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Listo en menos de 10 minutos.</h2>
            <p className="text-xl text-neutral-500 dark:text-neutral-400 font-light">Sin instalaciones complicadas. Configura tu entorno y empieza a operar desde el primer día.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Pasos */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="space-y-8"
            >
              {steps.map((step, i) => (
                <motion.div key={step.number} variants={fadeUp} className="flex gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:border-emerald-400 transition-colors">
                      <span className="text-xs font-black text-neutral-500 dark:text-neutral-400">{step.number}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px flex-1 bg-neutral-200 dark:bg-neutral-800 mt-3 min-h-[2rem]" />
                    )}
                  </div>
                  <div className="pb-8">
                    <h3 className="text-lg font-bold mb-2 tracking-tight">{step.title}</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed font-light">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Panel de resultados */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
            >
              <div className="bg-neutral-900 dark:bg-[#0A0A0A] rounded-[2rem] border border-neutral-800 p-10">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-8">Resultados esperados</p>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map(({ value, label }) => (
                    <div key={label} className="bg-neutral-800/60 dark:bg-neutral-900 rounded-xl p-6 border border-neutral-700/50">
                      <p className="text-3xl font-black text-emerald-400 tracking-tighter mb-2">{value}</p>
                      <p className="text-neutral-400 text-xs font-medium leading-snug">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-8 border-t border-neutral-800">
                  <p className="text-neutral-500 text-sm leading-relaxed font-light">
                    Las empresas que centralizan su gestión reduce el tiempo operativo un 80% y aumentan la satisfacción de sus clientes.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* la suite de herramientas */}
      <section id="suite" className="py-32 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="max-w-3xl mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Una suite conectada. <br/>Múltiples soluciones.</h2>
          <p className="text-xl text-neutral-500 dark:text-neutral-400 font-light">Elimina las barreras entre tus departamentos. Cuando tus clientes, tareas y finanzas comparten la misma base de datos, la magia ocurre.</p>
        </motion.div>

        {/* Grid Arquitectónico */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Módulo CRM */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="md:col-span-8 bg-neutral-50 dark:bg-[#0A0A0A] rounded-[2rem] border border-neutral-200 dark:border-neutral-800 p-10 flex flex-col md:flex-row gap-8 group hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
          >
            <div className="flex-1">
              <div className="w-12 h-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Directorio CRM</h3>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6 font-light">Unifica la información de contacto y facturación. Visualiza el historial completo, documentos y proyectos activos de cada cliente en un solo perfil estructurado.</p>
              <Link to="/register" className="inline-flex items-center text-sm font-bold hover:text-neutral-500 transition-colors">
                Explorar CRM <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="flex-1 relative min-h-[200px] w-full bg-white dark:bg-[#111] rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-md">
               <img src={clientsImg} alt="CRM" className="absolute inset-0 w-full h-full object-cover object-left-top group-hover:scale-105 transition-transform duration-700 ease-out" />
            </div>
          </motion.div>

          {/* Módulo IA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="md:col-span-4 bg-neutral-50 dark:bg-[#0A0A0A] rounded-[2rem] border border-neutral-200 dark:border-neutral-800 p-10 flex flex-col group hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl flex items-center justify-center mb-6 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold mb-3 tracking-tight">Socio IA</h3>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8 font-light relative z-10">Automatiza análisis y redacción de correos con un modelo que entiende el contexto de tu negocio real.</p>
            <div className="mt-auto h-32 w-[120%] -ml-[10%] bg-white dark:bg-[#111] rounded-t-xl border-t border-x border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-md relative z-10">
               <img src={aiChatImg} alt="AI" className="w-full h-full object-cover object-top group-hover:-translate-y-2 transition-transform duration-700 ease-out" />
            </div>
          </motion.div>

          {/* Módulo Finanzas */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="md:col-span-4 bg-neutral-50 dark:bg-[#0A0A0A] rounded-[2rem] border border-neutral-200 dark:border-neutral-800 p-10 flex flex-col group hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
          >
            <div className="w-12 h-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl flex items-center justify-center mb-6 shadow-sm">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold mb-3 tracking-tight">Contabilidad</h3>
            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8 font-light">Genera presupuestos, registra movimientos y descarga facturas en PDF listas para enviar.</p>
            <div className="mt-auto h-32 w-[120%] -ml-[10%] bg-white dark:bg-[#111] rounded-tl-xl border-t border-l border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-md">
               <img src={financeImg} alt="Finanzas" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out" />
            </div>
          </motion.div>

          {/* Módulo Proyectos */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="md:col-span-8 bg-neutral-900 dark:bg-[#111] text-white rounded-[2rem] border border-neutral-800 p-10 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 bg-neutral-800 border border-neutral-700 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Gestión Operativa</h3>
              <p className="text-neutral-400 leading-relaxed max-w-xl font-light">Controla la ejecución mediante vistas de Lista, Kanban o Calendario. Asigna tareas directamente a las cuentas de tus clientes y visualiza los cuellos de botella antes de que ocurran.</p>
            </div>
            <div className="mt-12 flex space-x-4">
              <div className="px-4 py-2 bg-neutral-800 rounded-lg text-sm font-semibold border border-neutral-700">Kanban Board</div>
              <div className="px-4 py-2 bg-neutral-800 rounded-lg text-sm font-semibold border border-neutral-700">Calendar Sync</div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* sección de precios */}
      <section id="precios" className="py-32 px-6 border-y border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-16">
          <div className="flex-1 md:sticky top-32">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Un precio. <br/>Toda la suite.</h2>
            <p className="text-lg text-neutral-500 dark:text-neutral-400 font-light mb-8 max-w-md">Deje de pagar suscripciones separadas por su CRM, su gestor de tareas y su IA. AI Manager unifica los costes de su negocio.</p>
          </div>

          <div className="flex-1 w-full max-w-lg">
            <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-xl p-10 relative">
              <h3 className="text-2xl font-bold mb-2">Pro Business</h3>
              <p className="text-neutral-500 dark:text-neutral-400 font-light mb-8">Licencia completa de acceso al sistema operativo.</p>
              
              <div className="mb-8 pb-8 border-b border-neutral-200 dark:border-neutral-800 flex items-end gap-2">
                <span className="text-6xl font-black tracking-tighter">€10</span>
                <span className="text-neutral-500 font-medium mb-2">/usuario/de por vida</span>
              </div>

              <ul className="space-y-4 mb-10">
                <li className="flex items-start text-neutral-600 dark:text-neutral-300 font-medium">
                  <CheckSquare className="w-5 h-5 mr-3 text-neutral-900 dark:text-white shrink-0" /> Directorio de Clientes Ilimitado
                </li>
                <li className="flex items-start text-neutral-600 dark:text-neutral-300 font-medium">
                  <CheckSquare className="w-5 h-5 mr-3 text-neutral-900 dark:text-white shrink-0" /> Facturación y Simuladores PDF
                </li>
                <li className="flex items-start text-neutral-600 dark:text-neutral-300 font-medium">
                  <CheckSquare className="w-5 h-5 mr-3 text-neutral-900 dark:text-white shrink-0" /> Gestión de Proyectos (Kanban/Cal)
                </li>
                <li className="flex items-start text-neutral-600 dark:text-neutral-300 font-medium">
                  <CheckSquare className="w-5 h-5 mr-3 text-neutral-900 dark:text-white shrink-0" /> Asistente IA (100 prompts/mes)
                </li>
              </ul>

              <Link to="/register" className="w-full py-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-center hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-transform hover:scale-[1.02] shadow-md block">
                Comenzar prueba de 7 días
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* cta final */}
      <section className="py-40 px-6 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Listos para escalar.</h2>
          <p className="text-xl text-neutral-500 dark:text-neutral-400 mb-10 font-light max-w-2xl mx-auto">Configura tu entorno de trabajo en minutos e invita a tu equipo a una plataforma que realmente tiene sentido.</p>
          <Link to="/register" className="px-10 py-5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold text-lg transition-transform hover:scale-[1.02] shadow-xl inline-flex items-center">
            Empezar ahora <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </section>

      {/* footer */}
      <footer className="bg-white dark:bg-[#000000] py-12 border-t border-neutral-200 dark:border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <LayoutGrid className="w-5 h-5" />
            <span className="font-bold tracking-tight">AI Business Manager</span>
          </div>
          <div className="flex space-x-6 text-sm font-medium text-neutral-500">
            <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Términos</a>
            <span className="opacity-50">© {new Date().getFullYear()} Creado con precisión.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}