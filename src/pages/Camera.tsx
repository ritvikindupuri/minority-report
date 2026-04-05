import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getSessionId } from "@/lib/session";
import { getCameras, getBuilding, startSimulation, pollSimulation } from "@/lib/api";
import type { Camera, Building } from "@/lib/types";
import CameraView from "@/components/CameraView";
import VideoOverlay from "@/components/VideoOverlay";

export default function CameraPage() {
  const { id: cameraId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cameras, setCameras] = useState<Camera[]>([]);
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [frames, setFrames] = useState<string[]>([]);

  useEffect(() => {
    const sessionId = getSessionId();
    if (!sessionId) { navigate("/"); return; }

    const load = async () => {
      try {
        const [camerasRes, buildingRes] = await Promise.all([getCameras(sessionId), getBuilding(sessionId)]);
        setCameras(camerasRes.cameras);
        setBuilding(buildingRes.building);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load camera data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleSimulationSubmit = useCallback(async (prompt: string) => {
    const sessionId = getSessionId();
    if (!sessionId || !cameraId) return;
    setIsSimulating(true);
    setVideoUrl(null);
    setFrames([]);
    try {
      await startSimulation(sessionId, cameraId, prompt);
      const stopPolling = pollSimulation(sessionId, cameraId, (result) => {
        if (result.status === "complete" && (result.video_url || (result.frames && result.frames.length > 0))) {
          setIsSimulating(false);
          setVideoUrl(result.video_url);
          setFrames(result.frames || []);
          stopPolling();
        } else if (result.status === "failed") {
          setIsSimulating(false);
          setError(result.error ?? "Simulation failed");
          stopPolling();
        }
      });
    } catch (err: unknown) {
      setIsSimulating(false);
      setError(err instanceof Error ? err.message : "Failed to start simulation");
    }
  }, [cameraId]);

  const handleSwitchCamera = useCallback((newCameraId: string) => {
    if (newCameraId !== cameraId) navigate(`/camera/${newCameraId}`, { replace: false });
  }, [cameraId, navigate]);

  const handleCloseVideo = useCallback(() => {
    setVideoUrl(null);
    setFrames([]);
  }, []);

  if (loading) {
    return (
      <main className="relative flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.4em", color: "var(--color-accent-cyan)", opacity: 0.4, marginBottom: 16 }}>
          CLASSIFICATION: EYES ONLY
        </div>
        <div className="glow-cyan hud-pulse" style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.3em", color: "var(--color-accent-cyan)", textTransform: "uppercase" }}>
          ESTABLISHING CAMERA FEED
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", color: "var(--color-text-dim)", marginTop: 12 }}>
          CAM-{cameraId}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.15em", color: "var(--color-text-dim)", opacity: 0.4, marginTop: 24 }} className="hud-pulse">
          DECRYPTING FEED...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative flex flex-col items-center justify-center min-h-screen gap-4" style={{ backgroundColor: "var(--color-bg)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.25em", color: "#ff2d2d", textShadow: "0 0 8px rgba(255, 45, 45, 0.6)" }}>FEED ERROR</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", color: "var(--color-text-dim)", maxWidth: 400, textAlign: "center" }}>{error}</div>
        <button type="button" onClick={() => navigate("/building")} className="glow-cyan-box" style={{ marginTop: 16, background: "rgba(0, 229, 255, 0.06)", border: "1px solid rgba(0, 229, 255, 0.3)", borderRadius: 2, padding: "8px 20px", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", color: "var(--color-accent-cyan)", cursor: "pointer" }}>
          BACK TO BUILDING
        </button>
      </main>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <button
        type="button"
        onClick={() => navigate("/building")}
        className="glow-cyan-box"
        style={{
          position: "fixed", top: 20, left: 20, zIndex: 60,
          background: "rgba(0, 0, 0, 0.8)", border: "1px solid rgba(0, 229, 255, 0.25)",
          borderRadius: 2, padding: "6px 16px", fontFamily: "var(--font-mono)",
          fontSize: 9, letterSpacing: "0.25em", color: "var(--color-accent-cyan)",
          cursor: "pointer", backdropFilter: "blur(6px)",
        }}
      >
        ← BUILDING VIEW
      </button>

      <CameraView
        cameraId={cameraId!}
        cameras={cameras}
        building={building}
        onSwitchCamera={handleSwitchCamera}
        onSimulationSubmit={handleSimulationSubmit}
        isSimulating={isSimulating}
      />

      {(videoUrl || frames.length > 0) && <VideoOverlay videoUrl={videoUrl} frames={frames} onClose={handleCloseVideo} />}
    </motion.main>
  );
}
