import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion'; 
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, PieChart, Users, CheckSquare, Sparkles, ChevronRight, Shield, Zap, Globe } from 'lucide-react';

import heroImg from '../assets/hero-dashboard.png';
import financeImg from '../assets/finance-bento.png';
import aiChatImg from '../assets/ai-chat-bento.png';
import clientsImg from '../assets/clients-bento.png';

// Animación de entrada premium (rápida, crujiente y sin rebotes exagerados)
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black overflow-hidden font-sans transition-colors duration-300">
      
      {/* 🚀 NAVBAR MINIMALISTA */}
      <nav className="fixed top-0 w-full bg-white/60 dark:bg-[#000000]/60 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-800/50 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-7 h-7 bg-neutral-900 dark:bg-white rounded-md flex items-center justify-center transition-transform group-hover:scale-105">
                <Sparkles className="w-3.5 h-3.5 text-white dark:text-neutral-900" />
              </div>
              <span className="font-semibold text-neutral-900 dark:text-white tracking-tight">AI Manager</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              <a href="#producto" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Producto</a>
              <a href="#precios" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Precios</a>
            </div>
          </div>

          <div className="flex items-center space-x-5">
            <Link to="/login" className="hidden sm:block text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
              Empezar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* 🌟 HERO SECTION */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Resplandor estructural sutil (no mancha toda la pantalla) */}
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-neutral-200/50 dark:bg-white/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-4xl z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-[#111111]/50 backdrop-blur-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white mr-2"></span>
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 tracking-wide">Presentando la v2.0</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold text-neutral-900 dark:text-white tracking-tighter leading-[1.1] mb-6">
            El sistema operativo <br className="hidden md:block" /> para tu negocio.
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-neutral-500 dark:text-neutral-400 mb-10 max-w-2xl mx-auto font-normal leading-relaxed">
            Unifica tus tareas, facturación y clientes en una interfaz que responde a la velocidad de tu pensamiento.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex items-center justify-center">
            <Link to="/register" className="px-6 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-semibold text-base transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center group">
              Comenzar ahora <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* 🖼️ IMAGEN HERO CON ENTRADA 3D */}
        <motion.div 
          initial={{ opacity: 0, y: 80, rotateX: 15, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} 
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} 
          className="mt-20 w-full max-w-5xl relative perspective-1000"
        >
          {/* Degrado inferior para fusionar con el fondo */}
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#000000] via-transparent to-transparent z-10 h-2/3 bottom-0 pointer-events-none"></div>
          
          <div className="bg-white dark:bg-[#0A0A0A] rounded-[1.5rem] md:rounded-[2rem] border border-neutral-200/80 dark:border-neutral-800/80 shadow-2xl p-2">
            <div className="aspect-[16/9] w-full bg-neutral-100 dark:bg-[#111111] rounded-xl md:rounded-[1.5rem] overflow-hidden relative border border-neutral-200/50 dark:border-neutral-800/50">
              <img src={heroImg} alt="Dashboard Preview" className="w-full h-full object-cover object-top" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* 🏢 SOCIAL PROOF (Limpio y sutil) */}
      <section className="py-12 border-y border-neutral-200/50 dark:border-neutral-900/50 bg-[#FAFAFA] dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-8">Confiado por equipos de alto rendimiento</p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-40 grayscale dark:invert">
            <div className="flex items-center text-xl font-bold font-serif tracking-tight"><Zap className="w-5 h-5 mr-1" /> BoltCorp</div>
            <div className="flex items-center text-xl font-bold tracking-tight"><Globe className="w-5 h-5 mr-1" /> Global.io</div>
            <div className="flex items-center text-xl font-bold tracking-tight"><Shield className="w-5 h-5 mr-1" /> SecureNet</div>
            <div className="flex items-center text-xl font-bold tracking-tight"><Users className="w-5 h-5 mr-1" /> Teamwork</div>
          </div>
        </div>
      </section>

      {/* 🧩 BENTO GRID (PRODUCTO) - Estilo Linear/Stripe */}
      <section id="producto" className="py-32 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">Ingeniería financiera.</h2>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl font-normal">Herramientas diseñadas sin fricción para que recuperes el control total de tus operaciones.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Bento Box 1: Finanzas */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="md:col-span-2 bg-[#FAFAFA] dark:bg-[#0A0A0A] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/80 p-8 sm:p-10 relative overflow-hidden group"
          >
            <div className="relative z-10 w-full sm:w-1/2">
              <div className="w-10 h-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center justify-center mb-6 shadow-sm">
                <PieChart className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">Finanzas en tiempo real</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">Simula presupuestos, registra cobros y genera facturas oficiales en PDF al instante. Sincronización perfecta.</p>
            </div>
            {/* Animación del contenido interno, no de la caja entera */}
            <div className="absolute -right-4 -bottom-4 w-[75%] h-[85%] bg-white dark:bg-[#111111] rounded-tl-2xl border-t border-l border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden transition-transform duration-500 ease-out group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:scale-[1.02]">
               <img src={financeImg} alt="Módulo de Finanzas" className="w-full h-full object-cover object-top" />
            </div>
          </motion.div>

          {/* Bento Box 2: IA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="bg-[#FAFAFA] dark:bg-[#0A0A0A] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/80 p-8 relative overflow-hidden flex flex-col group"
          >
            <div className="w-10 h-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center justify-center mb-6 shadow-sm">
              <Bot className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">Socio IA</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed flex-1">Tu asistente privado. Conoce tus métricas y redacta correos por ti.</p>
            
            <div className="mt-8 h-36 w-[110%] -ml-[5%] bg-white dark:bg-[#111111] rounded-t-xl border-t border-x border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-md transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.02]">
               <img src={aiChatImg} alt="Chat IA" className="w-full h-full object-cover object-top" />
            </div>
          </motion.div>

          {/* Bento Box 3: Tareas */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="bg-[#FAFAFA] dark:bg-[#0A0A0A] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/80 p-8 group"
          >
            <div className="w-10 h-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center justify-center mb-6 shadow-sm">
              <CheckSquare className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">Gestión Táctica</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">Vistas de lista, tablero Kanban y calendario. Ejecuta proyectos sin perder el foco en lo importante.</p>
          </motion.div>

          {/* Bento Box 4: Clientes */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="md:col-span-2 bg-[#FAFAFA] dark:bg-[#0A0A0A] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/80 p-8 flex flex-col sm:flex-row items-center gap-8 overflow-hidden group"
          >
            <div className="flex-1 z-10">
              <div className="w-10 h-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center justify-center mb-6 shadow-sm">
                <Users className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">Directorio CRM</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">Datos de contacto y facturación centralizados. Un clic para ver todo el historial de un cliente.</p>
            </div>
            <div className="hidden sm:block flex-1 relative h-[180px] w-full rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-lg transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-rotate-1">
               <img src={clientsImg} alt="Directorio CRM" className="absolute inset-0 w-full h-full object-cover object-left-top" />
            </div>
          </motion.div>

        </div>
      </section>

      {/* 💰 PRECIOS (Minimalista) */}
      <section id="precios" className="py-24 px-6 border-t border-neutral-200/50 dark:border-neutral-900/50 bg-[#FAFAFA] dark:bg-[#000000]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2">Planes simples.</h2>
            <p className="text-neutral-500 dark:text-neutral-400 font-normal">Escala tu negocio sin sorpresas a fin de mes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
            {/* Plan 1 */}
            <div className="p-8 rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0A0A0A] flex flex-col">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Freelancer</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">Para empezar con orden.</p>
              <div className="mb-6"><span className="text-3xl font-bold text-neutral-900 dark:text-white">€0</span><span className="text-neutral-500 text-sm">/mes</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center text-sm text-neutral-600 dark:text-neutral-400"><CheckSquare className="w-4 h-4 mr-3 text-neutral-300 dark:text-neutral-600" /> Tareas ilimitadas</li>
                <li className="flex items-center text-sm text-neutral-600 dark:text-neutral-400"><CheckSquare className="w-4 h-4 mr-3 text-neutral-300 dark:text-neutral-600" /> Hasta 10 Clientes</li>
              </ul>
              <Link to="/register" className="w-full py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 font-medium text-sm text-neutral-900 dark:text-white text-center hover:bg-neutral-50 dark:hover:bg-[#111111] transition-colors">Empezar Gratis</Link>
            </div>

            {/* Plan 2 */}
            <div className="p-8 rounded-[1.5rem] border border-neutral-400 dark:border-neutral-600 bg-white dark:bg-[#0A0A0A] shadow-lg flex flex-col relative">
              <div className="absolute -top-3 left-6 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Pro</div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Business</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">Para negocios en crecimiento.</p>
              <div className="mb-6"><span className="text-3xl font-bold text-neutral-900 dark:text-white">€19</span><span className="text-neutral-500 text-sm">/mes</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center text-sm text-neutral-600 dark:text-neutral-400"><CheckSquare className="w-4 h-4 mr-3 text-neutral-900 dark:text-white" /> Clientes ilimitados</li>
                <li className="flex items-center text-sm text-neutral-600 dark:text-neutral-400"><CheckSquare className="w-4 h-4 mr-3 text-neutral-900 dark:text-white" /> Generación de PDF</li>
                <li className="flex items-center text-sm text-neutral-600 dark:text-neutral-400"><CheckSquare className="w-4 h-4 mr-3 text-neutral-900 dark:text-white" /> 100 consultas IA/mes</li>
              </ul>
              <Link to="/register" className="w-full py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-sm text-center hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm">Suscribirse</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL (Limpio y directo) */}
      <section className="py-32 px-6 border-t border-neutral-200/50 dark:border-neutral-900/50 bg-white dark:bg-[#050505]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-6">Pasa al siguiente nivel.</h2>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-8 font-normal">Crea tu cuenta en menos de 1 minuto y descubre cómo se siente tener tu negocio bajo control.</p>
          <Link to="/register" className="px-8 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-semibold text-base transition-transform hover:scale-[1.02] shadow-md inline-flex items-center group">
            Empezar mi prueba gratis <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-[#000000] py-8 border-t border-neutral-200/50 dark:border-neutral-900/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Sparkles className="w-4 h-4 text-neutral-900 dark:text-white" />
            <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-white">AI Business Manager</span>
          </div>
          <div className="text-xs font-medium text-neutral-500 dark:text-neutral-500">
            © {new Date().getFullYear()} Creado con precisión.
          </div>
        </div>
      </footer>

    </div>
  );
}