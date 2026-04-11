import { motion } from 'framer-motion'
import { Linkedin, Twitter as X } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    pages: [
      { name: 'Home', href: '/features' },
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '#' },
      { name: 'Blog', href: '#' },
    ],
    information: [
      { name: 'Contact', href: '#' },
      { name: 'Privacy', href: '#' },
      { name: 'Terms of use', href: '#' },
      { name: '404', href: '#' },
    ]
  }

  return (
    <footer className="w-full px-6 pb-12 pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/50 p-12 py-20 md:py-32"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-24 mb-16">
          {/* LEFT: Branding & Socials */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6 text-left">
              <div className="w-8 h-8 flex items-center justify-center rounded-full overflow-hidden border border-slate-200">
                <img src="/media/logo.png" alt="MemoAI Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter italic">MemoAI</span>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed max-w-xs mb-8">
              Your favorite local AI infrastructure. Built for early startup founders and privacy-conscious teams.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition shadow-lg shadow-black/10">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition shadow-lg shadow-black/10">
                <X size={18} />
              </a>
            </div>
          </div>

          {/* RIGHT: Navigation Links */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-2 gap-8 lg:justify-end lg:text-right">
             <div>
                <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-6">Pages</p>
                <ul className="flex flex-col gap-4">
                   {footerLinks.pages.map(link => (
                    <li key={link.name}>
                      <a href={link.href} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition">{link.name}</a>
                    </li>
                   ))}
                </ul>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-6">Information</p>
                <ul className="flex flex-col gap-4">
                   {footerLinks.information.map(link => (
                    <li key={link.name}>
                      <a href={link.href} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition">{link.name}</a>
                    </li>
                   ))}
                </ul>
             </div>
          </div>
        </div>

        {/* BOTTOM: Credits */}
        <div className="pt-10 border-t border-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-6">
           <p className="text-xs font-bold text-slate-400 tracking-tight">
              &copy; {currentYear} MemoAI. Created by <span className="text-slate-900">Sudharsan</span>
           </p>
           <p className="text-xs font-bold text-slate-400">
              Built with <span className="text-slate-900">React & FastAPI</span>
           </p>
        </div>
      </motion.div>
    </footer>
  )
}