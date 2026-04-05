import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Radar, ChevronRight, Shield, Eye, Cpu } from "lucide-react";
import GlobeView from "@/components/GlobeView";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMounting, setIsMounting] = useState(true);

  useEffect(() => {
    setIsMounting(false);
  }, []);

  if (isMounting) return <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }} />;

  return (
    <main className="relative min-h-screen w-full overflow-hidden font-sans" style={{ backgroundColor: "#050B14", color: "var(--color-text)" }}>
      <style>{`
        @keyframes globe-ring-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <Radar style={{ color: "var(--color-accent-cyan)" }} size={22} />
          <span className="font-bold tracking-[0.2em] text-sm" style={{ fontFamily: "var(--font-mono)" }}>OMNISIGHT</span>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="hud-button flex items-center gap-2 text-xs font-mono tracking-widest px-4 py-2 rounded-sm transition-colors"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-dim)",
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "transparent",
          }}
        >
          OPEN DASHBOARD <ChevronRight size={14} style={{ color: "var(--color-accent-cyan)" }} />
        </button>
      </nav>

      {/* Main Content */}
      <div className="relative flex min-h-screen w-full">
        {/* Left Panel */}
        <div className="flex-1 flex flex-col justify-center px-12 md:px-20 z-20 pt-20 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="text-[10px] tracking-[0.35em] uppercase mb-6"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-dim)" }}
            >
              Autonomous Surveillance Platform
            </p>

            <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-8">
              <span style={{ color: "#f97316" }} className="block">Optimize</span>
              <span style={{ color: "#f97316" }} className="block">coverage</span>
              <span style={{ color: "var(--color-text)" }} className="block">before impact.</span>
            </h1>

            <p
              className="text-sm md:text-base max-w-md leading-relaxed mb-10"
              style={{ color: "var(--color-text-dim)", fontFamily: "var(--font-ui)" }}
            >
              OmniSight deploys AI-powered synthetic data generation to optimize
              camera placement, giving operators the insight to maximize
              surveillance coverage in real time.
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              className="hud-button inline-flex items-center gap-3 font-bold text-sm tracking-widest px-8 py-4 rounded-sm transition-colors"
              style={{
                backgroundColor: "#ea580c",
                color: "white",
                fontFamily: "var(--font-mono)",
              }}
            >
              OPEN DASHBOARD <ChevronRight size={16} />
            </button>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap gap-4 mt-12"
            >
              {[
                { icon: Shield, label: "AI-POWERED PLACEMENT" },
                { icon: Eye, label: "SYNTHETIC DATA GEN" },
                { icon: Cpu, label: "3D SPATIAL ANALYSIS" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-[9px] tracking-widest px-3 py-2 rounded-sm"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-dim)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backgroundColor: "rgba(255,255,255,0.02)",
                  }}
                >
                  <Icon size={12} style={{ color: "#f97316" }} />
                  {label}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Full background Globe */}
        <div className="absolute inset-0 overflow-hidden z-10">
          <GlobeView />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, #050B14 0%, rgba(5,11,20,0.8) 40%, rgba(5,11,20,0) 100%)" }} />
        </div>
      </div>
    </main>
  );
}
