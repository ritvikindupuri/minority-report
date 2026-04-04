import { useState, useCallback } from "react";

interface SimulationPromptProps {
  onSubmit: (prompt: string) => void;
  isSimulating: boolean;
}

export default function SimulationPrompt({ onSubmit, isSimulating }: SimulationPromptProps) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || isSimulating) return;
    onSubmit(trimmed);
    setValue("");
  }, [value, isSimulating, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div style={{ position: "fixed", bottom: 72, left: "50%", transform: "translateX(-50%)", zIndex: 40, width: "min(600px, 90vw)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.35em", color: "var(--color-accent-cyan)", opacity: 0.5, marginBottom: 4, paddingLeft: 2 }}>
        SCENARIO INPUT // CLASSIFIED
      </div>
      {isSimulating ? (
        <div className="glow-cyan-box" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 20px", background: "rgba(0, 0, 0, 0.9)", border: "1px solid rgba(0, 229, 255, 0.3)", borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.15em", color: "var(--color-accent-cyan)" }}>
          <span className="sim-pulse" style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--color-accent-cyan)" }} />
          GENERATING SIMULATION...
        </div>
      ) : (
        <div className="glow-cyan-box" style={{ position: "relative", display: "flex", alignItems: "center", gap: 0, background: "rgba(0, 0, 0, 0.9)", border: "1px solid rgba(0, 229, 255, 0.25)", borderRadius: 3, overflow: "hidden" }}>
          <span style={{ flex: "0 0 auto", padding: "12px 0 12px 14px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-accent-cyan)", opacity: 0.5 }}>&gt;</span>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="DESCRIBE SCENARIO..."
            aria-label="Scenario description for camera simulation"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "12px 12px", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.08em", color: "var(--color-text)" }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={value.trim().length === 0}
            style={{
              flex: "0 0 auto",
              padding: "12px 18px",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: value.trim().length > 0 ? "var(--color-accent-cyan)" : "var(--color-text-dim)",
              background: value.trim().length > 0 ? "rgba(0, 229, 255, 0.08)" : "transparent",
              border: "none",
              borderLeft: "1px solid rgba(0, 229, 255, 0.15)",
              cursor: value.trim().length > 0 ? "pointer" : "default",
              transition: "all 150ms ease",
            }}
          >
            SIMULATE
          </button>
        </div>
      )}
    </div>
  );
}
