import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Radar, ChevronRight, Shield, Eye, Cpu } from "lucide-react";

function GlobeVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer glow ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="absolute"
        style={{
          width: "min(600px, 80vw)",
          height: "min(600px, 80vw)",
          borderRadius: "50%",
          background: "conic-gradient(from 180deg, transparent 0deg, rgba(234, 88, 12, 0.6) 60deg, rgba(251, 146, 60, 0.8) 120deg, rgba(234, 88, 12, 0.4) 200deg, transparent 280deg, transparent 360deg)",
          filter: "blur(2px)",
          animation: "globe-ring-spin 12s linear infinite",
        }}
      />

      {/* Inner dark circle (globe body) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute"
        style={{
          width: "min(520px, 70vw)",
          height: "min(520px, 70vw)",
          borderRadius: "50%",
          background: "radial-gradient(circle at 40% 35%, #1a2332 0%, #0d1520 40%, #060a10 80%)",
          boxShadow: "inset 0 0 80px rgba(0,0,0,0.8), 0 0 120px rgba(234, 88, 12, 0.15)",
        }}
      >
        {/* Grid lines on globe */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 520 520" style={{ opacity: 0.12 }}>
          {/* Horizontal lines */}
          {[130, 195, 260, 325, 390].map((y, i) => (
            <ellipse key={`h-${i}`} cx="260" cy={y} rx={Math.sqrt(260*260 - (y-260)*(y-260))} ry="8" fill="none" stroke="#f97316" strokeWidth="0.5" />
          ))}
          {/* Vertical lines */}
          {[0, 30, 60, 90, 120, 150].map((angle, i) => (
            <ellipse key={`v-${i}`} cx="260" cy="260" rx={15} ry="240" fill="none" stroke="#f97316" strokeWidth="0.5"
              transform={`rotate(${angle}, 260, 260)`} />
          ))}
        </svg>

        {/* Data nodes on the globe */}
        <GlobeNode x="35%" y="30%" label="DEPLOYING ASSETS" sublabel="LONDON" delay={0.8} />
        <GlobeNode x="60%" y="55%" label="SURVEILLANCE ACTIVE" sublabel="WEST LAFAYETTE" delay={1.0} color="#10b981" />
        <GlobeNode x="70%" y="72%" label="THREAT ANALYSIS" sublabel="SINGAPORE" delay={1.2} />
      </motion.div>

      {/* Ambient glow */}
      <div
        className="absolute"
        style={{
          width: "min(700px, 90vw)",
          height: "min(700px, 90vw)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(234, 88, 12, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function GlobeNode({ x, y, label, sublabel, delay, color }: { x: string; y: string; label: string; sublabel: string; delay: number; color?: string }) {
  const nodeColor = color || "#f97316";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="absolute"
      style={{ left: x, top: y }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: nodeColor,
            boxShadow: `0 0 8px ${nodeColor}, 0 0 16px ${nodeColor}40`,
            animation: "hud-pulse 2.4s ease-in-out infinite",
          }}
        />
        <div
          className="px-2 py-1 rounded-sm"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            border: `1px solid ${nodeColor}40`,
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: nodeColor }} />
            <span className="text-[7px] font-mono tracking-widest uppercase" style={{ color: nodeColor }}>{label}</span>
          </div>
          <div className="text-[8px] font-mono uppercase" style={{ color: "var(--color-text-dim)" }}>{sublabel}</div>
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

        {/* Right Panel - Globe */}
        <div className="absolute right-0 top-0 bottom-0 w-3/5 overflow-hidden z-10 hidden md:flex items-center justify-center"
          style={{ transform: "translateX(5%)" }}
        >
          <GlobeVisual />
        </div>
      </div>
    </main>
  );
}
