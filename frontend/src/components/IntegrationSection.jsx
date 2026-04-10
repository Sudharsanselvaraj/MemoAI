import { motion } from 'framer-motion'

const integrations = [
  { name: 'Ollama', desc: 'Local LLM inference' },
  { name: 'Groq', desc: 'Speech-to-text API' },
  { name: 'FastAPI', desc: 'High-performance backend' },
  { name: 'React', desc: 'Modern UI framework' },
]

export default function IntegrationSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Integrations</h2>
          <p className="text-gray-500">Built with modern technologies</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {integrations.map((item, i) => (
            <motion.div
              key={item.name}
              className="bg-white rounded-2xl p-6 border border-gray-100 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <h3 className="font-bold text-gray-900">{item.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}