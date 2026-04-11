import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Navbar() {
  const navLinks = [
    { label: "Features", href: "/features" },
    { label: "Pipeline", href: "/pipeline" },
    { label: "Demo", href: "/demo" },
    { label: "Docs", href: "/docs" },
    { label: "AI Console", href: "/agent" },
  ]

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
    >
      <div className="flex items-center w-full max-w-6xl px-10 py-5 bg-white/40 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.12)] rounded-full border border-white/50">
        
        {/* Left: Logo */}
        <div className="flex-1 flex items-center">
          <Link to="/features" className="flex items-center gap-2 group">
            <div className="w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-105 rounded-full overflow-hidden bg-white/20 shadow-sm border border-gray-100">
              <img src="/media/logo.png" alt="MemoAI Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-black tracking-tighter text-slate-900 italic">MemoAI</span>
          </Link>
        </div>

        {/* Center: Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.label}
              to={link.href} 
              className="text-[13px] font-bold text-slate-600 hover:text-black transition-colors tracking-tight"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: CTA */}
        <div className="flex-1 flex justify-end">
          <Link
            to="/agent"
            className="bg-black text-white px-6 py-2.5 rounded-full text-[13px] font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10"
          >
            Try MemoAI free
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}