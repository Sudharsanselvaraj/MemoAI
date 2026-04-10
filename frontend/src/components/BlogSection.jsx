import { motion } from 'framer-motion'

export default function BlogSection() {
  return (
    <section className="py-24 px-6" style={{ background: 'rgba(249,250,251,0.8)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Blog</h2>
          <p className="text-gray-500">Coming soon</p>
        </motion.div>
      </div>
    </section>
  )
}