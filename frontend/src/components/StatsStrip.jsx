import { motion } from 'framer-motion'

export default function StatsStrip() {
  const techs = [
    "Whisper", "Mem0", "FastAPI", "React", "Docker", 
    "Python", "LangChain", "Groq", "SQLite"
  ]
  
  return (
    <section className="py-20 bg-white overflow-hidden border-y border-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-12">
          BUILT WITH PROFESSIONAL-GRADE AI INFRASTRUCTURE
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-40 grayscale transition-all hover:grayscale-0 hover:opacity-100">
          {techs.map((tech, i) => (
            <motion.div
              key={tech}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-2xl md:text-3xl font-bold tracking-tighter text-gray-600"
            >
              {tech}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}