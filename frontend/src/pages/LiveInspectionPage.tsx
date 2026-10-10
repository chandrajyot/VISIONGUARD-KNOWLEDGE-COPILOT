import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Camera, Play, Square, AlertTriangle, ArrowRight, Zap } from "lucide-react";

interface DefectItem {
  id: string;
  type: string;
  confidence: number;
  line: string;
  camera: string;
  coords: string;
  xRatio: number; // 0 to 1
  yRatio: number; // 0 to 1
  wRatio: number;
  hRatio: number;
  color: string; // "red" | "orange" | "blue"
  desc: string;
  time: string;
}

export const LiveInspectionPage: React.FC = () => {
  const [isInspecting, setIsInspecting] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState("CAM-STAMP-01");
  const [webcamActive, setWebcamActive] = useState(false);
  const [fps, setFps] = useState(60);
  const [inferenceLatency, setInferenceLatency] = useState(8.4);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active detected defect
  const [activeDefect, setActiveDefect] = useState<DefectItem>({
    id: "DEF-2026-0941",
    type: "Surface Crack",
    confidence: 0.942,
    line: "LINE-A",
    camera: "CAM-STAMP-01",
    coords: "[X:140 Y:220 W:310 H:85]",
    xRatio: 0.3,
    yRatio: 0.28,
    wRatio: 0.4,
    hRatio: 0.32,
    color: "red",
    desc: "Detected on Line A HydroPress sheet feed. Surface micro-cracking threshold exceeded.",
    time: "Just Now",
  });

  // Dynamic Trigger Log
  const [defectLogs, setDefectLogs] = useState<DefectItem[]>([
    {
      id: "DEF-2026-0941",
      type: "Surface Crack",
      confidence: 0.942,
      line: "LINE-A",
      camera: "CAM-STAMP-01",
      coords: "[X:140 Y:220 W:310 H:85]",
      xRatio: 0.3,
      yRatio: 0.28,
      wRatio: 0.4,
      hRatio: 0.32,
      color: "red",
      desc: "Detected on Line A HydroPress sheet feed. Bounding box threshold exceeded.",
      time: "Just Now",
    },
    {
      id: "DEF-2026-0938",
      type: "Porosity Void",
      confidence: 0.88,
      line: "LINE-B",
      camera: "CAM-WELD-02",
      coords: "[X:80 Y:110 W:180 H:180]",
      xRatio: 0.15,
      yRatio: 0.15,
      wRatio: 0.32,
      hRatio: 0.42,
      color: "orange",
      desc: "Line B Laser Weld inspection trigger. Mild voiding detected.",
      time: "3 hrs ago",
    },
  ]);

  // Webcam Stream Handler
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (selectedCamera === "CAM-WEBCAM" && isInspecting) {
      navigator.mediaDevices
        .getUserMedia({ video: { width: 1280, height: 720 } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
          setWebcamActive(true);
        })
        .catch((err) => {
          console.warn("Webcam access declined or not available:", err);
          setWebcamActive(false);
        });
    } else {
      setWebcamActive(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedCamera, isInspecting]);

  // Optical Canvas Animation Loop for Simulated Metallic Sheet Stream
  useEffect(() => {
    if (!isInspecting || webcamActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const render = () => {
      offset = (offset + 2) % 60;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw Metallic Sheet Background
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(0.5, "#1e293b");
      grad.addColorStop(1, "#0f172a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // 2. Moving Steel Sheet Grain Lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      for (let y = -60 + offset; y < h; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y + 20);
        ctx.stroke();
      }

      // 3. Grid overlay
      ctx.strokeStyle = "rgba(49, 107, 250, 0.12)";
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // 4. Draw Defect Pattern on Metallic Surface
      const boxX = activeDefect.xRatio * w;
      const boxY = activeDefect.yRatio * h;
      const boxW = activeDefect.wRatio * w;
      const boxH = activeDefect.hRatio * h;

      if (activeDefect.color === "red") {
        // Jagged crack paths
        ctx.strokeStyle = "#F04444";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(boxX + boxW * 0.2, boxY + boxH * 0.3);
        ctx.lineTo(boxX + boxW * 0.45, boxY + boxH * 0.6);
        ctx.lineTo(boxX + boxW * 0.6, boxY + boxH * 0.4);
        ctx.lineTo(boxX + boxW * 0.85, boxY + boxH * 0.7);
        ctx.stroke();
      } else if (activeDefect.color === "orange") {
        // Porosity dots
        ctx.fillStyle = "#F59E0B";
        const dots = [
          { x: 0.3, y: 0.4, r: 4 },
          { x: 0.5, y: 0.5, r: 6 },
          { x: 0.7, y: 0.35, r: 3 },
          { x: 0.4, y: 0.7, r: 5 },
        ];
        dots.forEach((d) => {
          ctx.beginPath();
          ctx.arc(boxX + d.x * boxW, boxY + d.y * boxH, d.r, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // Dimension skew line
        ctx.strokeStyle = "#316BFA";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(boxX + 4, boxY + 4, boxW - 8, boxH - 8);
        ctx.setLineDash([]);
      }

      // 5. Laser Scan Line
      const scanY = (offset * 8) % h;
      const scanGrad = ctx.createLinearGradient(0, scanY - 10, 0, scanY + 10);
      scanGrad.addColorStop(0, "rgba(49, 107, 250, 0)");
      scanGrad.addColorStop(0.5, "rgba(49, 107, 250, 0.8)");
      scanGrad.addColorStop(1, "rgba(49, 107, 250, 0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 5, w, 10);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isInspecting, webcamActive, activeDefect]);

  // Random FPS micro-fluctuation for realism
  useEffect(() => {
    if (!isInspecting) return;
    const interval = setInterval(() => {
      setFps(Math.round(59.2 + Math.random() * 1.6));
      setInferenceLatency(Math.round((7.8 + Math.random() * 1.5) * 10) / 10);
    }, 1500);
    return () => clearInterval(interval);
  }, [isInspecting]);

  const triggerManualDefect = (defectType: "crack" | "porosity" | "skew") => {
    setIsInspecting(true); // Ensure live feed is active

    let newDefect: DefectItem;
    if (defectType === "crack") {
      newDefect = {
        id: `DEF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        type: "Surface Crack",
        confidence: 0.942,
        line: "LINE-A",
        camera: selectedCamera,
        coords: "[X:140 Y:220 W:310 H:85]",
        xRatio: 0.28,
        yRatio: 0.25,
        wRatio: 0.44,
        hRatio: 0.35,
        color: "red",
        desc: "High shear stress surface micro-cracking detected on chassis beam.",
        time: "Just Now",
      };
    } else if (defectType === "porosity") {
      newDefect = {
        id: `DEF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        type: "Porosity Void",
        confidence: 0.884,
        line: "LINE-B",
        camera: selectedCamera,
        coords: "[X:80 Y:110 W:180 H:180]",
        xRatio: 0.15,
        yRatio: 0.18,
        wRatio: 0.32,
        hRatio: 0.45,
        color: "orange",
        desc: "Micro-void porosity cluster detected along weld joint.",
        time: "Just Now",
      };
    } else {
      newDefect = {
        id: `DEF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        type: "Dimension Skew",
        confidence: 0.915,
        line: "LINE-A",
        camera: selectedCamera,
        coords: "[X:260 Y:150 W:220 H:110]",
        xRatio: 0.45,
        yRatio: 0.4,
        wRatio: 0.38,
        hRatio: 0.35,
        color: "blue",
        desc: "HydroPress die gap margin offset +0.12mm threshold.",
        time: "Just Now",
      };
    }

    setActiveDefect(newDefect);
    setDefectLogs((prev) => [newDefect, ...prev.slice(0, 4)]);
  };

  const getColorClasses = (color: string) => {
    if (color === "red") {
      return {
        border: "border-defectRed",
        bg: "bg-defectRed/15",
        tagBg: "bg-defectRed",
        text: "text-defectRed",
        glow: "shadow-defectRed/40",
      };
    } else if (color === "orange") {
      return {
        border: "border-warningOrange",
        bg: "bg-warningOrange/15",
        tagBg: "bg-warningOrange",
        text: "text-warningOrange",
        glow: "shadow-warningOrange/40",
      };
    } else {
      return {
        border: "border-primaryBlue",
        bg: "bg-primaryBlue/15",
        tagBg: "bg-primaryBlue",
        text: "text-primaryBlue",
        glow: "shadow-primaryBlue/40",
      };
    }
  };

  const currentTheme = getColorClasses(activeDefect.color);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-textPrimary tracking-tight">Live Computer Vision Inspection</h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Real-time optical camera defect inference using YOLOv8 Industrial Detection Models.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-bgCard border border-borderDark px-2.5 py-1.5 rounded-lg text-xs">
            <Camera className="w-3.5 h-3.5 text-primaryBlue" />
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="bg-transparent text-textPrimary focus:outline-none cursor-pointer font-medium"
            >
              <option value="CAM-STAMP-01" className="bg-bgCard">CAM-01 • Line A Stamping Feed</option>
              <option value="CAM-WELD-02" className="bg-bgCard">CAM-02 • Line B Laser Weld Feed</option>
              <option value="CAM-WEBCAM" className="bg-bgCard">CAM-03 • Live Web Camera Input</option>
            </select>
          </div>

          <button
            onClick={() => setIsInspecting(!isInspecting)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all shadow-md ${
              isInspecting
                ? "bg-defectRed/20 text-defectRed border border-defectRed/40 hover:bg-defectRed/30"
                : "bg-successGreen text-white hover:bg-successGreen/90 shadow-successGreen/20"
            }`}
          >
            {isInspecting ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isInspecting ? "Pause Stream" : "Start Live Feed"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Feed Viewport */}
        <div className="lg:col-span-2 bg-bgCard border border-borderDark rounded-xl p-4 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-textSecondary font-mono border-b border-borderDark pb-2">
            <span className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isInspecting ? "bg-successGreen animate-ping" : "bg-defectRed"}`}></span>
              <span className="font-bold text-textPrimary">{selectedCamera}</span> • 1080p @ {isInspecting ? fps : 0} FPS
            </span>
            <span className="text-primaryBlue font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> YOLOv8-Industrial ({inferenceLatency}ms)
            </span>
          </div>

          {/* Stream Canvas / Webcam Viewport */}
          <div className="relative w-full h-96 bg-black rounded-lg flex items-center justify-center border border-borderDark/80 overflow-hidden shadow-inner">
            {/* Webcam HTML5 Video */}
            {selectedCamera === "CAM-WEBCAM" && (
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${!isInspecting ? "opacity-30 filter grayscale" : ""}`}
                playsInline
                muted
              />
            )}

            {/* Simulated Animated Canvas */}
            {selectedCamera !== "CAM-WEBCAM" && (
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className={`w-full h-full object-cover ${!isInspecting ? "opacity-30 filter grayscale" : ""}`}
              />
            )}

            {/* YOLOv8 Reticle & Bounding Box Overlay */}
            {isInspecting && (
              <div
                className={`absolute border-2 ${currentTheme.border} ${currentTheme.bg} rounded transition-all duration-300 flex flex-col justify-between p-2 shadow-xl ${currentTheme.glow} z-20`}
                style={{
                  top: `${activeDefect.yRatio * 100}%`,
                  left: `${activeDefect.xRatio * 100}%`,
                  width: `${activeDefect.wRatio * 100}%`,
                  height: `${activeDefect.hRatio * 100}%`,
                }}
              >
                {/* Corner bracket styling */}
                <span className={`absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 ${currentTheme.border}`}></span>
                <span className={`absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 ${currentTheme.border}`}></span>
                <span className={`absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 ${currentTheme.border}`}></span>
                <span className={`absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 ${currentTheme.border}`}></span>

                <div className={`flex items-center justify-between ${currentTheme.tagBg} text-white text-[10px] font-bold px-2 py-0.5 rounded w-max shadow font-mono`}>
                  <span>{activeDefect.type} • {Math.round(activeDefect.confidence * 100)}%</span>
                </div>
                <div className={`text-[9px] ${currentTheme.text} font-mono font-bold self-end bg-black/80 px-1.5 py-0.5 rounded border border-borderDark`}>
                  {activeDefect.coords}
                </div>
              </div>
            )}

            {/* Paused Overlay */}
            {!isInspecting && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-textSecondary text-xs space-y-3 z-30 backdrop-blur-xs">
                <div className="w-12 h-12 rounded-full bg-bgCard border border-borderDark flex items-center justify-center text-textSecondary">
                  <Camera className="w-6 h-6 opacity-60" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-bold text-textPrimary text-sm">Camera Optical Stream Paused</p>
                  <p className="text-[11px] text-textSecondary">Click "Start Live Feed" to resume real-time YOLOv8 optical inference.</p>
                </div>
                <button
                  onClick={() => setIsInspecting(true)}
                  className="px-4 py-2 bg-primaryBlue text-white text-xs font-medium rounded-lg hover:bg-primaryBlue/90 transition-all shadow-lg shadow-primaryBlue/20 flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume Inspection Stream</span>
                </button>
              </div>
            )}
          </div>

          {/* Test Defect Injection Toolbar */}
          <div className="flex items-center justify-between pt-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-textSecondary text-[11px] font-medium shrink-0">Inject Test Defect:</span>
              <button
                onClick={() => triggerManualDefect("crack")}
                className="px-3 py-1.5 rounded-lg bg-defectRed/20 border border-defectRed/40 text-defectRed hover:bg-defectRed/30 font-medium transition-all font-mono text-[11px]"
              >
                Surface Crack (94%)
              </button>
              <button
                onClick={() => triggerManualDefect("porosity")}
                className="px-3 py-1.5 rounded-lg bg-warningOrange/20 border border-warningOrange/40 text-warningOrange hover:bg-warningOrange/30 font-medium transition-all font-mono text-[11px]"
              >
                Porosity Void (88%)
              </button>
              <button
                onClick={() => triggerManualDefect("skew")}
                className="px-3 py-1.5 rounded-lg bg-primaryBlue/20 border border-primaryBlue/40 text-primaryBlue hover:bg-primaryBlue/30 font-medium transition-all font-mono text-[11px]"
              >
                Dimension Skew (91%)
              </button>
            </div>
            <span className="text-[11px] text-textSecondary font-mono hidden md:inline">
              Res: 1920x1080 • Color: RAW12
            </span>
          </div>
        </div>

        {/* Real-time Defect Trigger Log */}
        <div className="bg-bgCard border border-borderDark rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-borderDark pb-3">
              <h3 className="text-sm font-bold text-textPrimary">Defect Trigger Log</h3>
              <span className="text-xs text-successGreen font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-successGreen animate-pulse"></span>
                Live Session
              </span>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {defectLogs.map((item, idx) => {
                const theme = getColorClasses(item.color);
                return (
                  <div key={item.id + idx} className={`p-3.5 bg-bgSidebar border ${theme.border}/40 rounded-xl space-y-2 hover:border-primaryBlue transition-all shadow-xs`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold ${theme.text} flex items-center gap-1.5 font-sans`}>
                        <AlertTriangle className="w-4 h-4" />
                        {item.type}
                      </span>
                      <span className="font-mono text-[11px] text-textSecondary">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-textSecondary leading-relaxed">{item.desc}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-textSecondary pt-2 border-t border-borderDark/60">
                      <span>Conf: {Math.round(item.confidence * 100)}%</span>
                      <Link
                        to={`/copilot?incident=${item.id}&line=${item.line}`}
                        className="text-primaryBlue hover:underline font-semibold flex items-center gap-1"
                      >
                        Investigate in Copilot <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-borderDark text-[11px] text-textSecondary flex items-center justify-between font-mono">
            <span>Model: YOLOv8-Industrial</span>
            <span className="text-successGreen">Sub-10ms Inference</span>
          </div>
        </div>
      </div>
    </div>
  );
};
