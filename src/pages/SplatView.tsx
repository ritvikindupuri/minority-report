import { useEffect, useRef, useState } from "react";
import * as GaussianSplats3D from "@mkkellogg/gaussian-splats-3d";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function SplatView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!containerRef.current) return;

    let viewer: any = null;

    const initViewer = async () => {
      viewer = new GaussianSplats3D.Viewer({
        cameraUp: [0, -1, -0.6],
        initialCameraPosition: [-1, -4, 6],
        initialCameraLookAt: [0, 4, 0]
      });

      await viewer.addSplatScene('/purdue-splat.ksplat', {
        progressiveLoad: false
      });

      viewer.start();
      setLoading(false);
    };

    initViewer();

    return () => {
      if (viewer) {
        viewer.dispose();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-mono text-white">
      {/* Top Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center px-8 py-6 pointer-events-none">
        <button
          onClick={() => navigate("/dashboard")}
          className="pointer-events-auto flex items-center gap-2 text-xs font-bold tracking-widest text-white/50 hover:text-white transition-colors uppercase bg-black/50 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md"
        >
          <ChevronLeft size={14} /> Back to Dashboard
        </button>
        <div className="ml-auto pointer-events-auto bg-black/50 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <span className="text-[#ff6b00] font-bold text-xs tracking-widest uppercase">3D Spatial Rendering</span>
        </div>
      </nav>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-40 bg-black">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-[#ff6b00] border-t-transparent animate-spin" />
            <span className="text-[#ff6b00] text-xs font-bold tracking-widest uppercase animate-pulse">Loading Asset...</span>
          </div>
        </div>
      )}

      {/* The splat viewer container */}
      <div
        ref={containerRef}
        id="splat-container"
        className="absolute inset-0 w-full h-full"
      />
      <style dangerouslySetInnerHTML={{__html: `
        #splat-container canvas {
            width: 100% !important;
            height: 100% !important;
            display: block;
        }
      `}} />

      {/* HUD Elements overlay */}
      <div className="absolute bottom-8 left-8 pointer-events-none z-30 flex flex-col gap-2">
         <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-bold">West Lafayette</span>
         <span className="text-[#ff6b00] text-[10px] tracking-widest uppercase">Target Area Rendering Active</span>
      </div>
    </div>
  );
}
