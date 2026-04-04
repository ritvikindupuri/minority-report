import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PRELOADED_BUILDINGS } from "@/lib/buildings";
import { createSession, setBuilding } from "@/lib/api";
import { setSessionId, setSelectedBuilding } from "@/lib/session";
import type { Building } from "@/lib/types";
import GlobeSidebar from "@/components/GlobeSidebar";
import GlobeStatusBar from "@/components/GlobeStatusBar";

const buildingSelectRef: { current: ((b: Building) => void) | null } = { current: null };

interface CursorCoords {
  lat: string;
  lng: string;
  alt: string;
}

export default function GlobeView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<unknown>(null);
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [selectingBuilding, setSelectingBuilding] = useState<string | null>(null);
  const [coords, setCoords] = useState<CursorCoords>({ lat: "40.4274", lng: "-86.9167", alt: "800" });
  const [cesiumReady, setCesiumReady] = useState(false);

  const handleBuildingSelect = useCallback(
    async (building: Building) => {
      if (selectingBuilding) return;
      setSelectingBuilding(building.id);
      try {
        const session = await createSession();
        setSessionId(session.session_id);
        setSelectedBuilding(building.id);
        await setBuilding(session.session_id, {
          building_id: building.id,
          name: building.name,
          lat: building.lat,
          lng: building.lng,
          footprint_polygon: building.footprint_polygon,
        });
        navigate("/building");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error occurred";
        setError(`BACKEND OFFLINE: ${message}`);
        setSelectingBuilding(null);
      }
    },
    [selectingBuilding, navigate]
  );

  buildingSelectRef.current = handleBuildingSelect;

  useEffect(() => {
    if (!containerRef.current) return;
    let viewer: { destroy: () => void; isDestroyed: () => boolean } | null = null;
    let destroyed = false;

    async function initCesium() {
      try {
        const Cesium = await import("cesium");

        // Set Cesium base URL to use CDN
        (window as unknown as Record<string, unknown>).CESIUM_BASE_URL =
          "https://cesium.com/downloads/cesiumjs/releases/1.140/Build/Cesium/";

        const ionToken = import.meta.env.VITE_CESIUM_ION_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlOTg2MjNiOS1mN2E2LTRjNGMtOTQzZC1hZjAxZDM0NGQ1MGMiLCJpZCI6MzYzNTY2LCJpYXQiOjE3NjQwNDM1ODJ9.fBcYO6QztbNm7zHEYQ8KrAp7urIKkT4ac4hBNeq2fvM";
        if (ionToken) {
          Cesium.Ion.defaultAccessToken = ionToken;
        } else {
          Cesium.Ion.defaultAccessToken = undefined as unknown as string;
        }

        if (destroyed || !containerRef.current) return;

        const v = new Cesium.Viewer(containerRef.current, {
          animation: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          navigationHelpButton: false,
          scene3DOnly: true,
          baseLayer: false,
          skyBox: false,
          skyAtmosphere: false,
          contextOptions: { webgl: { alpha: true } },
          requestRenderMode: false,
          maximumRenderTimeChange: Infinity,
        });

        viewer = v;
        viewerRef.current = v;

        if (ionToken) {
          const imageryLayer = v.imageryLayers.addImageryProvider(
            await Cesium.IonImageryProvider.fromAssetId(2)
          );
          imageryLayer.brightness = 0.6;
          imageryLayer.contrast = 1.15;
          imageryLayer.saturation = 0.4;
          imageryLayer.gamma = 0.85;
        } else {
          v.imageryLayers.removeAll();
          v.imageryLayers.addImageryProvider(
            new Cesium.UrlTemplateImageryProvider({
              url: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              credit: new Cesium.Credit("CartoDB Dark Matter"),
              minimumLevel: 0,
              maximumLevel: 18,
            })
          );
        }

        v.scene.backgroundColor = Cesium.Color.fromCssColorString("#060608");
        v.scene.globe.baseColor = Cesium.Color.fromCssColorString("#0a0c10");
        v.scene.fog.enabled = false;
        v.scene.globe.showGroundAtmosphere = false;
        v.scene.globe.enableLighting = true;
        if (v.scene.sun) v.scene.sun.show = false;
        if (v.scene.moon) v.scene.moon.show = false;

        if (ionToken) {
          try {
            const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(96188);
            v.scene.primitives.add(tileset);
          } catch (e) {
            console.warn("[Globe] Could not load 3D buildings tileset:", e);
          }
        }

        v.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(-86.9130, 40.4265, 20_000_000),
          orientation: { heading: Cesium.Math.toRadians(0), pitch: Cesium.Math.toRadians(-90), roll: 0 },
        });

        for (const building of PRELOADED_BUILDINGS) {
          const position = Cesium.Cartesian3.fromDegrees(building.lng, building.lat, 0);
          v.entities.add({
            id: building.id,
            name: building.name,
            position,
            point: {
              pixelSize: 14,
              color: Cesium.Color.fromCssColorString("#00e5ff"),
              outlineColor: Cesium.Color.fromCssColorString("#00e5ff").withAlpha(0.3),
              outlineWidth: 8,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
            label: {
              text: building.name.toUpperCase(),
              font: "13px 'Space Mono', monospace",
              fillColor: Cesium.Color.fromCssColorString("#00e5ff"),
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 3,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -24),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
          });
          v.entities.add({
            position,
            ellipse: {
              semiMajorAxis: 40,
              semiMinorAxis: 40,
              material: Cesium.Color.fromCssColorString("#00e5ff").withAlpha(0.08),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString("#00e5ff").withAlpha(0.3),
              outlineWidth: 1,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
          });
        }

        const handler = new Cesium.ScreenSpaceEventHandler(v.scene.canvas);
        handler.setInputAction(
          (click: any) => {
            const picked = v.scene.pick(click.position);
            if (Cesium.defined(picked) && picked.id && picked.id.id) {
              const building = PRELOADED_BUILDINGS.find((b: Building) => b.id === picked.id.id);
              if (building && buildingSelectRef.current) buildingSelectRef.current(building);
            }
          },
          Cesium.ScreenSpaceEventType.LEFT_CLICK
        );

        handler.setInputAction(
          (movement: any) => {
            const picked = v.scene.pick(movement.endPosition);
            if (Cesium.defined(picked) && picked.id && picked.id.id) {
              const building = PRELOADED_BUILDINGS.find((b: Building) => b.id === picked.id.id);
              if (building) {
                setHoveredBuilding(building.id);
                containerRef.current!.style.cursor = "pointer";
              } else {
                setHoveredBuilding(null);
                containerRef.current!.style.cursor = "default";
              }
            } else {
              setHoveredBuilding(null);
              containerRef.current!.style.cursor = "default";
            }
          },
          Cesium.ScreenSpaceEventType.MOUSE_MOVE
        );

        v.camera.changed.addEventListener(() => {
          const cartographic = v.camera.positionCartographic;
          setCoords({
            lat: Cesium.Math.toDegrees(cartographic.latitude).toFixed(4),
            lng: Cesium.Math.toDegrees(cartographic.longitude).toFixed(4),
            alt: (cartographic.height / 1000).toFixed(0),
          });
        });

        // Fly to Purdue campus
        setTimeout(() => {
          v.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(-86.9130, 40.4265, 1200),
            orientation: { heading: Cesium.Math.toRadians(0), pitch: Cesium.Math.toRadians(-45), roll: 0 },
            duration: 4,
          });
        }, 500);

        setCesiumReady(true);
        setReady(true);
      } catch (err) {
        console.error("[Globe] Init error:", err);
        setError("Failed to initialize globe");
        setReady(true);
      }
    }

    initCesium();

    return () => {
      destroyed = true;
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
    };
  }, []);

  const hoveredBuildingData = hoveredBuilding
    ? PRELOADED_BUILDINGS.find((b) => b.id === hoveredBuilding)
    : null;

  return (
    <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: "var(--color-bg)" }}>
      <div ref={containerRef} className="absolute inset-0" style={{ backgroundColor: "#0a0a0a" }} />

      <AnimatePresence>
        {ready && (
          <motion.div key="chrome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="absolute inset-0" style={{ zIndex: 25, pointerEvents: "none" }}>
            <div style={{ pointerEvents: "auto" }}>
              <GlobeSidebar onBuildingSelect={handleBuildingSelect} />
            </div>
            <GlobeStatusBar />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ready && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.5 }} className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-0 right-0 flex items-center justify-center py-2" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)" }}>
              <span className="glow-cyan text-xs tracking-[0.5em] uppercase" style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-cyan)" }}>
                TOP SECRET // SCI // MINORITY REPORT SYSTEM
              </span>
            </div>

            {[
              { top: "40px", left: "24px", borderWidth: "2px 0 0 2px" },
              { top: "40px", right: "24px", borderWidth: "2px 2px 0 0" },
              { bottom: "56px", left: "24px", borderWidth: "0 0 2px 2px" },
              { bottom: "56px", right: "24px", borderWidth: "0 2px 2px 0" },
            ].map((pos, i) => (
              <span key={i} aria-hidden className="absolute" style={{ width: "28px", height: "28px", borderStyle: "solid", borderColor: "var(--color-accent-cyan)", opacity: 0.35, ...pos } as React.CSSProperties} />
            ))}

            <div className="absolute flex flex-col gap-1 text-xs" style={{ fontFamily: "var(--font-mono)", top: "48px", left: "264px" }}>
              <span className="hud-pulse" style={{ color: "var(--color-accent-green)" }}>● SATELLITE LINK ACTIVE</span>
              <span style={{ color: "var(--color-text-dim)" }}>FEED: PURDUE UNIVERSITY</span>
              <span style={{ color: "var(--color-text-dim)" }}>RESOLUTION: 0.3m/px</span>
            </div>

            <div className="absolute top-12 right-10 flex flex-col items-end gap-1 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
              <MissionClock />
              <span style={{ color: "var(--color-text-dim)" }}>CLASSIFICATION: EYES ONLY</span>
            </div>

            <div className="absolute" style={{ top: "50%", left: "calc(50% + 120px)", transform: "translate(-50%, -50%)", pointerEvents: "none" }}>
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={{ opacity: 0.2 }}>
                <line x1="30" y1="0" x2="30" y2="22" stroke="#00e5ff" strokeWidth="0.5" />
                <line x1="30" y1="38" x2="30" y2="60" stroke="#00e5ff" strokeWidth="0.5" />
                <line x1="0" y1="30" x2="22" y2="30" stroke="#00e5ff" strokeWidth="0.5" />
                <line x1="38" y1="30" x2="60" y2="30" stroke="#00e5ff" strokeWidth="0.5" />
                <circle cx="30" cy="30" r="25" stroke="#00e5ff" strokeWidth="0.5" fill="none" />
                <circle cx="30" cy="30" r="4" stroke="#00e5ff" strokeWidth="0.5" fill="none" />
                <line x1="30" y1="5" x2="30" y2="9" stroke="#00e5ff" strokeWidth="1" />
                <line x1="30" y1="51" x2="30" y2="55" stroke="#00e5ff" strokeWidth="1" />
                <line x1="5" y1="30" x2="9" y2="30" stroke="#00e5ff" strokeWidth="1" />
                <line x1="51" y1="30" x2="55" y2="30" stroke="#00e5ff" strokeWidth="1" />
              </svg>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ position: "absolute", top: "-10px", left: "-10px", opacity: 0.1, animation: "reticle-spin 30s linear infinite" }}>
                <circle cx="40" cy="40" r="36" stroke="#00e5ff" strokeWidth="0.5" strokeDasharray="6 10" fill="none" />
              </svg>
            </div>

            <div className="absolute left-1/2 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-cyan)", opacity: 0.6, bottom: "58px", transform: "translateX(calc(-50% + 120px))" }}>
              SELECT TARGET BUILDING TO PROCEED
            </div>

            <div className="absolute bottom-4 left-1/2 flex items-center gap-6 text-xs tracking-widest" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-dim)", transform: "translateX(calc(-50% + 120px))" }}>
              <span>LAT {coords.lat}° N</span>
              <span style={{ color: "var(--color-accent-cyan)", opacity: 0.3 }}>|</span>
              <span>LON {coords.lng}° W</span>
              <span style={{ color: "var(--color-accent-cyan)", opacity: 0.3 }}>|</span>
              <span>ALT {coords.alt} KM</span>
            </div>

            <div className="absolute bottom-4 right-10 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-dim)" }}>
              TARGETS: {PRELOADED_BUILDINGS.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hoveredBuildingData && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.15 }}
            className="pointer-events-none absolute glow-cyan-box px-4 py-3 text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-cyan)", backgroundColor: "rgba(10, 10, 10, 0.92)", border: "1px solid rgba(0, 229, 255, 0.25)", borderRadius: "3px", top: "100px", left: "50%", transform: "translateX(-50%)", zIndex: 30 }}
          >
            <span className="glow-cyan" style={{ letterSpacing: "0.1em" }}>TARGET: {hoveredBuildingData.name.toUpperCase()}</span>
            <span className="block mt-1" style={{ color: "var(--color-text-dim)" }}>{hoveredBuildingData.lat.toFixed(4)}°N, {hoveredBuildingData.lng.toFixed(4)}°W | CLICK TO SELECT</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectingBuilding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", zIndex: 50 }}>
            <div className="glow-cyan-box px-8 py-4 text-sm text-center" style={{ fontFamily: "var(--font-mono)", backgroundColor: "rgba(10, 10, 10, 0.95)", border: "1px solid rgba(0, 229, 255, 0.3)", borderRadius: "3px" }}>
              <span className="glow-cyan cursor-blink" style={{ color: "var(--color-accent-cyan)" }}>ESTABLISHING SECURE LINK</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", zIndex: 60 }}>
            <div className="glow-cyan-box px-8 py-6 text-sm text-center max-w-md" style={{ fontFamily: "var(--font-mono)", backgroundColor: "rgba(10, 10, 10, 0.95)", border: "1px solid rgba(255, 60, 60, 0.4)", borderRadius: "3px" }}>
              <span className="block text-xs tracking-[0.3em] mb-2" style={{ color: "#ff3c3c" }}>⚠ SYSTEM ERROR</span>
              <span style={{ color: "var(--color-text)" }}>{error}</span>
              <button onClick={() => setError(null)} className="block mx-auto mt-4 px-4 py-1 text-xs tracking-wider cursor-pointer hud-button" style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-cyan)", border: "1px solid rgba(0, 229, 255, 0.3)", backgroundColor: "transparent", borderRadius: "2px" }}>
                DISMISS
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MissionClock() {
  const [time, setTime] = useState(formatTime());

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="glow-green" style={{ color: "var(--color-accent-green)" }}>{time} UTC</span>
  );
}

function formatTime(): string {
  const now = new Date();
  return now.toISOString().replace("T", " ").slice(0, 19);
}
