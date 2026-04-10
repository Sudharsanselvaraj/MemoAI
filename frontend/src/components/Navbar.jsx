import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="
        fixed
        top-6
        left-0
        right-0
        z-50
        flex
        justify-center
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          w-full
          max-w-7xl
          px-8
          h-20
          bg-white/80
          backdrop-blur-xl
          shadow-lg
          rounded-full
        "
      >
        {/* Logo */}
        <h1 className="text-xl font-semibold">VoiceAI</h1>

        {/* Links */}
        <div className="hidden md:flex items-center gap-10 text-gray-700">
          <a href="#features">Features</a>
          <a href="#benefits">Benefits</a>
          <a href="#pricing">Pricing</a>
          <a href="#blog">Blog</a>
          <a href="#contact">Contact</a>
        </div>

        {/* CTA */}
        <button
          className="
            bg-black
            text-white
            px-6
            py-3
            rounded-full
            font-medium
            hover:scale-105
            transition
          "
        >
          Try Free →
        </button>
      </div>
    </motion.nav>
  );
}