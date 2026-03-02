import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ArrowUp, Sparkles, Command } from 'lucide-react';
import { aiService } from '../services/ai.service';
import { useAuthStore } from '../stores/authStore';
import DOMPurify from 'dompurify';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function AiChat() {
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: `¡Hola, ${user?.name?.split(' ')[0] || 'Líder'}! Soy tu Socio Estratégico IA.\n\nTengo acceso a tu **Directorio de Clientes**, tus **Tareas Activas** y tu **Balance Financiero**.\n\n¿En qué nos enfocamos hoy? Puedo ayudarte a redactar un correo para un cliente, analizar si llegaremos a la meta de facturación, o priorizar tu agenda.`
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const aiResponseText = await aiService.chat(userMessage);
      const newAiMessage: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: aiResponseText };
      setMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(), role: 'ai',
        content: 'Lo siento, he perdido la conexión con el servidor. ¿Podrías intentarlo de nuevo en unos segundos?'
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto bg-white dark:bg-[#121212] rounded-[2rem] border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm overflow-hidden relative transition-colors duration-300">
      
      {/* CABECERA MINIMALISTA */}
      <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md sticky top-0 z-10 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center shadow-sm transition-colors">
            <Sparkles className="w-5 h-5 text-white dark:text-neutral-900" />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight flex items-center transition-colors">
              AI Manager
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium flex items-center mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
              Conectado a tu espacio de trabajo
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center text-xs font-semibold text-neutral-600 dark:text-neutral-400 transition-colors">
          <Command className="w-3.5 h-3.5 mr-1" /> Contexto Activo
        </div>
      </div>

      {/* ÁREA DE MENSAJES */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth bg-neutral-50/30 dark:bg-[#0a0a0a]/50 transition-colors">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] sm:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {msg.role === 'ai' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center mr-4 mt-1 shadow-sm transition-colors">
                  <Bot className="w-4 h-4 text-white dark:text-neutral-900" />
                </div>
              )}

              <div className={`text-base leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white px-5 py-3 rounded-2xl font-medium transition-colors' 
                  : 'text-neutral-700 dark:text-neutral-300 pt-1.5 transition-colors'
              }`}>
                {msg.role === 'ai' ? (
                  <div className="whitespace-pre-wrap font-light tracking-wide" dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(msg.content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-neutral-900 dark:text-white">$1</strong>')) 
                  }} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>

            </div>
          </motion.div>
        ))}

        {/* Indicador de Pensando */}
        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
              <div className="flex max-w-[85%] flex-row">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center mr-4 mt-1 shadow-sm transition-colors">
                  <Bot className="w-4 h-4 text-white dark:text-neutral-900" />
                </div>
                <div className="pt-3 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* INPUT FLOTANTE */}
      <div className="p-4 sm:p-6 bg-white dark:bg-[#121212] border-t border-neutral-100 dark:border-neutral-800 transition-colors">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto flex items-end shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-[#1a1a1a] focus-within:bg-white dark:focus-within:bg-[#222] focus-within:border-neutral-400 dark:focus-within:border-neutral-500 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Escribe tu consulta aquí... (Shift + Enter para salto de línea)"
            className="w-full pl-5 pr-14 py-4 bg-transparent text-neutral-900 dark:text-white text-base placeholder-neutral-400 dark:placeholder-neutral-500 resize-none outline-none max-h-32 min-h-[56px]"
            rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 5) : 1}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-30 transition-all flex items-center justify-center"
          >
            <ArrowUp className="w-5 h-5" strokeWidth={3} />
          </button>
        </form>
        <div className="text-center mt-3 flex justify-center space-x-4">
           <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">AI Business Manager puede cometer errores. Verifica la información importante.</p>
        </div>
      </div>

    </div>
  );
}