import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PRELOADED_BUILDINGS } from "@/lib/buildings";
import type { Building } from "@/lib/types";
import GlobeSidebar from "@/components/GlobeSidebar";
import GlobeStatusBar from "@/components/GlobeStatusBar";
import StreetLevelHUD from "@/components/StreetLevelHUD";
import ComicSimulation from "@/components/ComicSimulation";

const WEST_LAFAYETTE = { lat: 40.4259, lng: -86.9081 };

interface PlacedCamera {
  id: string;
  lat: number;
  lng: number;
  height: number;
}

interface ComicFrame {
  id: number;
  imageUrl: string;
  caption: string;
  status: "generating" | "done";
}

interface CursorCoords {
  lat: string;
  lng: string;
  alt: string;
}

export default function GlobeView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const cesiumRef = useRef<any>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [coords, setCoords] = useState<CursorCoords>({ lat: "40.4274", lng: "-86.9167", alt: "800" });
  const [zoomedIn, setZoomedIn] = useState(false);

  // Street-level mode
  const [streetLevel, setStreetLevel] = useState(false);
  const [activeBuilding, setActiveBuilding] = useState<Building | null>(null);
  const [placingCamera, setPlacingCamera] = useState(false);
  const [placedCameras, setPlacedCameras] = useState<PlacedCamera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<PlacedCamera | null>(null);

  // Comic simulation
  const [isSimulating, setIsSimulating] = useState(false);
  const [comicFrames, setComicFrames] = useState<ComicFrame[]>([]);
  const [comicPrompt, setComicPrompt] = useState("");
  const [showComic, setShowComic] = useState(false);

  // Refs for state in event handlers
  const placingCameraRef = useRef(false);
  const streetLevelRef = useRef(false);
  placingCameraRef.current = placingCamera;
  streetLevelRef.current = streetLevel;

  const handleBuildingSelect = useCallback((building: Building) => {
    const v = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!v || !Cesium) return;

    setActiveBuilding(building);
    setPlacedCameras([]);
    setSelectedCamera(null);

    // Fly to street level near building
    v.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(building.lng + 0.0005, building.lat - 0.0003, 5),
      orientation: {
        heading: Cesium.Math.toRadians(30),
        pitch: Cesium.Math.toRadians(-5),
        roll: 0,
      },
      duration: 2,
      complete: () => {
        setStreetLevel(true);
      },
    });
  }, []);

  const handleExitStreetLevel = useCallback(() => {
    const v = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!v || !Cesium) return;

    setStreetLevel(false);
    setActiveBuilding(null);
    setPlacingCamera(false);
    setSelectedCamera(null);
    setPlacedCameras([]);

    // Remove placed camera entities
    const toRemove: any[] = [];
    v.entities.values.forEach((e: any) => {
      if (e.id && typeof e.id === "string" && e.id.startsWith("placed-cam-")) {
        toRemove.push(e);
      }
    });
    toRemove.forEach((e: any) => v.entities.remove(e));

    // Fly back to campus view
    v.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-86.9130, 40.4265, 1200),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0,
      },
      duration: 2,
    });
  }, []);

  const handleCameraClick = useCallback((cam: PlacedCamera | null) => {
    setSelectedCamera(cam);
  }, []);

  const handleSimulate = useCallback(async (prompt: string) => {
    setIsSimulating(true);
    setComicPrompt(prompt);
    setShowComic(true);
    setComicFrames([]);
    setSelectedCamera(null);

    // Parse the scenario into 4-6 frames
    const frameDescriptions = generateFrameDescriptions(prompt);

    // Generate frames one at a time
    for (let i = 0; i < frameDescriptions.length; i++) {
      const frameId = Date.now() + i;
      // Add placeholder
      setComicFrames(prev => [...prev, { id: frameId, imageUrl: "", caption: frameDescriptions[i], status: "generating" }]);

        // Generate frame image (uses canvas fallback for now, can be replaced with AI)
        const imageUrl = createFallbackFrame(frameDescriptions[i], i);
        await new Promise(r => setTimeout(r, 800 + Math.random() * 400)); // Simulate generation time
        setComicFrames(prev => prev.map(f => f.id === frameId ? { ...f, imageUrl, status: "done" as const } : f));
        console.error("Frame generation failed:", err);
        // Use a fallback placeholder
        setComicFrames(prev => prev.map(f => f.id === frameId ? { ...f, imageUrl: createFallbackFrame(frameDescriptions[i], i), status: "done" as const } : f));
      }
    }

    setIsSimulating(false);
  }, [activeBuilding]);

  useEffect(() => {
    if (!containerRef.current) return;
    let viewer: any = null;
    let destroyed = false;

    async function initCesium() {
      try {
        const Cesium = await import("cesium");
        cesiumRef.current = Cesium;

        (window as any).CESIUM_BASE_URL = "https://cesium.com/downloads/cesiumjs/releases/1.140/Build/Cesium/";

        const ionToken = import.meta.env.VITE_CESIUM_ION_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlOTg2MjNiOS1mN2E2LTRjNGMtOTQzZC1hZjAxZDM0NGQ1MGMiLCJpZCI6MzYzNTY2LCJpYXQiOjE3NjQwNDM1ODJ9.fBcYO6QztbNm7zHEYQ8KrAp7urIKkT4ac4hBNeq2fvM";
        Cesium.Ion.defaultAccessToken = ionToken;

        if (destroyed || !containerRef.current) return;

        const v = new Cesium.Viewer(containerRef.current, {
          animation: false, baseLayerPicker: false, fullscreenButton: false,
          geocoder: false, homeButton: false, infoBox: false,
          sceneModePicker: false, selectionIndicator: false, timeline: false,
          navigationHelpButton: false, scene3DOnly: true, baseLayer: false,
          skyBox: false, skyAtmosphere: false,
          contextOptions: { webgl: { alpha: true } },
          requestRenderMode: false, maximumRenderTimeChange: Infinity,
        });

        viewer = v;
        viewerRef.current = v;

        // Imagery
        const imageryLayer = v.imageryLayers.addImageryProvider(
          await Cesium.IonImageryProvider.fromAssetId(2)
        );
        imageryLayer.brightness = 0.6;
        imageryLayer.contrast = 1.15;
        imageryLayer.saturation = 0.4;
        imageryLayer.gamma = 0.85;

        v.scene.backgroundColor = Cesium.Color.fromCssColorString("#060608");
        v.scene.globe.baseColor = Cesium.Color.fromCssColorString("#0a0c10");
        v.scene.fog.enabled = false;
        v.scene.globe.showGroundAtmosphere = false;
        v.scene.globe.enableLighting = true;
        if (v.scene.sun) v.scene.sun.show = false;
        if (v.scene.moon) v.scene.moon.show = false;

        // 3D buildings tileset
        try {
          const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(96188);
          v.scene.primitives.add(tileset);
        } catch (e) {
          console.warn("[Globe] Could not load 3D buildings:", e);
        }

        // Start zoomed out
        v.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(-86.9081, 40.4259, 20_000_000),
          orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
        });

        // West Lafayette marker (billboard)
        const cityPosition = Cesium.Cartesian3.fromDegrees(WEST_LAFAYETTE.lng, WEST_LAFAYETTE.lat, 0);
        const markerCanvas = document.createElement("canvas");
        markerCanvas.width = 200;
        markerCanvas.height = 80;
        const ctx = markerCanvas.getContext("2d")!;
        ctx.beginPath();
        ctx.arc(100, 30, 18, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(249, 115, 22, 0.3)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(100, 30, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#f97316";
        ctx.fill();
        ctx.font = "bold 16px 'Roboto Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "#f97316";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 4;
        ctx.strokeText("WEST LAFAYETTE", 100, 70);
        ctx.fillText("WEST LAFAYETTE", 100, 70);

        v.entities.add({
          id: "west-lafayette-marker",
          name: "West Lafayette",
          position: cityPosition,
          billboard: {
            image: markerCanvas,
            width: 200, height: 80,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            scaleByDistance: new Cesium.NearFarScalar(1e4, 2.0, 2e7, 0.8),
          },
        });

        v.entities.add({
          id: "west-lafayette-ring",
          position: cityPosition,
          ellipse: {
            semiMajorAxis: 5000, semiMinorAxis: 5000,
            material: Cesium.Color.fromCssColorString("#f97316").withAlpha(0.08),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString("#f97316").withAlpha(0.4),
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          },
        });

        // Building markers
        for (const building of PRELOADED_BUILDINGS) {
          const position = Cesium.Cartesian3.fromDegrees(building.lng, building.lat, 80);
          v.entities.add({
            id: building.id,
            name: building.name,
            position,
            show: false,
            point: {
              pixelSize: 18,
              color: Cesium.Color.fromCssColorString("#00e5ff"),
              outlineColor: Cesium.Color.fromCssColorString("#00e5ff").withAlpha(0.4),
              outlineWidth: 10,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
              text: building.name.toUpperCase(),
              font: "bold 13px 'Space Mono', monospace",
              fillColor: Cesium.Color.fromCssColorString("#00e5ff"),
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 3,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -24),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
          });

          v.entities.add({
            id: `${building.id}-ring`,
            position,
            show: false,
            ellipse: {
              semiMajorAxis: 40, semiMinorAxis: 40,
              material: Cesium.Color.fromCssColorString("#00e5ff").withAlpha(0.08),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString("#00e5ff").withAlpha(0.3),
              outlineWidth: 1,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
          });
        }

        // Zoom to campus function
        function zoomToCampus() {
          const cityEntity = v.entities.getById("west-lafayette-marker");
          const cityRing = v.entities.getById("west-lafayette-ring");
          if (cityEntity) cityEntity.show = false;
          if (cityRing) cityRing.show = false;

          for (const building of PRELOADED_BUILDINGS) {
            const entity = v.entities.getById(building.id);
            const ring = v.entities.getById(`${building.id}-ring`);
            if (entity) entity.show = true;
            if (ring) ring.show = true;
          }

          v.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(-86.9130, 40.4265, 1200),
            orientation: {
              heading: Cesium.Math.toRadians(0),
              pitch: Cesium.Math.toRadians(-45),
              roll: 0,
            },
            duration: 3,
          });

          setZoomedIn(true);
        }

        // Click handler
        const handler = new Cesium.ScreenSpaceEventHandler(v.scene.canvas);
        handler.setInputAction((click: any) => {
          // If placing a camera, place it at the clicked position
          if (placingCameraRef.current) {
            const ray = v.camera.getPickRay(click.position);
            if (ray) {
              const cartesian = v.scene.globe.pick(ray, v.scene);
              if (cartesian) {
                const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                const lat = Cesium.Math.toDegrees(cartographic.latitude);
                const lng = Cesium.Math.toDegrees(cartographic.longitude);
                const camId = `placed-cam-${Date.now()}`;
                const newCam: PlacedCamera = { id: camId, lat, lng, height: 3 };

                // Add visual entity
                const camPosition = Cesium.Cartesian3.fromDegrees(lng, lat, 3);

                // Create camera icon canvas
                const camCanvas = document.createElement("canvas");
                camCanvas.width = 40;
                camCanvas.height = 40;
                const cctx = camCanvas.getContext("2d")!;
                // Camera body
                cctx.fillStyle = "#00e5ff";
                cctx.beginPath();
                cctx.roundRect(8, 12, 24, 16, 3);
                cctx.fill();
                // Lens
                cctx.beginPath();
                cctx.arc(20, 20, 6, 0, Math.PI * 2);
                cctx.strokeStyle = "#000";
                cctx.lineWidth = 2;
                cctx.stroke();
                cctx.fillStyle = "#000";
                cctx.fill();
                cctx.beginPath();
                cctx.arc(20, 20, 3, 0, Math.PI * 2);
                cctx.fillStyle = "#00e5ff";
                cctx.fill();
                // Glow
                cctx.shadowColor = "#00e5ff";
                cctx.shadowBlur = 8;
                cctx.beginPath();
                cctx.arc(20, 20, 2, 0, Math.PI * 2);
                cctx.fillStyle = "#fff";
                cctx.fill();

                v.entities.add({
                  id: camId,
                  name: `Security Camera`,
                  position: camPosition,
                  billboard: {
                    image: camCanvas,
                    width: 40,
                    height: 40,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  },
                  label: {
                    text: `CAM-${String(placedCameras.length + 1).padStart(2, "0")}`,
                    font: "bold 11px monospace",
                    fillColor: Cesium.Color.fromCssColorString("#00e5ff"),
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    verticalOrigin: Cesium.VerticalOrigin.TOP,
                    pixelOffset: new Cesium.Cartesian2(0, 22),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  },
                });

                setPlacedCameras(prev => [...prev, newCam]);
                return;
              }
            }
          }

          // Normal click: drill pick for entities
          const pickedObjects = v.scene.drillPick(click.position);
          for (const picked of pickedObjects) {
            if (Cesium.defined(picked) && picked.id && picked.id.id) {
              if (picked.id.id === "west-lafayette-marker") {
                zoomToCampus();
                return;
              }
              // Check placed cameras
              if (typeof picked.id.id === "string" && picked.id.id.startsWith("placed-cam-")) {
                const cam = placedCameras.find(c => c.id === picked.id.id);
                if (cam) {
                  setSelectedCamera(cam);
                  return;
                }
              }
              // Check buildings
              const building = PRELOADED_BUILDINGS.find(b => b.id === picked.id.id);
              if (building) {
                handleBuildingSelect(building);
                return;
              }
            }
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // Hover handler
        handler.setInputAction((movement: any) => {
          const pickedObjects = v.scene.drillPick(movement.endPosition);
          let found = false;
          for (const picked of pickedObjects) {
            if (Cesium.defined(picked) && picked.id && picked.id.id) {
              if (picked.id.id === "west-lafayette-marker") {
                containerRef.current!.style.cursor = "pointer";
                setHoveredBuilding("west-lafayette");
                found = true;
                break;
              }
              if (typeof picked.id.id === "string" && picked.id.id.startsWith("placed-cam-")) {
                containerRef.current!.style.cursor = "pointer";
                found = true;
                break;
              }
              const building = PRELOADED_BUILDINGS.find(b => b.id === picked.id.id);
              if (building) {
                setHoveredBuilding(building.id);
                containerRef.current!.style.cursor = "pointer";
                found = true;
                break;
              }
            }
          }
          if (!found) {
            setHoveredBuilding(null);
            if (containerRef.current) {
              containerRef.current.style.cursor = placingCameraRef.current ? "crosshair" : "default";
            }
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // Camera position tracking
        v.camera.changed.addEventListener(() => {
          const cartographic = v.camera.positionCartographic;
          setCoords({
            lat: Cesium.Math.toDegrees(cartographic.latitude).toFixed(4),
            lng: Cesium.Math.toDegrees(cartographic.longitude).toFixed(4),
            alt: (cartographic.height / 1000).toFixed(cartographic.height < 1000 ? 3 : 0),
          });
        });

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

  // Update cursor when placing camera mode changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.cursor = placingCamera ? "crosshair" : "default";
    }
  }, [placingCamera]);

  const hoveredBuildingData = hoveredBuilding
    ? PRELOADED_BUILDINGS.find(b => b.id === hoveredBuilding)
    : null;
  const isHoveringCity = hoveredBuilding === "west-lafayette";

  return (
    <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: "var(--color-bg)" }}>
      <div ref={containerRef} className="absolute inset-0" style={{ backgroundColor: "#0a0a0a" }} />

      {/* Campus chrome (sidebar + status bar) — only when zoomed in but NOT street level */}
      <AnimatePresence>
        {ready && zoomedIn && !streetLevel && (
          <motion.div key="chrome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="absolute inset-0" style={{ zIndex: 25, pointerEvents: "none" }}>
            <div style={{ pointerEvents: "auto" }}>
              <GlobeSidebar onBuildingSelect={handleBuildingSelect} />
            </div>
            <GlobeStatusBar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Street-level HUD */}
      <AnimatePresence>
        {streetLevel && activeBuilding && (
          <motion.div key="street-hud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StreetLevelHUD
              buildingName={activeBuilding.name}
              onExitStreetLevel={handleExitStreetLevel}
              placingCamera={placingCamera}
              onTogglePlaceCamera={() => setPlacingCamera(p => !p)}
              cameras={placedCameras}
              onCameraClick={handleCameraClick}
              selectedCamera={selectedCamera}
              onSimulate={handleSimulate}
              isSimulating={isSimulating}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comic simulation overlay */}
      <AnimatePresence>
        {showComic && (
          <ComicSimulation
            frames={comicFrames}
            prompt={comicPrompt}
            isGenerating={isSimulating}
            onClose={() => { setShowComic(false); setComicFrames([]); }}
          />
        )}
      </AnimatePresence>

      {/* HUD overlays (non-street-level) */}
      <AnimatePresence>
        {ready && !streetLevel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.5 }} className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-0 right-0 flex items-center justify-center py-2" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)" }}>
              <span className="glow-cyan text-xs tracking-[0.5em] uppercase" style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-cyan)" }}>
                CONFIDENTIAL // OMNISIGHT PLATFORM
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

            {!zoomedIn && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 text-center"
                style={{ fontFamily: "var(--font-mono)", transform: "translate(-50%, 200px)" }}>
                <span className="text-xs tracking-[0.3em] uppercase" style={{ color: "#f97316" }}>
                  ▶ CLICK WEST LAFAYETTE MARKER TO BEGIN
                </span>
              </motion.div>
            )}

            {zoomedIn && (
              <>
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
                  </svg>
                </div>

                <div className="absolute left-1/2 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-cyan)", opacity: 0.6, bottom: "58px", transform: "translateX(calc(-50% + 120px))" }}>
                  CLICK A BUILDING TO ENTER STREET VIEW
                </div>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 flex items-center gap-6 text-xs tracking-widest" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-dim)", transform: "translateX(calc(-50% + 120px))" }}>
              <span>LAT {coords.lat}° N</span>
              <span style={{ color: "var(--color-accent-cyan)", opacity: 0.3 }}>|</span>
              <span>LON {coords.lng}° W</span>
              <span style={{ color: "var(--color-accent-cyan)", opacity: 0.3 }}>|</span>
              <span>ALT {coords.alt} KM</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover tooltips */}
      <AnimatePresence>
        {isHoveringCity && !streetLevel && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="pointer-events-none absolute glow-cyan-box px-4 py-3 text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "#f97316", backgroundColor: "rgba(10, 10, 10, 0.92)", border: "1px solid rgba(249, 115, 22, 0.3)", borderRadius: "3px", top: "100px", left: "50%", transform: "translateX(-50%)", zIndex: 30 }}>
            <span style={{ letterSpacing: "0.1em" }}>TARGET: WEST LAFAYETTE, IN</span>
            <span className="block mt-1" style={{ color: "var(--color-text-dim)" }}>CLICK TO ZOOM IN</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {hoveredBuildingData && !streetLevel && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="pointer-events-none absolute glow-cyan-box px-4 py-3 text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-cyan)", backgroundColor: "rgba(10, 10, 10, 0.92)", border: "1px solid rgba(0, 229, 255, 0.25)", borderRadius: "3px", top: "100px", left: "50%", transform: "translateX(-50%)", zIndex: 30 }}>
            <span className="glow-cyan" style={{ letterSpacing: "0.1em" }}>{hoveredBuildingData.name.toUpperCase()}</span>
            <span className="block mt-1" style={{ color: "var(--color-text-dim)" }}>CLICK TO ENTER STREET-LEVEL VIEW</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error overlay */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", zIndex: 60 }}>
            <div className="glow-cyan-box px-8 py-6 text-sm text-center max-w-md" style={{ fontFamily: "var(--font-mono)", backgroundColor: "rgba(10, 10, 10, 0.95)", border: "1px solid rgba(255, 60, 60, 0.4)", borderRadius: "3px" }}>
              <span className="block text-xs tracking-[0.3em] mb-2" style={{ color: "#ff3c3c" }}>⚠ SYSTEM ERROR</span>
              <span style={{ color: "var(--color-text)" }}>{error}</span>
              <button onClick={() => setError(null)} className="block mx-auto mt-4 px-4 py-1 text-xs tracking-wider cursor-pointer" style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-cyan)", border: "1px solid rgba(0, 229, 255, 0.3)", backgroundColor: "transparent", borderRadius: "2px" }}>
                DISMISS
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Helper: generate frame descriptions from a prompt ──────────────────────

