import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Upload, Send, Loader2, FileAudio, Zap } from 'lucide-react'

function Waveform({ active }) {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ background: active ? '#4f46e5' : '#d1d5db' }}
          animate={active ? {
            height: ['8px', `${16 + Math.sin(i * 0.8) * 20}px`, '8px'],
          } : { height: '4px' }}
          transition={{
            duration: 0.6 + Math.random() * 0.4,
            repeat: active ? Infinity : 0,
            delay: i * 0.04,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default function DashboardPreview({ onProcessAudio, onProcessText, loading }) {
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
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' })
        stream.getTracks().forEach(t => t.stop())
        onProcessAudio(blob, 'recording.wav')
      }
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000)
    } catch (err) { 
      console.error('Microphone access denied:', err) 
    }
  }, [onProcessAudio])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
    }
  }, [isRecording])

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const tabs = [
    { id: 'record', icon: Mic, label: 'Record' },
    { id: 'upload', icon: Upload, label: 'Upload' },
    { id: 'text', icon: Send, label: 'Text' },
  ]

  return (
    <section id="input" className="py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">// Input</p>
          <h2 className="text-4xl font-bold text-gray-900">Voice Input</h2>
        </motion.div>

        <motion.div
          className="bg-white rounded-3xl shadow-lg p-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="flex justify-center gap-3 mb-8">
            <div className="flex gap-2 p-1 rounded-2xl bg-gray-100">
              {tabs.map(({ id, icon: Icon, label }) => (
                <motion.button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold z-10 ${mode === id ? 'text-white' : 'text-gray-600'}`}
                  whileTap={{ scale: 0.97 }}
                >
                  {mode === id && (
                    <motion.div
                      layoutId="tab-bg"
                      className="absolute inset-0 rounded-xl bg-indigo-600"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'record' && (
              <motion.div
                key="record"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-6"
              >
                <Waveform active={isRecording} />

                <motion.button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading}
                  className="w-24 h-24 rounded-full flex items-center justify-center bg-indigo-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.93 }}
                >
                  {isRecording && [1, 2, 3].map((ring) => (
                    <motion.div
                      key={ring}
                      className="absolute inset-0 rounded-full border-2 border-red-400"
                      animate={{ scale: [1, 1.5 + ring * 0.3], opacity: [0.6, 0] }}
                      transition={{ duration: 1.5, delay: ring * 0.3, repeat: Infinity, ease: 'easeOut' }}
                    />
                  ))}
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-indigo-100">
                    {isRecording ? (
                      <MicOff className="w-10 h-10 text-red-500" />
                    ) : (
                      <Mic className="w-10 h-10 text-indigo-600" />
                    )}
                  </div>
                </motion.button>

                <AnimatePresence mode="wait">
                  {isRecording ? (
                    <motion.div key="rec" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-center">
                      <p className="text-red-500 font-bold text-2xl tabular-nums">{fmt(recordingTime)}</p>
                      <p className="text-gray-500 text-sm mt-1">Recording… click to stop</p>
                    </motion.div>
                  ) : loading ? (
                    <motion.div key="load" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      <p className="text-indigo-600 font-medium">Processing…</p>
                    </motion.div>
                  ) : (
                    <motion.p key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-gray-500 text-sm">
                      Click the microphone to start recording
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {mode === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-6"
              >
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="audio/*" 
                  className="hidden"
                  onChange={(e) => setUploadedFile(e.target.files?.[0])} 
                />
                <motion.div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
                >
                  <AnimatePresence mode="wait">
                    {uploadedFile ? (
                      <motion.div key="file" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3">
                        <FileAudio className="w-12 h-12 text-indigo-600" />
                        <p className="text-gray-700 font-semibold">{uploadedFile.name}</p>
                        <p className="text-gray-400 text-xs">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3">
                        <Upload className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">Drop audio file or click to browse</p>
                        <p className="text-gray-400 text-xs">.wav, .mp3, .m4a supported</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {uploadedFile && (
                  <motion.button
                    onClick={() => onProcessAudio(uploadedFile, uploadedFile.name)}
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-8 py-3 rounded-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Zap className="w-4 h-4" /> Run Pipeline
                  </motion.button>
                )}
              </motion.div>
            )}

            {mode === 'text' && (
              <motion.div
                key="text"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-5"
              >
                <motion.textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder='e.g. "Create a Python file with a retry decorator"'
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-700 resize-none text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  rows={4}
                />
                <motion.button
                  onClick={() => onProcessText(textInput)}
                  disabled={loading || !textInput.trim()}
                  className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-8 py-3 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                  whileHover={textInput.trim() ? { scale: 1.04 } : {}}
                  whileTap={{ scale: 0.97 }}
                >
                  <Zap className="w-4 h-4" /> Run Pipeline
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}