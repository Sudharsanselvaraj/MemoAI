import { motion } from 'framer-motion'
import { Mic, Zap, Database, Terminal, RefreshCcw } from 'lucide-react'

export default function FeatureSection() {
  const steps = [
    { 
      icon: Mic, 
      step: 'STEP 01', 
      title: 'Voice Input', 
      desc: 'Speech-to-text via Whisper',
      color: 'text-indigo-500',
      bg: 'bg-indigo-50'
    },
    { 
      icon: Zap, 
      step: 'STEP 02', 
      title: 'Intent Detection', 
      desc: 'Memory-aware reasoning',
      color: 'text-amber-500',
      bg: 'bg-amber-50'
    },
    { 
      icon: Database, 
      step: 'STEP 03', 
      title: 'Memory Retrieval', 
      desc: 'Persistent context loading',
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    { 
      icon: Terminal, 
      step: 'STEP 04', 
      title: 'Tool Execution', 
      desc: 'Autonomous tool decisions',
      color: 'text-slate-600',
      bg: 'bg-slate-100'
    },
    { 
      icon: RefreshCcw, 
      step: 'STEP 05', 
      title: 'Response Feedback', 
      desc: 'Persistent learning loop',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50'
    },
  ]

  return (
    <section id="pipeline" className="py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">PIPELINE</p>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
            From voice to memory to action.
          </h2>
          <p className="text-gray-500 mt-6 text-lg max-w-2xl mx-auto font-medium">
            Mem0AI processes every command through a memory-first pipeline.
          </p>
        </div>

        <div className="relative">
          {/* CONNECTING LINE */}
          <div className="absolute top-[48px] left-[10%] right-[10%] h-[1px] bg-gray-100 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 relative z-10">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className={`w-24 h-24 ${s.bg} rounded-full flex items-center justify-center mb-8 relative border-8 border-white shadow-sm transition-transform hover:scale-110 duration-300`}>
                  <s.icon className={`w-8 h-8 ${s.color}`} />
                </div>
                
                <p className="text-[10px] font-bold text-gray-300 tracking-widest mb-3">{s.step}</p>
                <h4 className="text-sm font-bold text-gray-900 mb-2">{s.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed max-w-[140px]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}