import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <motion.footer
      className="py-12 text-center text-gray-400 text-sm border-t border-gray-100"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      Voice AI Agent &bull; Local-First Pipeline &bull; Built with ❤️
    </motion.footer>
  )
}