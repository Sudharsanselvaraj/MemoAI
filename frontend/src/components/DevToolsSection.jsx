import { motion } from 'framer-motion'
import { Folder, Terminal as TerminalIcon, Globe, Database, Cpu, Code2 } from 'lucide-react'

export default function DevToolsSection() {
  const tools = [
    { icon: Folder, label: 'Files' },
    { icon: TerminalIcon, label: 'Shell' },
    { icon: Globe, label: 'Web' },
    { icon: Database, label: 'Memory' },
    { icon: Cpu, label: 'API' },
    { icon: Code2, label: 'Python' },
  ]

  return (
    <section id="docs" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">DEVELOPER TOOLS</p>
          <h2 className="text-5xl font-bold text-gray-900 tracking-tighter mb-6">
            Built for developers and engineers.
          </h2>
          <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            Extend Mem0AI with your own tools, models, and memory backends.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* LEFT: TERMINAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-[#0c0c0c] rounded-2xl p-1 shadow-2xl shadow-indigo-200/20"
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <p className="text-[10px] font-bold text-white/20 tracking-widest">mem0ai — zsh</p>
              <div className="w-10" />
            </div>
            
            {/* Terminal Body */}
            <div className="p-8 font-mono text-sm leading-relaxed">
              <div className="mb-6">
                <p className="text-white/40 mb-2"># Mem0AI command system</p>
                <div className="flex gap-3">
                  <span className="text-emerald-400 font-bold opacity-80">&gt;</span>
                  <p className="text-white font-medium">create file script.py</p>
                </div>
                <p className="text-white/40 ml-6 mt-1">✓ Created output/script.py</p>
              </div>

              <div className="mb-6">
                <div className="flex gap-3">
                  <span className="text-emerald-400 font-bold opacity-80">&gt;</span>
                  <p className="text-white font-medium">store memory "prefers go"</p>
                </div>
                <p className="text-white/40 ml-6 mt-1 text-xs italic">✓ Stored [mem_id: 4829]</p>
              </div>

              <div className="mb-6">
                <div className="flex gap-3">
                  <span className="text-emerald-400 font-bold opacity-80">&gt;</span>
                  <p className="text-white font-medium text-indigo-400">run inference --local</p>
                </div>
                <p className="text-emerald-400/60 ml-6 mt-1 font-bold italic">✓ llama3 response ready</p>
              </div>
              
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-2 h-4 bg-indigo-500 ml-6"
              />
            </div>
          </motion.div>

          {/* RIGHT: INTEGRATION TILES */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50/50 p-8 rounded-3xl border border-gray-100/50">
            {tools.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, backgroundColor: 'white', borderColor: 'transparent', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}
                className="flex flex-col items-center justify-center p-8 bg-transparent border border-gray-100 rounded-3xl transition-all duration-300 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 text-gray-400 group-hover:text-indigo-600 transition-colors">
                  <t.icon size={22} strokeWidth={2} />
                </div>
                <p className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors">{t.label}</p>
              </motion.div>
            ))}
            
            {/* TOOL INTEGRATIONS INFO */}
            <div className="col-span-full pt-6 border-t border-gray-100 mt-2">
               <h4 className="text-sm font-bold text-gray-900 mb-2">Tool integrations</h4>
               <p className="text-xs text-gray-400 leading-relaxed max-w-sm">Connects to local tools and APIs using memory-aware workflows.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
