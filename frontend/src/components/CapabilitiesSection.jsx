import { motion } from 'framer-motion'

export default function CapabilitiesSection() {
  const actions = [
    { label: 'User preferences stored', status: 'Active', color: 'bg-emerald-500', text: 'text-emerald-500' },
    { label: 'Session context loaded', status: 'Processing', color: 'bg-amber-400', text: 'text-amber-500' },
    { label: 'Tool execution logged', status: 'Complete', color: 'bg-blue-500', text: 'text-blue-500' },
    { label: 'Memory index updated', status: 'Active', color: 'bg-emerald-500', text: 'text-emerald-500' },
  ]

  return (
    <section className="py-24 px-6 bg-white overflow-hidden border-b border-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* LEFT: MEMORY LOGS UI */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="bg-slate-50/80 border border-slate-100 rounded-[2.5rem] p-8 md:p-10 relative"
          >
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/40 border border-slate-100 h-[420px] flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Memory Logs</h3>
              
              <div className="flex gap-3 mb-8">
                <input 
                  type="text" 
                  readOnly 
                  placeholder="Search logs..." 
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none"
                />
                <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 transition">
                  Filter
                </button>
              </div>

              <div className="flex-1 relative">
                <h4 className="text-sm font-bold text-gray-700 mb-6">Recent Actions</h4>
                
                {/* TIMELINE */}
                <div className="absolute left-1.5 top-[40px] bottom-4 w-0.5 bg-gradient-to-b from-amber-400 via-emerald-400 to-transparent" />
                
                <div className="flex flex-col gap-6 relative">
                  {actions.map((action, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + (i * 0.15) }}
                      className="flex items-center justify-between pl-8 relative group cursor-pointer"
                    >
                      <div className={`absolute left-0 w-3.5 h-3.5 rounded-full border-[3px] border-white ${action.color} shadow-sm group-hover:scale-125 transition-transform`} />
                      <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{action.label}</p>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${action.color}`} />
                        <span className={`text-[10px] font-bold ${action.text}`}>{action.status}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">CAPABILITIES</p>
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tighter leading-[1.1] mb-6">
              Built on memory.<br />Designed for intelligence.
            </h2>
            <p className="text-gray-500 text-lg font-medium mb-10 leading-relaxed max-w-lg">
              Persistent memory. Intent-aware reasoning. Autonomous tool execution. <br />
              Mem0AI connects every layer of your AI workflow.
            </p>

            <button className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition shadow-xl shadow-slate-200">
              Try Mem0AI free
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
