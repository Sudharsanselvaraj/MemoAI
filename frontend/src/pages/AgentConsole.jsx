import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  Send, 
  Upload,
  FileAudio,
  FileText,
  FileCode,
  Sparkles,
  Command
} from 'lucide-react'
import api from '../services/api'
import { toast } from 'react-hot-toast'

export default function AgentConsole() {
  const [activeMode, setActiveMode] = useState('voice') // 'voice' | 'upload' | 'text'
  const [status, setStatus] = useState("Idle")
  const [command, setCommand] = useState("")
  const [lastResponse, setLastResponse] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleVoiceTrigger = async () => {
    try {
      setStatus("Listening")
      toast.success("Listening for voice input...")
      const res = await api.post("/listen")
      toast.success(`Heard: "${res.data.text}"`)
      setLastResponse({ user: res.data.text, ai: "Processing your request..." })
      await handleExecute(res.data.text)
    } catch (err) {
      setStatus("Error")
      toast.error("Voice capture failed")
    }
  }

  const handleExecute = async (cmdText) => {
    const cmd = cmdText || command.trim()
    if (!cmd) return

    setCommand("")
    
    try {
      const res = await api.post("/execute", { command: cmd })
      setLastResponse({ user: cmd, ai: res.data.response || "Command executed successfully. Memory updated." })
      toast.success("Command executed successfully")
      setStatus("Completed")
    } catch (err) {
      setLastResponse({ user: cmd, ai: "Error: Execution failed. Please check your system connection." })
      toast.error("Execution failed")
      setStatus("Error")
    }
  }

  const handleFileUpload = (e) => {
    e.preventDefault()
    setIsDragging(false)
    toast.success("File upload detected (Simulated)")
    setLastResponse({ user: "Uploaded local document", ai: "Document parsed. Memories updated with relevant context." })
  }

  const styles = {
    container: { 
      background: '#F8FAFC', 
      minHeight: '100vh', 
      padding: '120px 24px 80px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center' 
    },
    heroCard: { 
      background: 'white', 
      borderRadius: 24, 
      border: '1px solid #E5E7EB', 
      padding: 32, 
      width: '100%', 
      maxWidth: 700, 
      boxShadow: '0 10px 40px rgba(0,0,0,0.03)', 
      position: 'relative' 
    },
    modeSwitcher: { 
      display: 'flex', 
      gap: 8, 
      background: '#F1F5F9', 
      padding: 6, 
      borderRadius: 14, 
      marginBottom: 32 
    },
    modeBtn: (active) => ({ 
      flex: 1, 
      padding: '10px 16px', 
      borderRadius: 10, 
      fontSize: 13, 
      fontWeight: 600, 
      border: 'none', 
      cursor: 'pointer', 
      background: active ? 'white' : 'transparent', 
      color: active ? '#111' : '#64748B', 
      transition: 'all 0.2s', 
      boxShadow: active ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' 
    }),
    micBtn: (isActive) => ({ 
      width: 112, 
      height: 112, 
      borderRadius: '50%', 
      background: isActive ? '#EFF6FF' : '#F3F4F6', 
      border: isActive ? '2px solid #3B82F6' : '1px solid transparent', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      transition: 'all 0.3s', 
      cursor: 'pointer' 
    }),
    dropZone: (dragging) => ({ 
      border: '2px dashed #E5E7EB', 
      borderRadius: 20, 
      padding: 48, 
      background: dragging ? '#F0F9FF' : '#FAFAFA', 
      borderColor: dragging ? '#3B82F6' : '#E5E7EB', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 16, 
      transition: 'all 0.2s', 
      cursor: 'pointer' 
    }),
    responseCard: { 
      background: 'white', 
      borderRadius: 24, 
      border: '1px solid #E2E8F0', 
      padding: 24, 
      width: '100%', 
      maxWidth: 700, 
      marginTop: 24, 
      boxShadow: '0 4px 12px rgba(0,0,0,0.02)' 
    }
  }

  return (
    <div style={styles.container}>
      
      {/* Hero Interaction Section */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={styles.heroCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={20} color="#3B82F6" />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>Voice Input</h2>
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 999, background: '#F1F5F9', color: '#64748B' }}>
            STATUS: {status.toUpperCase()}
          </div>
        </div>

        {/* Mode Switcher */}
        <div style={styles.modeSwitcher}>
          {['voice', 'upload', 'text'].map(mode => (
            <button key={mode} onClick={() => setActiveMode(mode)} style={styles.modeBtn(activeMode === mode)}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Dynamic Mode Areas */}
        <AnimatePresence mode="wait">
          {activeMode === 'voice' && (
            <motion.div key="voice" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              <button onClick={handleVoiceTrigger} style={styles.micBtn(status === 'Listening')}>
                <motion.div animate={status === 'Listening' ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 48, height: 48, borderRadius: '50%', background: status === 'Listening' ? '#3B82F6' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: status === 'Listening' ? 'white' : '#3B82F6', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <Mic size={24} />
                </motion.div>
              </button>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#1E293B', margin: 0 }}>Click the microphone to start recording</p>
                <p style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>Mem0AI will listen and execute automatically</p>
              </div>
            </motion.div>
          )}

          {activeMode === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleFileUpload} style={styles.dropZone(isDragging)}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                <Upload size={24} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#1E293B', margin: 0 }}>Drag and drop file here</p>
                <p style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>or <span style={{ color: '#3B82F6', textDecoration: 'underline' }}>Click to upload</span></p>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <FileAudio size={16} color="#94A3B8" />
                <FileText size={16} color="#94A3B8" />
                <FileCode size={16} color="#94A3B8" />
              </div>
            </motion.div>
          )}

          {activeMode === 'text' && (
            <motion.div key="text" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} style={{ position: 'relative' }}>
              <input value={command} onChange={(e) => setCommand(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleExecute()} placeholder="Type your command here..." style={{ width: '100%', padding: '16px 52px 16px 20px', borderRadius: 16, border: '1px solid #E2E8F0', fontSize: 14, outline: 'none', background: '#FAFAFA' }} />
              <button onClick={() => handleExecute()} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', padding: '8px 16px', background: '#000', color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Command size={14} /> Send
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Response Panel */}
      <AnimatePresence>
        {lastResponse && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={styles.responseCard}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>U</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, color: '#1E293B', margin: 0, fontWeight: 500 }}>"{lastResponse.user}"</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, background: '#F8FAFC', padding: 16, borderRadius: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Sparkles size={16} /></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, color: '#334155', margin: 0, lineHeight: 1.6 }}>{lastResponse.ai}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
