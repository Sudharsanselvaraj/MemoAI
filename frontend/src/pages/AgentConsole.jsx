import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  Send, 
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Activity,
  Brain,
  Clock,
  Shield,
  History,
  Terminal,
  Server,
  Zap
} from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../services/api'
import { toast } from 'react-hot-toast'

export default function AgentConsole() {
  const [activeTab, setActiveTab] = useState('voice')
  const [status, setStatus] = useState('IDLE')
  const [transcription, setTranscription] = useState("Click the microphone or type a command to begin.")
  const [intent, setIntent] = useState('')
  const [action, setAction] = useState('')
  const [result, setResult] = useState('')
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [needsApproval, setNeedsApproval] = useState(false)
  const [approvalMessage, setApprovalMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [sessionId] = useState(`session-${Math.random().toString(36).substring(7)}`)

  // Telemetry State
  const [metrics, setMetrics] = useState({
    tokens: { prompt: 0, completion: 0, total: 0 },
    latency: 0,
    tokens_per_second: 0,
    pipeline: { transcription: 'idle', intent: 'idle', tool: 'idle', response: 'idle' },
    memory: { count: 0, hits: 0, misses: 0 },
    system: { ollama: 'loading', model: 'loading', memory: 'loading', api: 'loading' },
    history: []
  })

  // Refs
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])
  const fileInputRef = useRef(null)

  // Polling for metrics
  useEffect(() => {
    const pollMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8000/metrics')
        if (response.ok) {
          const data = await response.json()
          if (data && typeof data === 'object') {
            setMetrics(prev => ({...prev, ...data}))
          }
        }
      } catch (err) {
        console.error("Metrics polling failed", err)
      }
    }

    const interval = setInterval(pollMetrics, 1000)
    return () => clearInterval(interval)
  }, [])
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setTranscription(`File selected: ${file.name}. Click 'Process File' to transcribe.`)
    }
  }

  const triggerFileUpload = () => {
    if (isProcessing) return
    fileInputRef.current?.click()
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return
    setStatus('UPLOADING')
    await handleAudioProcess(selectedFile)
    setSelectedFile(null)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
        await handleAudioProcess(audioBlob)
      }

      mediaRecorder.current.start()
      setIsRecording(true)
      setStatus('LISTENING')
      setTranscription('Listening to your voice...')
      setIntent('')
      setAction('')
      setResult('')
    } catch (err) {
      toast.error('Microphone access denied')
      console.error(err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
      setStatus('PROCESSING')
    }
  }

  const handleAudioProcess = async (blob) => {
    setIsProcessing(true)
    try {
      const data = await api.processAudio(blob, sessionId)
      handleBackendResponse(data)
    } catch (err) {
      handleError(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!textInput.trim()) return
    
    setIsProcessing(true)
    setTranscription(`Processing: "${textInput}"`)
    setIntent('')
    setAction('')
    setResult('')
    setStatus('PROCESSING')
    
    try {
      const data = await api.processText(textInput, sessionId)
      handleBackendResponse(data)
      setTextInput('')
    } catch (err) {
      handleError(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBackendResponse = (data) => {
    if (data.error) {
      setTranscription(`Error: ${data.error}`)
      setStatus('ERROR')
      return
    }

    setTranscription(data.transcription || "No transcription available")
    
    // Extract Intent
    const detectedIntent = data.intents?.[0] || 'general_query'
    setIntent(typeof detectedIntent === 'object' ? detectedIntent.name : detectedIntent)

    if (data.needs_approval) {
      setNeedsApproval(true)
      const msg = data.approval_message || "This action requires your confirmation."
      setApprovalMessage(msg)
      setAction(`Safety Check: ${msg}`)
      setStatus('AWAITING APPROVAL')
    } else {
      setNeedsApproval(false)
      const primaryResult = data.results?.[0]?.output || "Action completed successfully."
      setAction(data.results?.[0]?.tool || 'processing')
      setResult(primaryResult)
      setStatus('COMPLETED')
    }
  }

  const handleApprove = async () => {
    setIsProcessing(true)
    setStatus('EXECUTING')
    try {
      const data = await api.approveAction(sessionId)
      handleBackendResponse(data)
      toast.success('Action approved and executed')
    } catch (err) {
      handleError(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = () => {
    setNeedsApproval(false)
    setStatus('IDLE')
    setTranscription('Action rejected by user.')
    setIntent('cancelled')
    setAction('none')
    setResult('No action taken')
    toast.error('Action cancelled')
  }

  const handleError = (err) => {
    console.error(err)
    setStatus('ERROR')
    setTranscription('Backend connection failed. Please ensure the server is running on localhost:8000')
    toast.error('Backend connection failed')
  }

  const tabs = [
    { id: 'voice', label: 'Voice' },
    { id: 'upload', label: 'Upload' },
    { id: 'text', label: 'Text' },
  ]

  const metricsCards = [
    { 
      id: 'tokens',
      title: 'Token Usage', 
      icon: Zap, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50',
      data: [
        { label: 'Prompt', value: metrics?.tokens?.prompt || 0 },
        { label: 'Completion', value: metrics?.tokens?.completion || 0 },
        { label: 'Total', value: metrics?.tokens?.total || 0, bold: true }
      ]
    },
    { 
      id: 'performance',
      title: 'Performance', 
      icon: Activity, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50',
      data: [
        { label: 'Latency', value: `${metrics?.latency || 0}s` },
        { label: 'TPS', value: `${metrics?.tokens_per_second || 0}/s` },
        { label: 'Model', value: 'Llama 3' }
      ]
    },
    { 
      id: 'memory',
      title: 'Memory Usage', 
      icon: Brain, 
      color: 'text-purple-500', 
      bg: 'bg-purple-50',
      data: [
        { label: 'Stored', value: metrics?.memory?.count || 0 },
        { label: 'Hits', value: metrics?.memory?.hits || 0 },
        { label: 'Misses', value: metrics?.memory?.misses || 0 }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Main Interaction */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-slate-200/40 p-8 md:p-10"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                  <Sparkles size={20} />
                </div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Agent Console</h1>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <div className={`px-3 py-1 rounded-full border ${
                  status === 'ERROR' ? 'bg-rose-50 border-rose-100/50 text-rose-400' : 
                  status === 'IDLE' ? 'bg-slate-50 border-slate-100/50 text-slate-400' :
                  status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-100/50 text-emerald-500' :
                  'bg-orange-50 border-orange-100/50 text-orange-400'
                }`}>
                  <p className="text-[10px] font-black tracking-widest uppercase">STATUS: {status}</p>
                </div>
                {metrics?.last_updated && (
                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Last Sync: {metrics.last_updated}</p>
                )}
              </div>
            </div>

            {/* TAB SWITCHER */}
            <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl mb-12">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  disabled={isProcessing || isRecording}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 disabled:opacity-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* MAIN INTERACTION AREA */}
            <div className="flex flex-col items-center mb-10">
              {activeTab === 'voice' && (
                <>
                  <div className="relative mb-8">
                    <AnimatePresence>
                      {(isRecording || isProcessing) && (
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className={`absolute inset-0 rounded-full blur-2xl ${isRecording ? 'bg-rose-500' : 'bg-indigo-500'}`}
                        />
                      )}
                    </AnimatePresence>
                    <button 
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isProcessing}
                      className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center relative border border-white shadow-xl hover:scale-105 transition active:scale-95 disabled:opacity-50"
                    >
                      <div className={`w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transition-colors ${isRecording ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`}>
                         {isProcessing ? <Loader2 className="animate-spin" size={28} /> : <Mic size={28} />}
                      </div>
                    </button>
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {isRecording ? 'Recording...' : isProcessing ? 'Processing Audio...' : 'Click to start recording'}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">
                      {isRecording ? 'Click again to stop' : 'Speak your command clearly'}
                    </p>
                  </div>
                </>
              )}

              {activeTab === 'text' && (
                <form onSubmit={handleTextSubmit} className="w-full relative">
                  <input 
                     autoFocus
                     disabled={isProcessing}
                     value={textInput}
                     onChange={(e) => setTextInput(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300"
                     placeholder="e.g. Create a file named hello.py"
                  />
                  <button 
                    type="submit"
                    disabled={isProcessing || !textInput.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition disabled:opacity-30"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  </button>
                </form>
              )}

              {activeTab === 'upload' && (
                <div className="w-full flex flex-col items-center gap-6">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="audio/*"
                    className="hidden"
                  />
                  
                  <div 
                    onClick={triggerFileUpload}
                    className={`w-full h-40 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 bg-slate-50/50 transition-all cursor-pointer ${
                      selectedFile ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-100 hover:border-indigo-200'
                    }`}
                  >
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border transition-colors ${
                       selectedFile ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-white text-slate-300 border-slate-100'
                     }`}>
                        <Upload size={24} />
                     </div>
                     <div className="text-center">
                       <p className="text-sm font-bold text-slate-600">
                          {selectedFile ? selectedFile.name : 'Click to select audio file'}
                       </p>
                       <p className="text-xs text-slate-400 mt-1">.wav, .mp3, or .m4a supported</p>
                     </div>
                  </div>

                  <AnimatePresence>
                    {selectedFile && !isProcessing && (
                      <motion.button 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onClick={handleFileUpload}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
                      >
                        Process File
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* TRANSCRIPTION & OUTPUT BOX */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <Terminal size={14} className="text-slate-400" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pipeline Output</p>
              </div>
              
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Transcription</p>
                  <p className="text-slate-800 text-sm font-bold italic leading-relaxed">
                    {metrics?.transcription ? `"${metrics.transcription}"` : transcription}
                  </p>
                </div>

                {metrics?.intent && (
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detected Intent</p>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <p className="text-slate-800 text-xs font-black uppercase tracking-tight">{metrics.intent}</p>
                    </div>
                  </div>
                )}

                {metrics?.action && (
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Executed</p>
                    <p className="text-slate-600 text-xs font-bold leading-relaxed">{metrics.action}</p>
                  </div>
                )}

                {metrics?.result && (
                  <div className="flex flex-col gap-2 mt-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Generated Response</p>
                     <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-md shadow-slate-100/50">
                       <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                         {metrics.result}
                       </p>
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* APPROVAL PANEL */}
            <AnimatePresence>
              {needsApproval && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-orange-50 border border-orange-100/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-400 shadow-sm">
                        <AlertCircle size={20} />
                      </div>
                      <p className="text-xs md:text-sm font-bold text-orange-900 max-w-xs leading-relaxed">
                        {approvalMessage}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button 
                        disabled={isProcessing}
                        onClick={handleApprove}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Approve
                      </button>
                      <button 
                        disabled={isProcessing}
                        onClick={handleReject}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-500 px-6 py-3 rounded-xl font-bold text-sm hover:bg-rose-50 transition disabled:opacity-50"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* TELEMETRY GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {metricsCards.map((card) => (
               <motion.div 
                 key={card.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-slate-200/20 p-6"
               >
                 <div className="flex items-center gap-2 mb-6">
                   <div className={`w-8 h-8 ${card.bg} ${card.color} rounded-lg flex items-center justify-center`}>
                     <card.icon size={16} />
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
                 </div>
                 <div className="flex flex-col gap-3">
                   {card.data.map((item, idx) => (
                     <div key={idx} className="flex items-center justify-between">
                       <span className="text-[11px] font-bold text-slate-400">{item.label}</span>
                       <span className={`text-[13px] ${item.bold ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                         {item.value}
                       </span>
                     </div>
                   ))}
                 </div>
               </motion.div>
             ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Pipeline & History */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* PIPELINE TIMELINE */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/20 p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                <Shield size={16} />
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Pipeline Timeline</h2>
            </div>
            
            <div className="flex flex-col gap-4">
              {[
                { id: 'transcription', label: 'Speech-to-Text' },
                { id: 'intent', label: 'Intent Detection' },
                { id: 'tool', label: 'Tool Execution' },
                { id: 'response', label: 'Response Generation' }
              ].map((step, idx) => (
                <div key={step.id} className="flex items-center gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      metrics?.pipeline?.[step.id] === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                      metrics?.pipeline?.[step.id] === 'running' ? 'bg-indigo-500 border-indigo-500 text-white animate-pulse shadow-lg shadow-indigo-500/20' :
                      'bg-slate-50 border-slate-100 text-slate-300'
                    }`}>
                      {metrics?.pipeline?.[step.id] === 'completed' ? <CheckCircle2 size={12} /> : <div className="text-[8px] font-black">{idx + 1}</div>}
                    </div>
                    {idx < 3 && <div className="w-[1px] h-8 bg-slate-100 mt-1" />}
                  </div>
                  <div className="pb-8">
                    <p className={`text-[11px] font-black uppercase tracking-widest mb-0.5 ${
                      metrics?.pipeline?.[step.id] === 'completed' ? 'text-slate-900' : 
                      metrics?.pipeline?.[step.id] === 'running' ? 'text-indigo-500' : 'text-slate-300'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 capitalize">
                      {metrics?.pipeline?.[step.id]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* SYSTEM STATUS */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/20 p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                <Server size={16} />
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">System Health</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'ollama', label: 'Ollama', status: metrics?.system?.ollama },
                { id: 'model', label: 'Model', status: metrics?.system?.model },
                { id: 'memory', label: 'Memory', status: metrics?.system?.memory },
                { id: 'api', label: 'API Health', status: metrics?.system?.api }
              ].map((sys) => (
                <div key={sys.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      sys.status === 'running' || sys.status === 'healthy' || sys.status === 'loaded' || sys.status === 'connected' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' :
                      sys.status === 'error' ? 'bg-rose-500' : 'bg-orange-400 animate-pulse'
                    }`} />
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{sys.label}</p>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sys.status}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* REQUEST HISTORY */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-200/20 p-8 flex-1 overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                <History size={16} />
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Request History</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex flex-col gap-3">
                {(!metrics?.history || metrics.history.length === 0) ? (
                  <p className="text-[11px] font-bold text-slate-300 text-center py-10 italic">No recent requests</p>
                ) : metrics.history.map((req, idx) => (
                  <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-slate-900 truncate pr-4">"{req.command}"</p>
                      <p className="text-[9px] font-bold text-slate-300 flex-shrink-0">{req.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className={`w-1 h-1 rounded-full ${req.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{req.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
