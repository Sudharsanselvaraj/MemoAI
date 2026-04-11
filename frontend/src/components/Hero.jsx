import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import DashboardPreview from "./DashboardPreview";

export default function Hero() {
  return (
    <section className="relative pt-44 pb-32 overflow-hidden bg-transparent">
      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[1440px] mx-auto flex flex-col items-center gap-10 text-center relative z-10"
      >
        {/* Title */}
        <h1 className="relative z-10 text-6xl md:text-[88px] font-black tracking-[-0.03em] leading-[1.05] text-slate-900 max-w-4xl mx-auto px-6">
          Memory-Powered Local AI Agent
        </h1>

        {/* Tagline & Subtitle */}
        <div className="flex flex-col items-center gap-6 max-w-3xl px-6">
          <p className="text-xl md:text-2xl font-bold text-slate-700 tracking-tight">
            Remember. Understand. Execute.
          </p>
          <p className="text-[17px] text-slate-500 max-w-2xl leading-relaxed font-medium">
            A local-first AI system that remembers context, understands intent, and executes actions intelligently.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-8 mt-2 mb-12">
          <Link
            to="/agent"
            className="bg-[#1a1a1a] text-white px-10 py-4 rounded-full text-[15px] font-black hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1 transition-all"
          >
            Try MemoAI free
          </Link>
          <Link
            to="/architecture"
            className="text-slate-500 hover:text-slate-900 text-[15px] font-bold transition-colors"
          >
            View Architecture
          </Link>
        </div>

        {/* Console Preview */}
        <DashboardPreview />
      </motion.div>
    </section>
  );
}