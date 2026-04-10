import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = value / 60
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, value])
  return <span ref={ref}>{display}{suffix}</span>
}

export default function StatsStrip() {
  const stats = [
    { value: 4, suffix: '+', label: 'Intent Types' },
    { value: 100, suffix: '%', label: 'Local & Private' },
    { value: 3, suffix: 's', label: 'Avg Response' },
    { value: 2, suffix: '', label: 'Input Methods' },
  ]
  return (
    <motion.div
      className="py-28 px-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center mt-16">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <div className="text-4xl font-bold text-indigo-600 mb-1">
              <AnimatedNumber value={s.value} suffix={s.suffix} />
            </div>
            <div className="text-gray-500 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}