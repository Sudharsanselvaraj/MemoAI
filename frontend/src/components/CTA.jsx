import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function CTA() {
  return (
    <section className="py-24 px-6">
      <motion.div
        className="max-w-3xl mx-auto text-center rounded-3xl p-12"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to get started?
        </h2>
        <p className="text-indigo-100 mb-8 max-w-lg mx-auto">
          Start controlling your AI agent with voice commands. All processing happens locally on your machine.
        </p>
        <motion.button
          onClick={() => scrollTo('input')}
          className="inline-flex items-center gap-2 text-indigo-600 font-semibold px-8 py-4 rounded-full bg-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Try Now <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </section>
  )
}