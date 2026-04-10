import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Brain, Zap, CheckCircle, History, Clock } from 'lucide-react'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FeatureSection from './components/FeatureSection'
import StatsStrip from './components/StatsStrip'
import DashboardPreview from './components/DashboardPreview'

const API_BASE = 'http://localhost:8000'

function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[
        { x: '10%', y: '20%', size: 400, delay: 0, color: 'rgba(99,102,241,0.06)' },
        { x: '80%', y: '60%', size: 500, delay: 2, color: 'rgba(139,92,246,0.05)' },
        { x: '50%', y: '80%', size: 350, delay: 4, color: 'rgba(79,70,229,0.04)' },
      ].map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: orb.x, top: orb.y,
            width: orb.size, height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8 + i * 2, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function PipelineResults({ results, loading }) {
  if (!results && !loading) return null

  const cards = [
    { title: 'Transcribed Text', step: '01', icon: FileText, color: '#4f46e5', content: results?.transcription || '—' },
    { title: 'Detected Intent', step: '02', icon: Brain, color: '#7c3aed', content: results?.intents?.join(', ') || '—' },
    { title: 'Action Taken', step: '03', icon: Zap, color: '#6366f1', content: results?.results?.map(r => r.action || r.message).join(', ') || '—' },
    { title: 'Final Output', step: '04', icon: CheckCircle, color: '#10b981', content: results?.results?.[0]?.message || '—' },
  ]

  return (
    <section id="output" className="py-28 px-6" style={{ background: 'rgba(249,250,251,0.8)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">// Pipeline Output</p>
          <h2 className="text-4xl font-bold text-gray-900">Results</h2>
        </motion.div>

        <div className="hidden md:flex justify-center items-center gap-0 mb-8">
          {cards.map((card, i) => (
            <div key={card.step} className="flex items-center">
              <motion.div
                className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white"
                style={{ background: card.color }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.15, type: 'spring', stiffness: 400 }}
              >
                {card.step}
              </motion.div>
              {i < cards.length - 1 && (
                <motion.div
                  className="h-0.5 w-16"
                  style={{ background: `linear-gradient(to right, ${card.color}, ${cards[i + 1].color})` }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: i * 0.15 + 0.3, duration: 0.4 }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              className="bg-white rounded-2xl p-6 border border-gray-100 relative overflow-hidden"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, boxShadow: `0 16px 40px ${card.color}15` }}
            >
              <motion.div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: card.color }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
              />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{card.title}</p>
                  <p className="text-xs text-gray-400">Step {card.step}</p>
                </div>
              </div>
              <div className="min-h-[40px]">
                {loading && !results ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <div className="h-3 bg-gray-100 rounded-full flex-1 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: card.color }}
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                ) : (
                  <motion.p
                    className="text-sm text-gray-600 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {card.content}
                  </motion.p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CommandHistory({ history }) {
  if (!history.length) return null
  const intentEmoji = (i) => ({ create_file: '📄', write_code: '💻', summarize: '📝' }[i] || '💬')

  return (
    <section className="py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <History className="w-5 h-5 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-900">Command History</h3>
          <motion.span
            className="text-xs font-semibold text-indigo-500 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(99,102,241,0.1)' }}
            key={history.length}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
          >
            {history.length}
          </motion.span>
        </motion.div>

        <div className="space-y-2">
          <AnimatePresence>
            {[...history].reverse().map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}
                whileHover={{ background: 'rgba(99,102,241,0.04)', borderColor: 'rgba(99,102,241,0.1)' }}
              >
                <span className="text-lg">{intentEmoji(item.intents?.[0])}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{item.text}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{item.timestamp}</span>
                    {item.intents?.map(intent => (
                      <span key={intent} className="text-xs font-medium text-indigo-500 px-1.5 py-0.5 rounded-md"
                        style={{ background: 'rgba(99,102,241,0.08)' }}>
                        {intent}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <motion.footer
      className="py-12 text-center text-gray-400 text-sm border-t border-gray-100"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      Voice AI Agent &bull; Local-First Pipeline &bull; Built with ❤️
    </motion.footer>
  )
}

export default function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])

  const processAudio = useCallback(async (audioBlob, fileName) => {
    setLoading(true); setError(null); setResults(null)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, fileName || 'recording.wav')
      formData.append('provider', 'groq')
      formData.append('session_id', 'default')
      const res = await fetch(`${API_BASE}/api/process_audio`, { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Server error')
      if (data.error) throw new Error(data.error)
      setResults(data)
      setHistory(p => [...p, { id: Date.now(), text: data.transcription, intents: data.intents, timestamp: new Date().toLocaleTimeString() }])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  const processText = useCallback(async (text) => {
    setLoading(true); setError(null); setResults(null)
    try {
      const res = await fetch(`${API_BASE}/api/process_text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, session_id: 'default' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Server error')
      if (data.error) throw new Error(data.error)
      setResults(data)
      setHistory(p => [...p, { id: Date.now(), text: data.transcription, intents: data.intents, timestamp: new Date().toLocaleTimeString() }])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  return (
    <div className="min-h-screen bg-white relative">
      <FloatingOrbs />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <FeatureSection />
        <StatsStrip />
        <DashboardPreview onProcessAudio={processAudio} onProcessText={processText} loading={loading} />
        <PipelineResults results={results} loading={loading} />
        <CommandHistory history={history} />
        <Footer />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-2xl text-sm font-medium"
            style={{ boxShadow: '0 8px 32px rgba(239,68,68,0.3)' }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}