import { motion } from 'framer-motion'
import { Home, Users, Briefcase, Clock, Settings, Search, Play, Plus, Zap, Brain, Sparkles } from 'lucide-react'

export default function DashboardPreview() {
  const stats = [
    { label: 'Memories Stored', value: '1,284', trend: '+12.8%', color: 'text-green-500' },
    { label: 'Active Sessions', value: '55', trend: '-4.8%', color: 'text-red-400' },
    { label: 'Accuracy', value: '98%', trend: '+10.4%', color: 'text-green-500' },
    { label: 'Latency', value: '1.2s', trend: '-1.2%', color: 'text-gray-400' },
  ]

  const menuItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Users, label: 'Clients' },
    { icon: Briefcase, label: 'Projects' },
    { icon: Clock, label: 'Time tracking' },
    { icon: Settings, label: 'Tools' },
  ]

  return (
    <div className="max-w-6xl mx-auto relative px-6 w-full">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl shadow-indigo-100/20 border border-white/80 overflow-hidden flex min-h-[600px]"
      >
          {/* SIDEBAR */}
          <div className="w-56 border-r border-gray-50 p-6 flex flex-col gap-8">
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-full overflow-hidden bg-white/20 shadow-sm border border-gray-100">
                <img src="/media/logo.png" alt="" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-gray-900">Mem0AI</span>
            </div>
            
            <nav className="flex flex-col gap-1">
              {menuItems.map((item) => (
                <div 
                  key={item.label}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${item.active ? 'bg-slate-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <item.icon size={18} />
                  {item.label}
                </div>
              ))}
            </nav>

            <div className="mt-auto">
                <div className="bg-indigo-50 rounded-2xl p-4 flex flex-col gap-3">
                    <p className="text-xs font-bold text-indigo-600 tracking-tight">UPGRADE PRO</p>
                    <p className="text-[10px] text-indigo-400 leading-relaxed">Get unlimited memory slots and custom agents.</p>
                </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 flex flex-col">
            {/* HEADER */}
            <div className="p-8 pb-0 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Mem0AI Memory Console</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                  <input readOnly placeholder="Search anything..." className="bg-slate-50 border-none rounded-full py-2 pl-9 pr-4 text-xs w-48 focus:outline-none" />
                </div>
                <div className="flex items-center gap-2 bg-slate-50 rounded-full px-3 py-1.5 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-500">0:00:00</span>
                  <Play size={10} className="text-gray-400 fill-gray-400" />
                </div>
              </div>
            </div>

            {/* STATS GRID */}
            <div className="p-8 grid grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-50 rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${stat.color} bg-opacity-10`}>{stat.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CHART AREA */}
            <div className="flex-1 px-8 pb-8 flex flex-col gap-6">
              <div className="bg-white border border-gray-50 rounded-2xl p-6 flex flex-col flex-1 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <p className="text-sm font-bold text-gray-900">Earnings over time</p>
                  <div className="flex gap-2">
                    <div className="w-8 h-1.5 bg-indigo-500 rounded-full" />
                    <div className="w-2 h-1.5 bg-slate-100 rounded-full" />
                  </div>
                </div>
                
                {/* SIMULATED CHART */}
                <div className="flex-1 flex items-end gap-3 px-2">
                  {[40, 70, 45, 90, 65, 80, 55, 95, 75, 40, 60].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 1 }}
                      className="flex-1 bg-indigo-100 rounded-t-lg relative group"
                    >
                      <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* BOTTOM ACTIONS */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white border border-gray-50 rounded-2xl p-4 flex items-center gap-4 shadow-sm group cursor-pointer hover:border-indigo-100 transition-colors">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Send size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Send an invoice</p>
                    <p className="text-[10px] text-gray-400">Quick bill your clients</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-50 rounded-2xl p-4 flex items-center gap-4 shadow-sm group cursor-pointer hover:border-indigo-100 transition-colors">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Plus size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Draft a proposal</p>
                    <p className="text-[10px] text-gray-400">Win new engineering deals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
  )
}

function Send({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
    </svg>
  )
}