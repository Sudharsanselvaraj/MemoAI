import { Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import StatsStrip from './components/StatsStrip'
import DashboardPreview from './components/DashboardPreview'
import CapabilitiesSection from './components/CapabilitiesSection'
import FeatureSection from './components/FeatureSection'
import PerformanceSection from './components/PerformanceSection'
import DevToolsSection from './components/DevToolsSection'
import Footer from './components/Footer'
import AgentConsole from './pages/AgentConsole'

function Layout({ children }) {
  const skyBackground = {
    background: 'linear-gradient(180deg, #eef5f9 0%, #f4f8fb 40%, #ffffff 100%)'
  }

  return (
    <div style={skyBackground} className="min-h-screen relative overflow-x-hidden">
      {/* Left Cloud */}
      <motion.div 
        animate={{ x: [-15, 15, -15] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        style={{ mixBlendMode: 'screen' }}
        className="fixed left-[-15%] top-[10%] w-[55%] pointer-events-none z-0 opacity-80"
      >
        <img 
          src="/media/cloud_left.png" 
          alt="" 
          className="w-full h-auto" 
        />
      </motion.div>

      {/* Right Cloud */}
      <motion.div 
        animate={{ x: [15, -15, 15] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        style={{ mixBlendMode: 'screen' }}
        className="fixed right-[-15%] top-[25%] w-[55%] pointer-events-none z-0 opacity-80"
      >
        <img 
          src="/media/cloud_right.png" 
          alt="" 
          className="w-full h-auto" 
        />
      </motion.div>

      <div className="relative z-10 w-full bg-transparent">
        <Navbar />
        {children}
        <Footer />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/features" replace />} />

        <Route path="/features" element={
          <>
            <Hero />
            <CapabilitiesSection />
            <FeatureSection />
            <PerformanceSection />
            <DevToolsSection />
          </>
        } />

        <Route path="/pipeline" element={<FeatureSection />} />

        <Route path="/demo" element={<PerformanceSection />} />

        <Route path="/docs" element={<DevToolsSection />} />

        <Route path="/agent" element={
          <>
            <AgentConsole />
          </>
        } />
      </Routes>
    </Layout>
  )
}