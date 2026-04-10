import { motion } from 'framer-motion'

export default function TrustedLogos() {
  const logos = ['Ollama', 'Groq', 'FastAPI', 'React', 'Tailwind']

  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.p
          className="text-center text-sm text-gray-400 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Trusted by developers worldwide
        </motion.p>
        <div className="flex flex-wrap justify-center items-center gap-12">
          {logos.map((logo, i) => (
            <motion.div
              key={logo}
              className="text-xl font-bold text-gray-300"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}