import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Radar, ChevronRight } from "lucide-react";

function DotGrid() {
  return (
    <div
      className="absolute inset-0 opacity-[0.2]"
      style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.4) 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }}
    />
  );
}

function Node({
  x, y, title, subtitle, delay
}: {
  x: string, y: string, title: string, subtitle: string, delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="absolute"
      style={{ left: x, top: y }}
    >
      <div className="relative flex items-center">
        {/* The dot */}
        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] z-10" />

        {/* The line connecting dot to box */}
        <div className="h-[1px] w-8 bg-blue-500/40" />

        {/* The box */}
        <div className="border border-blue-500/30 bg-slate-900/80 px-3 py-2 rounded-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] font-mono tracking-widest text-blue-500 uppercase">{title}</span>
          </div>
          <div className="text-[10px] font-mono text-slate-300 uppercase">{subtitle}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMounting, setIsMounting] = useState(true);

  useEffect(() => {
    setIsMounting(false);
  }, []);

  if (isMounting) return <div className="min-h-screen bg-slate-900" />;

  return (
    <main className="relative min-h-screen w-full bg-[#050B14] text-slate-50 overflow-hidden font-sans">

      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-8">
        <div className="flex items-center gap-3 font-bold tracking-widest text-lg">
          <Radar className="text-blue-500" size={24} />
          <span>OMNISIGHT</span>
        </div>
        
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-slate-300 hover:text-white transition-colors"
        >
          OPEN DASHBOARD <ChevronRight size={14} className="text-blue-500" />
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="relative flex min-h-screen w-full">

        {/* Left Panel */}
        <div className="flex-1 flex flex-col justify-center px-12 md:px-24 z-20 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono text-[10px] tracking-[0.3em] text-slate-400 mb-6 uppercase">
              Autonomous Surveillance Platform
            </p>

            <h1 className="text-6xl md:text-[5.5rem] font-black leading-[1.05] tracking-tight mb-8">
              <span className="text-blue-500 block">Security</span>
              <span className="text-blue-500 block">at the speed</span>
              <span className="text-white block">of thought.</span>
            </h1>

            <p className="text-slate-400 text-sm md:text-base max-w-md leading-relaxed mb-10 font-medium">
              OmniSight deploys AI-powered synthetic data generation to optimize camera placement, giving operators the insight to maximize surveillance coverage before impact.
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-widest px-8 py-4 rounded-sm transition-colors"
            >
              OPEN DASHBOARD <ChevronRight size={16} />
            </button>
          </motion.div>
        </div>

        {/* Right Panel (Curved Map Area) */}
        <div className="absolute right-0 top-0 bottom-0 w-3/5 overflow-hidden z-10 hidden md:block">

          {/* Background curve */}
          <div
            className="absolute inset-0 border-l border-blue-500/10 bg-[#0A1220]"
            style={{
              borderTopLeftRadius: '100% 50%',
              borderBottomLeftRadius: '100% 50%',
              transform: 'translateX(10%)',
            }}
          >
            {/* The glow on the edge of the curve */}
            <div
              className="absolute inset-0"
              style={{
                boxShadow: 'inset 40px 0 100px -40px rgba(59, 130, 246, 0.15)',
                borderTopLeftRadius: '100% 50%',
                borderBottomLeftRadius: '100% 50%',
              }}
            />

            <DotGrid />

            {/* Connecting Lines SVG */}
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              <path
                d="M 20% 60% L 35% 60% L 35% 25% L 50% 25%"
                stroke="rgba(59, 130, 246, 0.2)"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M 35% 60% L 60% 60% L 60% 45% L 75% 45%"
                stroke="rgba(59, 130, 246, 0.2)"
                strokeWidth="1"
                fill="none"
              />
            </svg>

            {/* Nodes */}
            <Node
              x="20%" y="60%"
              title="Ground Station"
              subtitle="West Lafayette"
              delay={0.4}
            />
            <Node
              x="50%" y="25%"
              title="Satellite Uplink"
              subtitle="Orbital-1"
              delay={0.6}
            />
            <Node
              x="75%" y="45%"
              title="Neural Core"
              subtitle="Processing..."
              delay={0.8}
            />
          </div>
        </div>

      </div>
    </main>
  );
}
