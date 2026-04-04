import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMounting, setIsMounting] = useState(true);

  useEffect(() => {
    setIsMounting(false);
  }, []);

  if (isMounting) return <div className="min-h-screen bg-black" />;

  return (
    <main className="relative min-h-screen w-full bg-black text-white selection:bg-[#ff6b00] selection:text-black overflow-hidden font-mono">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3 font-bold tracking-widest text-sm uppercase">
          <Shield size={18} className="text-[#ff6b00]" />
          <span>CATAPULT</span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-xs font-bold tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2 uppercase"
        >
          Open Dashboard <ChevronRight size={14} />
        </button>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 h-screen flex items-center relative z-10 pt-16">
        
        {/* Left Column (Text) */}
        <div className="w-full md:w-1/2 pr-12 z-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-6 font-bold"
          >
            Autonomous Surveillance Platform
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-[1.1] mb-8 tracking-tight font-sans"
          >
            <span className="text-[#ff6b00] drop-shadow-[0_0_15px_rgba(255,107,0,0.3)] block">Security</span>
            <span className="text-[#ff6b00] drop-shadow-[0_0_15px_rgba(255,107,0,0.3)] block">at the speed</span>
            <span className="text-white block">of thought.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white/50 mb-10 max-w-md text-sm leading-relaxed font-sans"
          >
            Catapult deploys AI agent swarms to simulate how threats unfold in real time, giving operators and autonomous defense systems the insight to act before impact.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            onClick={() => navigate("/dashboard")}
            className="bg-[#ff6b00] text-black px-6 py-3 font-bold text-xs tracking-widest hover:bg-[#ff8533] transition-colors flex items-center gap-3 uppercase"
          >
            Open Dashboard <ChevronRight size={14} />
          </motion.button>
        </div>

        {/* Right Column (Globe Visualization) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] translate-x-1/4 pointer-events-none opacity-80 z-0">
          <div className="absolute inset-0 rounded-full border border-[#ff6b00]/20 shadow-[0_0_120px_rgba(255,107,0,0.15),inset_0_0_120px_rgba(255,107,0,0.1)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_75%)] rounded-full z-10" />
            <div
              className="absolute inset-0 opacity-30 rounded-full"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ff6b00 1px, transparent 0)',
                backgroundSize: '16px 16px',
                maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'
              }}
            />
          </div>

          {/* Floating Markers */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute top-[25%] left-[20%] bg-black/90 border border-[#ff6b00]/20 p-3 rounded-sm backdrop-blur-md shadow-[0_0_15px_rgba(255,107,0,0.1)] z-20"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] shadow-[0_0_5px_#ff6b00] animate-pulse" />
              <span className="text-[#ff6b00] text-[8px] tracking-[0.2em] font-bold uppercase">Satellite Uplink</span>
            </div>
            <div className="text-white/80 text-[10px] tracking-wider uppercase">Orbital-1</div>
            {/* Connecting line */}
            <div className="absolute top-full left-1/2 w-px h-16 bg-gradient-to-b from-[#ff6b00]/50 to-transparent -translate-x-1/2" />
            <div className="absolute top-[calc(100%+4rem)] left-1/2 w-1.5 h-1.5 rounded-full bg-[#ff6b00]/80 -translate-x-1/2" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.0 }}
            className="absolute top-[60%] left-[10%] bg-black/90 border border-[#ff6b00]/20 p-3 rounded-sm backdrop-blur-md shadow-[0_0_15px_rgba(255,107,0,0.1)] z-20"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] shadow-[0_0_5px_#ff6b00] animate-pulse" />
              <span className="text-[#ff6b00] text-[8px] tracking-[0.2em] font-bold uppercase">Drone Swarm</span>
            </div>
            <div className="text-white/80 text-[10px] tracking-wider uppercase">Sector 7 Active</div>
            <div className="absolute top-1/2 right-full w-24 h-px bg-gradient-to-l from-[#ff6b00]/50 to-transparent -translate-y-1/2" />
            <div className="absolute top-1/2 right-[calc(100%+6rem)] w-1.5 h-1.5 rounded-full bg-[#ff6b00]/80 -translate-y-1/2" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute top-[45%] right-[25%] bg-black/90 border border-[#ff6b00]/20 p-3 rounded-sm backdrop-blur-md shadow-[0_0_15px_rgba(255,107,0,0.1)] z-20"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] shadow-[0_0_5px_#ff6b00] animate-pulse" />
              <span className="text-[#ff6b00] text-[8px] tracking-[0.2em] font-bold uppercase">Neural Core</span>
            </div>
            <div className="text-white/80 text-[10px] tracking-wider uppercase">Processing...</div>
            <div className="absolute bottom-full left-1/4 w-px h-12 bg-gradient-to-t from-[#ff6b00]/50 to-transparent" />
            <div className="absolute bottom-[calc(100%+3rem)] left-1/4 w-1.5 h-1.5 rounded-full bg-[#ff6b00]/80 -translate-x-1/2" />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
