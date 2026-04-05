import { motion, AnimatePresence } from "framer-motion";

interface ComicFrame {
  id: number;
  imageUrl: string;
  caption: string;
  status: "generating" | "done";
}

interface ComicSimulationProps {
  frames: ComicFrame[];
  prompt: string;
  isGenerating: boolean;
  onClose: () => void;
}

export default function ComicSimulation({ frames, prompt, isGenerating, onClose }: ComicSimulationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0, 0, 0, 0.95)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "16px 24px",
        borderBottom: "1px solid rgba(0, 229, 255, 0.15)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.2em", color: "var(--color-accent-cyan)", fontWeight: 700 }}>
            SIMULATION OUTPUT
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em", color: "var(--color-text-dim)", marginTop: "4px", maxWidth: "600px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            SCENARIO: {prompt.toUpperCase()}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {isGenerating && (
            <span className="hud-pulse" style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.15em", color: "#f97316" }}>
              GENERATING FRAMES...
            </span>
          )}
          <button
            onClick={onClose}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.2em",
              padding: "8px 16px",
              color: "var(--color-accent-cyan)",
              background: "rgba(0, 229, 255, 0.06)",
              border: "1px solid rgba(0, 229, 255, 0.3)",
              borderRadius: "2px",
              cursor: "pointer",
            }}
          >
            ✕ CLOSE
          </button>
        </div>
      </div>

      {/* Comic grid */}
      <div style={{
        flex: 1,
        overflow: "auto",
        padding: "24px",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "16px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}>
          <AnimatePresence mode="popLayout">
            {frames.map((frame, i) => (
              <motion.div
                key={frame.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "relative",
                  border: "2px solid rgba(0, 229, 255, 0.2)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  background: "rgba(0, 229, 255, 0.02)",
                }}
              >
                {/* Frame number */}
                <div style={{
                  position: "absolute",
                  top: "8px",
                  left: "8px",
                  zIndex: 2,
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  color: "var(--color-accent-cyan)",
                  background: "rgba(0, 0, 0, 0.8)",
                  padding: "4px 8px",
                  borderRadius: "2px",
                  border: "1px solid rgba(0, 229, 255, 0.3)",
                }}>
                  FRAME {String(i + 1).padStart(2, "0")}
                </div>

                {frame.status === "generating" ? (
                  <div style={{
                    width: "100%",
                    aspectRatio: "16/9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "12px",
                  }}>
                    <div className="hud-pulse" style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", color: "var(--color-accent-cyan)" }}>
                      RENDERING...
                    </div>
                    <div style={{
                      width: "60%",
                      height: "3px",
                      background: "rgba(0, 229, 255, 0.1)",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}>
                      <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        style={{ width: "40%", height: "100%", background: "var(--color-accent-cyan)" }}
                      />
                    </div>
                  </div>
                ) : (
                  <img
                    src={frame.imageUrl}
                    alt={frame.caption}
                    style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
                  />
                )}

                {/* Caption */}
                <div style={{
                  padding: "10px 12px",
                  borderTop: "1px solid rgba(0, 229, 255, 0.1)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--color-text)",
                  letterSpacing: "0.05em",
                  lineHeight: 1.5,
                }}>
                  {frame.caption}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {frames.length === 0 && isGenerating && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "300px",
            flexDirection: "column",
            gap: "16px",
          }}>
            <div className="hud-pulse" style={{ fontFamily: "var(--font-mono)", fontSize: "14px", letterSpacing: "0.3em", color: "var(--color-accent-cyan)" }}>
              INITIALIZING SIMULATION
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-dim)", letterSpacing: "0.15em" }}>
              ANALYZING SCENARIO AND GENERATING FRAMES...
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