function generateFrameDescriptions(prompt: string): string[] {
  // Split scenario into sequential frames
  const sentences = prompt.split(/[.!;]/).filter(s => s.trim().length > 5);
  
  if (sentences.length >= 4) {
    return sentences.slice(0, 6).map(s => s.trim());
  }
  
  // If prompt is short, generate multiple angles
  return [
    `Wide establishing shot: ${prompt}`,
    `Close-up view: The subject approaches the building entrance`,
    `Interior hallway: Movement detected through the corridor`,
    `Security angle: Subject passes through main area`,
    `Alternate camera: Capturing from opposite angle`,
    `Final frame: Subject reaches destination area`,
  ];
}

// ─── Fallback frame generator (canvas-based) ────────────────────────────────

function createFallbackFrame(caption: string, index: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext("2d")!;

  // Dark surveillance-style background
  const gradient = ctx.createLinearGradient(0, 0, 640, 360);
  gradient.addColorStop(0, "#0a0c10");
  gradient.addColorStop(1, "#111520");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 640, 360);

  // Grid lines
  ctx.strokeStyle = "rgba(0, 229, 255, 0.05)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x < 640; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 360);
    ctx.stroke();
  }
  for (let y = 0; y < 360; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(640, y);
    ctx.stroke();
  }

  // Scan lines
  for (let y = 0; y < 360; y += 2) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + Math.random() * 0.05})`;
    ctx.fillRect(0, y, 640, 1);
  }

  // Frame number
  ctx.font = "bold 14px monospace";
  ctx.fillStyle = "#00e5ff";
  ctx.fillText(`FRAME ${String(index + 1).padStart(2, "0")}`, 16, 28);

  // Timestamp
  ctx.font = "11px monospace";
  ctx.fillStyle = "rgba(0, 229, 255, 0.5)";
  const ts = new Date().toISOString().slice(0, 19).replace("T", " ");
  ctx.fillText(ts + " UTC", 640 - 200, 28);

  // Center icon (camera/surveillance)
  ctx.strokeStyle = "rgba(0, 229, 255, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(320, 160, 50, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(320, 160, 20, 0, Math.PI * 2);
  ctx.stroke();
  // Crosshair
  ctx.beginPath();
  ctx.moveTo(320, 100);
  ctx.lineTo(320, 220);
  ctx.moveTo(260, 160);
  ctx.lineTo(380, 160);
  ctx.strokeStyle = "rgba(0, 229, 255, 0.15)";
  ctx.stroke();

  // Caption text at bottom
  ctx.font = "11px monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  const maxWidth = 600;
  const words = caption.split(" ");
  let line = "";
  let yPos = 320;
  for (const word of words) {
    const testLine = line + word + " ";
    if (ctx.measureText(testLine).width > maxWidth) {
      ctx.fillText(line.trim(), 20, yPos);
      line = word + " ";
      yPos += 16;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), 20, yPos);

  // REC indicator
  ctx.fillStyle = "#ff2d2d";
  ctx.beginPath();
  ctx.arc(620, 20, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "bold 10px monospace";
  ctx.fillText("REC", 596, 24);

  return canvas.toDataURL("image/jpeg", 0.85);
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function MissionClock() {
  const [time, setTime] = useState(formatTime());
  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-cyan)", fontWeight: 700, fontSize: "12px", letterSpacing: "0.15em", fontVariantNumeric: "tabular-nums" }}>
      {time}
    </span>
  );
}

function formatTime() {
  return new Date().toISOString().slice(11, 19) + " UTC";
}
