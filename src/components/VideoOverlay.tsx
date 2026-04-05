import { useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoOverlayProps {
  videoUrl?: string | null;
  frames?: string[];
  onClose: () => void;
}

export default function VideoOverlay({ videoUrl, frames, onClose }: VideoOverlayProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        key="video-overlay"
        ref={backdropRef}
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0, 0, 0, 0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "4px 0", background: "rgba(0, 112, 243, 0.04)", borderBottom: "1px solid rgba(0, 112, 243, 0.1)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.4em", color: "var(--color-accent-cyan)", opacity: 0.45 }}>
            CONFIDENTIAL // SIMULATION OUTPUT // INTERNAL USE ONLY
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          style={{ position: "absolute", top: 28, left: "50%", transform: "translateX(-50%)", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.3em", color: "var(--color-accent-cyan)" }}
          className="glow-cyan"
        >
          SIMULATION PLAYBACK
        </motion.div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close simulation playback"
          className="glow-cyan-box"
          style={{ position: "absolute", top: 24, right: 24, background: "rgba(0, 229, 255, 0.05)", border: "1px solid rgba(0, 229, 255, 0.25)", borderRadius: 2, padding: "6px 14px", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--color-accent-cyan)", cursor: "pointer", zIndex: 101 }}
        >
          CLOSE [ESC]
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ delay: 0.1, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "relative", maxWidth: "85vw", maxHeight: "75vh", border: "1px solid rgba(0, 229, 255, 0.2)", borderRadius: 3, overflow: "hidden", background: "#000" }}
          className="glow-cyan-box"
        >
          <span aria-hidden style={{ position: "absolute", top: 4, left: 4, width: 20, height: 20, borderTop: "2px solid rgba(0, 229, 255, 0.5)", borderLeft: "2px solid rgba(0, 229, 255, 0.5)", zIndex: 2, pointerEvents: "none" }} />
          <span aria-hidden style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderTop: "2px solid rgba(0, 229, 255, 0.5)", borderRight: "2px solid rgba(0, 229, 255, 0.5)", zIndex: 2, pointerEvents: "none" }} />
          <span aria-hidden style={{ position: "absolute", bottom: 4, left: 4, width: 20, height: 20, borderBottom: "2px solid rgba(0, 229, 255, 0.5)", borderLeft: "2px solid rgba(0, 229, 255, 0.5)", zIndex: 2, pointerEvents: "none" }} />
          <span aria-hidden style={{ position: "absolute", bottom: 4, right: 4, width: 20, height: 20, borderBottom: "2px solid rgba(0, 229, 255, 0.5)", borderRight: "2px solid rgba(0, 229, 255, 0.5)", zIndex: 2, pointerEvents: "none" }} />

          {frames && frames.length > 0 ? (
            <div style={{ display: "flex", gap: "10px", padding: "20px", overflowX: "auto", maxWidth: "85vw" }}>
              {frames.map((frame, idx) => (
                <div key={idx} style={{ flexShrink: 0, border: "2px solid #000", background: "#fff", padding: "4px" }}>
                  <img src={frame} alt={`Frame ${idx + 1}`} style={{ display: "block", height: "400px", objectFit: "cover" }} />
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textAlign: "center", marginTop: 4, color: "#000" }}>T + {idx}s</div>
                </div>
              ))}
            </div>
          ) : videoUrl ? (
            <video src={videoUrl} autoPlay controls style={{ display: "block", maxWidth: "85vw", maxHeight: "75vh", objectFit: "contain" }} />
          ) : (
            <div style={{ padding: 40, fontFamily: "var(--font-mono)", color: "var(--color-accent-cyan)" }}>NO DATA AVAILABLE</div>
          )}
        </motion.div>

        <div style={{ position: "absolute", bottom: 20, fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.25em", color: "var(--color-text-dim)", opacity: 0.6 }}>
          CLICK OUTSIDE OR PRESS ESC TO DISMISS
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
