import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Upload, Send, Loader2, FileAudio, Zap, FileText, Brain, Terminal, CheckCircle, History, Clock, ChevronRight, Sparkles } from 'lucide-react'

const API_BASE = 'http://localhost:8000'

// Floating Header
function Header() {
  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
      <div className="flex items-center justify-between px-8 py-3 w-full max-w-5xl rounded-full bg-white/80 backdrop-blur-lg shadow-lg border border-gray-100/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <span className="text-white text-sm">⚡</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">Voice AI Agent</span>
        </div>
        <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-500">
          <a href="#" className="hover:text-indigo-600 transition">Home</a>
          <a href="#input" className="hover:text-indigo-600 transition">Input</a>
          <a href="#output" className="hover:text-indigo-600 transition">Output</a>
        </nav>
        <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">Try Now</button>
      </div>
    </header>
  )
}

// Hero Section
function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-24">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-indigo-500 text-sm font-semibold">Voice AI Agent</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
          <span className="text-gradient">Voice-Controlled</span>
          <br />
          <span>Local AI Agent</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-gray-500 mb-10">
          Speak commands. Understand intent. Execute tasks locally.<br/>
          <span className="text-gray-400">All file operations sandboxed for safety.</span>
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white shadow-lg border border-gray-100">
            <Mic className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-semibold text-gray-700">Voice Input</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white shadow-lg border border-gray-100">
            <Brain className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-semibold text-gray-700">Intent Detection</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white shadow-lg border border-gray-100">
            <Zap className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-semibold text-gray-700">Auto Execute</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Audio Input Component
function AudioInput({ onProcessAudio, onProcessText, loading }) {
  const [mode, setMode] = useState('record')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [textInput, setTextInput] = useState('')

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const fileInputRef = useRef(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' })
        stream.getTracks().forEach(t => t.stop())
        onProcessAudio(blob, 'recording.wav')
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      alert('Microphone access denied.')
    }
  }, [onProcessAudio])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
    }
  }, [isRecording])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <section id="input" className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">// Input</p>
          <h2 className="text-3xl font-bold text-gray-900">Voice Input</h2>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Tabs */}
          <div className="flex justify-center gap-3 mb-8">
            <button onClick={() => setMode('record')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition ${mode === 'record' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <Mic className="w-4 h-4" /> Record
            </button>
            <button onClick={() => setMode('upload')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition ${mode === 'upload' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <Upload className="w-4 h-4" /> Upload
            </button>
            <button onClick={() => setMode('text')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition ${mode === 'text' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <Send className="w-4 h-4" /> Text
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'record' && (
              <motion.div key="record" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col items-center gap-6">
                <button onClick={isRecording ? stopRecording : startRecording} disabled={loading} className={`w-28 h-28 rounded-full flex items-center justify-center transition ${isRecording ? 'bg-red-500 border-4 border-red-200' : 'bg-indigo-50 border-4 border-indigo-200'}`}>
                  {isRecording ? <MicOff className="w-12 h-12 text-red-500" /> : <Mic className="w-12 h-12 text-indigo-500" />}
                </button>
                <div className="text-center">
                  {isRecording ? (
                    <>
                      <p className="text-red-500 font-bold text-xl">{formatTime(recordingTime)}</p>
                      <p className="text-gray-400 text-sm">Recording... Click to stop</p>
                    </>
                  ) : loading ? (
                    <div className="flex items-center gap-2"><Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /><p className="text-indigo-600">Processing...</p></div>
                  ) : (
                    <p className="text-gray-400">Click to start recording</p>
                  )}
                </div>
              </motion.div>
            )}

            {mode === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col items-center gap-6">
                <input ref={fileInputRef} type="file" accept="audio/*" onChange={(e) => setUploadedFile(e.target.files?.[0])} className="hidden" />
                <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-4 cursor-pointer">
                  {uploadedFile ? (<><FileAudio className="w-10 h-10 text-indigo-500" /><p className="text-gray-700 font-semibold">{uploadedFile.name}</p></>) : (<><Upload className="w-10 h-10 text-gray-400" /><p className="text-gray-500">Drop audio file or click to browse</p></>)}
                </div>
                {uploadedFile && <button onClick={() => onProcessAudio(uploadedFile, uploadedFile.name)} disabled={loading} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-2xl font-semibold"><Zap className="w-4 h-4 inline mr-2" />Run Pipeline</button>}
              </motion.div>
            )}

            {mode === 'text' && (
              <motion.div key="text" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col items-center gap-6">
                <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder='e.g. "Create a Python file with a retry decorator"' className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-700 resize-none" rows={4} />
                <button onClick={() => onProcessText(textInput)} disabled={loading || !textInput.trim()} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-2xl font-semibold"><Zap className="w-4 h-4 inline mr-2" />Run Pipeline</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

// Pipeline Results
function PipelineResults({ results, loading }) {
  if (!results && !loading) return null

  const cards = [
    { title: 'Transcribed Text', step: '01', icon: FileText, color: '#4f46e5', content: results?.transcription || '—' },
    { title: 'Detected Intent', step: '02', icon: Brain, color: '#6366f1', content: results?.intents?.join(', ') || '—' },
    { title: 'Action Taken', step: '03', icon: Zap, color: '#7c3aed', content: results?.results?.map(r => r.action || r.message).join(', ') || '—' },
    { title: 'Final Output', step: '04', icon: Terminal, color: '#10b981', content: results?.results?.[0]?.message || '—' },
  ]

  return (
    <section id="output" className="py-24 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">// Pipeline Output</p>
          <h2 className="text-3xl font-bold text-gray-900">Results</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {cards.map((card, i) => (
            <motion.div key={card.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{card.title}</p>
                  <p className="text-xs text-gray-400">Step {card.step}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{loading && !results ? <Loader2 className="w-4 h-4 inline animate-spin" /> : card.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Main App
function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])

  const processAudio = useCallback(async (audioBlob, fileName) => {
    setLoading(true)
    setError(null)
    setResults(null)

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
      setHistory(prev => [...prev, { id: Date.now(), text: data.transcription, intents: data.intents, timestamp: new Date().toLocaleTimeString() }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const processText = useCallback(async (text) => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const res = await fetch(`${API_BASE}/api/process_text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, session_id: 'default' })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.detail || 'Server error')
      if (data.error) throw new Error(data.error)

      setResults(data)
      setHistory(prev => [...prev, { id: Date.now(), text: data.transcription, intents: data.intents, timestamp: new Date().toLocaleTimeString() }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <AudioInput onProcessAudio={processAudio} onProcessText={processText} loading={loading} />
      <PipelineResults results={results} loading={loading} />
      
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-2xl shadow-xl">
          {error}
        </div>
      )}

      {history.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <History className="w-5 h-5 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-900">Command History</h3>
              <span className="text-gray-400 text-sm">({history.length} commands)</span>
            </div>
            <div className="space-y-2">
              {[...history].reverse().map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
                  <span className="text-lg">{item.intents?.[0] === 'create_file' ? '📄' : item.intents?.[0] === 'write_code' ? '💻' : item.intents?.[0] === 'summarize' ? '📝' : '💬'}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 truncate">{item.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="py-12 text-center text-gray-400 text-sm">
        Voice AI Agent • Local-First Pipeline
      </footer>
    </div>
  )
}

export default App