import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PlacedCamera {
  id: string;
  lat: number;
  lng: number;
  height: number;
}

interface StreetLevelHUDProps {
  buildingName: string;
  onExitStreetLevel: () => void;
  placingCamera: boolean;
  onTogglePlaceCamera: () => void;
  cameras: PlacedCamera[];
  onCameraClick: (cam: PlacedCamera) => void;
  selectedCamera: PlacedCamera | null;
  onSimulate: (prompt: string) => void;
  isSimulating: boolean;
}

export default function StreetLevelHUD({
  buildingName,
  onExitStreetLevel,
  placingCamera,
  onTogglePlaceCamera,
  cameras,
  onCameraClick,
  selectedCamera,
  onSimulate,
  isSimulating,
}: StreetLevelHUDProps) {
  const [prompt, setPrompt] = useState("");

  const btnStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    letterSpacing: "0.2em",
    padding: "8px 16px",
    cursor: "pointer",
    border: "1px solid rgba(0, 229, 255, 0.3)",
    borderRadius: "2px",
    background: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(8px)",
    transition: "all 200ms",
  };

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 40 }}>
      {/* Top bar */}
      <div
        className="pointer-events-auto"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={onExitStreetLevel}
            style={{ ...btnStyle, color: "var(--color-accent-cyan)" }}
          >
            ← BACK TO CAMPUS
          </button>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.15em", color: "var(--color-accent-cyan)", fontWeight: 700 }}>
              {buildingName.toUpperCase()}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.2em", color: "var(--color-text-dim)" }}>
              STREET-LEVEL SURVEILLANCE MODE
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--color-text-dim)", letterSpacing: "0.15em" }}>
            CAMERAS: {cameras.length}
          </span>
          <button
            onClick={onTogglePlaceCamera}
            style={{
              ...btnStyle,
              color: placingCamera ? "#f97316" : "var(--color-accent-cyan)",
              borderColor: placingCamera ? "rgba(249, 115, 22, 0.5)" : "rgba(0, 229, 255, 0.3)",
              background: placingCamera ? "rgba(249, 115, 22, 0.15)" : "rgba(0, 0, 0, 0.7)",
            }}
          >
            {placingCamera ? "⊗ CANCEL PLACEMENT" : "⊕ PLACE CAMERA"}
          </button>
        </div>
      </div>

      {/* Controls help - bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          letterSpacing: "0.1em",
          color: "var(--color-text-dim)",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
          padding: "10px 14px",
          borderRadius: "2px",
          border: "1px solid rgba(0, 229, 255, 0.1)",
          lineHeight: 1.8,
        }}
      >
        <div style={{ color: "var(--color-accent-cyan)", marginBottom: "4px", fontSize: "10px" }}>CONTROLS</div>
        <div>MOUSE DRAG — LOOK AROUND</div>
        <div>SCROLL — MOVE FORWARD/BACK</div>
        <div>RIGHT DRAG — PAN</div>
        {placingCamera && (
          <div style={{ color: "#f97316", marginTop: "4px" }}>CLICK GROUND TO PLACE CAMERA</div>
        )}
      </div>

      {/* Camera list - right side */}
      {cameras.length > 0 && (
        <div
          className="pointer-events-auto"
          style={{
            position: "absolute",
            right: "20px",
            top: "80px",
            width: "200px",
            fontFamily: "var(--font-mono)",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(0, 229, 255, 0.15)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(0, 229, 255, 0.1)", fontSize: "9px", letterSpacing: "0.25em", color: "var(--color-accent-cyan)" }}>
            DEPLOYED CAMERAS
          </div>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {cameras.map((cam, i) => (
              <button
                key={cam.id}
                onClick={() => onCameraClick(cam)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  fontSize: "10px",
                  color: selectedCamera?.id === cam.id ? "var(--color-accent-cyan)" : "var(--color-text)",
                  background: selectedCamera?.id === cam.id ? "rgba(0, 229, 255, 0.08)" : "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(0, 229, 255, 0.05)",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.1em",
                  transition: "background 150ms",
                }}
              >
                CAM-{String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scenario prompt modal */}
      <AnimatePresence>
        {selectedCamera && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pointer-events-auto"
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(600px, 90vw)",
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(0, 229, 255, 0.25)",
              borderRadius: "4px",
              padding: "20px",
            }}
          >
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.25em", color: "var(--color-accent-cyan)", marginBottom: "12px" }}>
              SIMULATE SCENARIO — {selectedCamera.id.toUpperCase()}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--color-text-dim)", marginBottom: "12px", letterSpacing: "0.1em" }}>
              Describe what you want to simulate. Frames will be generated as a comic-book sequence.
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A person enters the building carrying a suspicious package, walks through the lobby, and enters the elevator..."
              disabled={isSimulating}
              style={{
                width: "100%",
                height: "80px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--color-text)",
                background: "rgba(0, 229, 255, 0.04)",
                border: "1px solid rgba(0, 229, 255, 0.2)",
                borderRadius: "2px",
                padding: "10px",
                resize: "none",
                outline: "none",
                letterSpacing: "0.05em",
              }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => onCameraClick(null as unknown as PlacedCamera)}
                style={{ ...btnStyle, color: "var(--color-text-dim)" }}
              >
                CANCEL
              </button>
              <button
                onClick={() => { if (prompt.trim()) onSimulate(prompt.trim()); }}
                disabled={!prompt.trim() || isSimulating}
                style={{
                  ...btnStyle,
                  color: isSimulating ? "var(--color-text-dim)" : "#00ff41",
                  borderColor: isSimulating ? "rgba(255,255,255,0.1)" : "rgba(0, 255, 65, 0.4)",
                  background: isSimulating ? "rgba(0,0,0,0.5)" : "rgba(0, 255, 65, 0.08)",
                }}
              >
                {isSimulating ? "GENERATING..." : "▶ SIMULATE"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
