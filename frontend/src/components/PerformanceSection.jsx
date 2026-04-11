import { motion } from 'framer-motion'
import { BarChart3, Users, Target, Clock6 } from 'lucide-react'

export default function PerformanceSection() {
  const metrics = [
    { icon: BarChart3, value: '342', label: 'Memories Stored', trend: '+8.2% this week', color: 'text-blue-500' },
    { icon: Users, value: '330', label: 'Active Sessions', trend: '+5.1%', color: 'text-indigo-500' },
    { icon: Target, value: '98%', label: 'Accuracy', trend: '+0.3%', color: 'text-emerald-500' },
    { icon: Clock6, value: '1.2s', label: 'Latency', trend: 'p95: 1.8s', color: 'text-amber-500' },
  ]

  return (
    <section id="demo" className="py-24 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT: CONTENT & CARDS */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">PERFORMANCE</p>
            <h2 className="text-5xl font-bold text-gray-900 tracking-tighter leading-tight mb-6">
              Monitor AI memory performance.
            </h2>
            <p className="text-gray-500 text-lg font-medium mb-12">
              Track accuracy, latency, and memory efficiency in real time.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {metrics.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <m.icon className={`w-5 h-5 ${m.color}`} />
                    <span className="text-[10px] font-bold text-emerald-500 px-2 py-0.5 bg-emerald-50 rounded-full">{m.trend}</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{m.value}</p>
                  <p className="text-xs text-gray-400 font-medium">{m.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT: ANALYTICS CHART */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-emerald-50/50 border border-emerald-100/50 rounded-[2.5rem] p-8 md:p-12 relative"
          >
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-emerald-900/5 border border-white">
              <div className="flex items-center justify-between mb-12">
                <h4 className="text-sm font-bold text-gray-900">Operation Analytics</h4>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-500 tracking-wider">LIVE UPDATES</span>
                </div>
              </div>

              {/* PROPER LINE CHART */}
              <div className="h-64 relative mt-4">
                {/* Y-Axis Labels */}
                <div className="absolute -left-6 top-0 bottom-8 flex flex-col justify-between text-[9px] font-black text-slate-300">
                  <span>100</span>
                  <span>50</span>
                  <span>0</span>
                </div>

                <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0, 1, 2].map((i) => (
                    <line 
                      key={i} 
                      x1="0" y1={i * 110 + 10} x2="600" y2={i * 110 + 10} 
                      stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" 
                    />
                  ))}

                  {/* Area Fill */}
                  <motion.path
                    d="M 0 200 C 100 180, 150 220, 250 140 C 350 60, 450 100, 600 40 V 240 H 0 Z"
                    fill="url(#chartGradient)"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                  />

                  {/* The Line */}
                  <motion.path
                    d="M 0 200 C 100 180, 150 220, 250 140 C 350 60, 450 100, 600 40"
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />

                  {/* Points */}
                  <motion.circle 
                    initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 1 }}
                    cx="250" cy="140" r="6" fill="#10b981" stroke="white" strokeWidth="2" 
                    className="shadow-lg shadow-emerald-500/50"
                  />
                  <motion.circle 
                    initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 1.5 }}
                    cx="600" cy="40" r="6" fill="#10b981" stroke="white" strokeWidth="2" 
                  />
                </svg>
                
                {/* X-Axis Labels */}
                <div className="absolute -bottom-2 left-0 right-0 flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
