import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Sliders,
  Ruler,
  Maximize2,
  Crosshair,
  Layers,
  Sparkles,
  Download,
  Hand,
  MousePointer,
  Check,
  ChevronDown,
  Info,
} from 'lucide-react';
import { ModelPrediction } from '../types';
import { renderGradCamOverlay, applyRadiologyFilter } from '../utils/mriEngine';

interface MriViewerProps {
  imageUrl: string;
  prediction: ModelPrediction | null;
  patientId?: string;
  sequence?: string;
  slicePlane?: string;
}

export type ViewerToolMode = 'pan' | 'zoom' | 'caliper' | 'crosshair';

export const MriViewer: React.FC<MriViewerProps> = ({
  imageUrl,
  prediction,
  patientId = 'ANON-MR-2026',
  sequence = 'T1-CE',
  slicePlane = 'Axial',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const filterCanvasRef = useRef<HTMLCanvasElement>(null);
  const camCanvasRef = useRef<HTMLCanvasElement>(null);

  // Active Tool Mode
  const [activeTool, setActiveTool] = useState<ViewerToolMode>('pan');

  // Zoom & Pan State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Grad-CAM Controls
  const [showGradCam, setShowGradCam] = useState<boolean>(true);
  const [camOpacity, setCamOpacity] = useState<number>(0.65);
  const [colormap, setColormap] = useState<'jet' | 'inferno' | 'turbo' | 'viridis'>('jet');
  const [showRoiBox, setShowRoiBox] = useState<boolean>(true);

  // Caliper Tool
  const [caliperPoints, setCaliperPoints] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [isDrawingCaliper, setIsDrawingCaliper] = useState<boolean>(false);

  // Image Processing Filters
  const [filter, setFilter] = useState<'standard' | 'contrast' | 'bone' | 'sobel' | 'invert'>('standard');
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [camMenuOpen, setCamMenuOpen] = useState<boolean>(false);

  // Redraw Base Image onto Canvas
  useEffect(() => {
    if (!imageUrl) return;
    const baseCanvas = baseCanvasRef.current;
    const filterCanvas = filterCanvasRef.current;
    const camCanvas = camCanvasRef.current;
    if (!baseCanvas || !filterCanvas || !camCanvas) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      baseCanvas.width = 400;
      baseCanvas.height = 400;
      filterCanvas.width = 400;
      filterCanvas.height = 400;
      camCanvas.width = 400;
      camCanvas.height = 400;

      const ctx = baseCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 400, 400);
        ctx.drawImage(img, 0, 0, 400, 400);
      }

      // Apply initial filter
      applyRadiologyFilter(baseCanvas, filterCanvas, filter);

      // Render Grad-CAM
      if (prediction && prediction.predictedClass !== 'no_tumor') {
        renderGradCamOverlay(
          camCanvas,
          prediction.gradCamRoi,
          showGradCam,
          colormap,
          camOpacity
        );
      } else {
        const cCtx = camCanvas.getContext('2d');
        cCtx?.clearRect(0, 0, 400, 400);
      }
    };
  }, [imageUrl]);

  // Update Filter
  useEffect(() => {
    if (baseCanvasRef.current && filterCanvasRef.current) {
      applyRadiologyFilter(baseCanvasRef.current, filterCanvasRef.current, filter);
    }
  }, [filter]);

  // Update Grad-CAM Overlay
  useEffect(() => {
    if (camCanvasRef.current && prediction) {
      if (showGradCam && prediction.predictedClass !== 'no_tumor') {
        renderGradCamOverlay(
          camCanvasRef.current,
          prediction.gradCamRoi,
          true,
          colormap,
          camOpacity
        );
      } else {
        const ctx = camCanvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, 400, 400);
      }
    }
  }, [prediction, showGradCam, colormap, camOpacity]);

  // Keyboard Shortcuts for PACS Diagnostics
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkeys when typing in inputs/textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === ' ' || e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setActiveTool('pan');
      } else if (e.key.toLowerCase() === 'z') {
        setActiveTool('zoom');
      } else if (e.key.toLowerCase() === 'c') {
        setActiveTool('caliper');
      } else if (e.key.toLowerCase() === 'x') {
        setActiveTool((prev) => (prev === 'crosshair' ? 'pan' : 'crosshair'));
      } else if (e.key.toLowerCase() === 'g') {
        setShowGradCam((prev) => !prev);
      } else if (e.key.toLowerCase() === 'r') {
        resetView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Direct Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((z) => Math.max(0.6, Math.min(4.5, parseFloat((z + zoomDelta).toFixed(2)))));
  };

  // Mouse Down Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (activeTool === 'caliper') {
      setIsDrawingCaliper(true);
      setCaliperPoints({ x1: clientX, y1: clientY, x2: clientX, y2: clientY });
    } else if (activeTool === 'zoom') {
      // Click-to-zoom
      if (e.shiftKey || e.button === 2) {
        setZoom((z) => Math.max(0.6, z - 0.3));
      } else {
        setZoom((z) => Math.min(4.5, z + 0.3));
      }
    } else {
      // Pan mode
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    setMousePos({ x: clientX, y: clientY });

    if (activeTool === 'caliper' && isDrawingCaliper && caliperPoints) {
      setCaliperPoints({ ...caliperPoints, x2: clientX, y2: clientY });
    } else if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (activeTool === 'caliper') {
      setIsDrawingCaliper(false);
    }
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCaliperPoints(null);
  };

  // Calculate Caliper Distance in mm (calibration 0.8 mm/px)
  const caliperDistanceMm = caliperPoints
    ? ((Math.hypot(caliperPoints.x2 - caliperPoints.x1, caliperPoints.y2 - caliperPoints.y1) / zoom) * 0.8).toFixed(1)
    : null;

  // Snapshot download
  const handleExportSnapshot = () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 400;
    exportCanvas.height = 400;
    const ctx = exportCanvas.getContext('2d')!;

    if (filterCanvasRef.current) {
      ctx.drawImage(filterCanvasRef.current, 0, 0);
    }
    if (showGradCam && camCanvasRef.current) {
      ctx.drawImage(camCanvasRef.current, 0, 0);
    }

    // Burn overlay text
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#00ffa3';
    ctx.fillText(`NEUROCLASS PACS: ${prediction?.label || 'ANALYSIS'} (${prediction?.confidence || 0}%)`, 16, 380);

    const link = document.createElement('a');
    link.download = `neuroclass_mri_${patientId}_${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="relative w-full h-full bg-[#050506] flex flex-col items-center justify-center select-none overflow-hidden group">
      {/* =========================================================================
          UNIFIED PACS FLOATING HUD TOOLBAR (Top-Center Dock)
          ========================================================================= */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-[#0e0e12]/90 backdrop-blur-md border border-white/[0.12] shadow-2xl font-mono text-xs">
        {/* Tool Modes */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setActiveTool('pan')}
            className={`p-1.5 transition-all flex items-center gap-1 ${
              activeTool === 'pan'
                ? 'bg-[#00ffa3]/20 text-[#00ffa3] font-semibold border border-[#00ffa3]/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
            }`}
            title="Pan Scan [Space or P]"
          >
            <Hand className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[10px]">PAN</span>
          </button>

          <button
            onClick={() => setActiveTool('zoom')}
            className={`p-1.5 transition-all flex items-center gap-1 ${
              activeTool === 'zoom'
                ? 'bg-[#00ffa3]/20 text-[#00ffa3] font-semibold border border-[#00ffa3]/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
            }`}
            title="Zoom Tool [Z]"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[10px]">ZOOM</span>
          </button>

          <button
            onClick={() => setActiveTool('caliper')}
            className={`p-1.5 transition-all flex items-center gap-1 ${
              activeTool === 'caliper'
                ? 'bg-[#00ffa3]/20 text-[#00ffa3] font-semibold border border-[#00ffa3]/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
            }`}
            title="Caliper Measurement [C]"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[10px]">CALIPER</span>
          </button>

          <button
            onClick={() => setActiveTool((prev) => (prev === 'crosshair' ? 'pan' : 'crosshair'))}
            className={`p-1.5 transition-all flex items-center gap-1 ${
              activeTool === 'crosshair'
                ? 'bg-[#00ffa3]/20 text-[#00ffa3] font-semibold border border-[#00ffa3]/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
            }`}
            title="DICOM Crosshair [X]"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[10px]">CROSS</span>
          </button>
        </div>

        <div className="h-4 w-px bg-white/[0.12] mx-1" />

        {/* Windowing Preset Selector */}
        <div className="flex items-center gap-1">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-[#141418] text-[#00ffa3] border border-white/[0.1] px-2 py-1 text-[11px] focus:outline-none cursor-pointer uppercase font-mono font-medium"
            title="Windowing / Edge Presets"
          >
            <option value="standard">Standard T1-CE</option>
            <option value="contrast">High Contrast</option>
            <option value="bone">Bone / Edge Enhance</option>
            <option value="sobel">Sobel Boundary</option>
            <option value="invert">Inverted Radiograph</option>
          </select>
        </div>

        <div className="h-4 w-px bg-white/[0.12] mx-1" />

        {/* Grad-CAM Heatmap Dropdown & Toggle */}
        <div className="relative">
          <button
            onClick={() => setCamMenuOpen(!camMenuOpen)}
            className={`px-2 py-1 text-[11px] flex items-center gap-1.5 border transition-all ${
              showGradCam
                ? 'bg-[#9d00ff]/20 text-[#d8b4fe] border-[#9d00ff]/50 font-semibold'
                : 'bg-zinc-800/40 text-zinc-400 border-white/[0.08]'
            }`}
            title="Grad-CAM Neural Attention Map Settings"
          >
            <Sparkles className="w-3 h-3 text-[#00ffa3]" />
            <span>CAM: {showGradCam ? `${Math.round(camOpacity * 100)}%` : 'OFF'}</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {camMenuOpen && (
            <div className="absolute top-full mt-1.5 left-0 w-56 bg-[#111116] border border-white/[0.12] shadow-2xl p-3 z-50 text-xs font-mono animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">Grad-CAM Overlay</span>
                <button
                  onClick={() => setShowGradCam(!showGradCam)}
                  className={`text-[10px] px-2 py-0.5 border ${
                    showGradCam
                      ? 'bg-[#00ffa3]/20 text-[#00ffa3] border-[#00ffa3]/50'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {showGradCam ? 'ACTIVE' : 'MUTED'}
                </button>
              </div>

              {/* Opacity Slider */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Opacity</span>
                  <span className="text-[#00ffa3] font-semibold">{Math.round(camOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={camOpacity}
                  onChange={(e) => setCamOpacity(parseFloat(e.target.value))}
                  className="w-full accent-[#00ffa3] h-1.5 bg-zinc-800 rounded cursor-pointer"
                />
              </div>

              {/* Colormap Selector */}
              <div className="space-y-1 mb-2">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Colormap</div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {(['jet', 'inferno', 'turbo', 'viridis'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setColormap(c)}
                      className={`px-2 py-1 text-center border uppercase transition-colors ${
                        colormap === c
                          ? 'bg-[#00ffa3]/15 text-[#00ffa3] border-[#00ffa3]/50 font-bold'
                          : 'bg-zinc-900 text-zinc-400 border-white/[0.05] hover:text-zinc-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] text-zinc-400">
                <span>ROI Bounding Box</span>
                <button
                  onClick={() => setShowRoiBox(!showRoiBox)}
                  className={`px-1.5 py-0.5 border ${
                    showRoiBox
                      ? 'text-[#00ffa3] border-[#00ffa3]/40'
                      : 'text-zinc-500 border-zinc-700'
                  }`}
                >
                  {showRoiBox ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-white/[0.12] mx-1" />

        {/* View Controls: Reset & Export */}
        <div className="flex items-center gap-1">
          <button
            onClick={resetView}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
            title="Reset View [R]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleExportSnapshot}
            className="p-1.5 text-[#00ffa3] hover:bg-[#00ffa3]/10 transition-colors"
            title="Export Diagnostic Snapshot PNG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          DICOM VIEWPORT CANVAS CONTAINER
          ========================================================================= */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full h-full flex items-center justify-center overflow-hidden ${
          activeTool === 'pan'
            ? isDragging
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : activeTool === 'caliper'
            ? 'cursor-crosshair'
            : activeTool === 'zoom'
            ? 'cursor-zoom-in'
            : 'cursor-crosshair'
        }`}
      >
        {/* Transform Stage */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.05s ease-out',
          }}
          className="relative w-[400px] h-[400px] shadow-2xl shrink-0"
        >
          {/* Base MRI Image Canvas */}
          <canvas ref={baseCanvasRef} className="hidden" />

          {/* Filter Processed Canvas */}
          <canvas
            ref={filterCanvasRef}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          {/* Grad-CAM Explainability Canvas */}
          <canvas
            ref={camCanvasRef}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          {/* Grad-CAM Heatmap Boundary ROI Box */}
          {prediction && showGradCam && showRoiBox && prediction.predictedClass !== 'no_tumor' && (
            <div
              style={{
                left: `${(prediction.gradCamRoi.x / 400) * 100}%`,
                top: `${(prediction.gradCamRoi.y / 400) * 100}%`,
                width: `${(prediction.gradCamRoi.width / 400) * 100}%`,
                height: `${(prediction.gradCamRoi.height / 400) * 100}%`,
              }}
              className="absolute border border-dashed border-[#00ffa3] pointer-events-none shadow-[0_0_12px_rgba(0,255,163,0.3)] animate-pulse"
            >
              <div className="absolute -top-5 left-0 font-mono text-[9px] bg-black/90 text-[#00ffa3] px-1 py-0.5 border border-[#00ffa3]/40 whitespace-nowrap">
                {prediction.label} ({prediction.gradCamRoi.estimatedDiameterMm}mm)
              </div>
            </div>
          )}

          {/* Caliper On-Screen Measurement Vector */}
          {caliperPoints && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
              <line
                x1={caliperPoints.x1}
                y1={caliperPoints.y1}
                x2={caliperPoints.x2}
                y2={caliperPoints.y2}
                stroke="#00ffa3"
                strokeWidth={1.5 / zoom}
                strokeDasharray="4 2"
              />
              <circle cx={caliperPoints.x1} cy={caliperPoints.y1} r={3 / zoom} fill="#00ffa3" />
              <circle cx={caliperPoints.x2} cy={caliperPoints.y2} r={3 / zoom} fill="#00ffa3" />
              {caliperDistanceMm && (
                <text
                  x={(caliperPoints.x1 + caliperPoints.x2) / 2 + 8}
                  y={(caliperPoints.y1 + caliperPoints.y2) / 2 - 8}
                  fill="#00ffa3"
                  fontSize={11 / zoom}
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="bold"
                >
                  {caliperDistanceMm} mm
                </text>
              )}
            </svg>
          )}
        </div>

        {/* Crosshair Overlay */}
        {activeTool === 'crosshair' && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <div
              className="absolute top-0 bottom-0 w-px bg-[#00ffa3]/30"
              style={{ left: `${mousePos.x}px` }}
            />
            <div
              className="absolute left-0 right-0 h-px bg-[#00ffa3]/30"
              style={{ top: `${mousePos.y}px` }}
            />
            <div
              className="absolute font-mono text-[9px] text-[#00ffa3] bg-black/80 px-1 py-0.5 border border-[#00ffa3]/30"
              style={{ left: `${mousePos.x + 8}px`, top: `${mousePos.y + 8}px` }}
            >
              X:{Math.round(mousePos.x)} Y:{Math.round(mousePos.y)}
            </div>
          </div>
        )}

        {/* =========================================================================
            CLEAN MONOSPACE DICOM CORNER TELEMETRY READOUTS (No Badge Sandwiches)
            ========================================================================= */}
        {/* Top-Left: Patient & Sequence Identifier */}
        <div className="absolute top-3 left-3 z-10 font-mono text-[10px] text-zinc-400 tracking-wider pointer-events-none space-y-0.5">
          <div className="text-zinc-100 font-bold">{patientId}</div>
          <div>{sequence} · {slicePlane}</div>
          <div className="text-zinc-500">TR: 550ms · TE: 14ms · FA: 90°</div>
        </div>

        {/* Top-Right: Zoom & Caliper Measurement */}
        <div className="absolute top-3 right-3 z-10 font-mono text-[10px] text-zinc-400 tracking-wider text-right pointer-events-none space-y-0.5">
          <div className="text-zinc-200">MAG: {(zoom * 100).toFixed(0)}%</div>
          {caliperDistanceMm ? (
            <div className="text-[#00ffa3] font-bold">CALIPER: {caliperDistanceMm} mm</div>
          ) : (
            <div className="text-zinc-500">CALIPER: INACTIVE</div>
          )}
          <div className="text-zinc-500">HOTKEYS: [Z] [C] [P] [X] [R]</div>
        </div>

        {/* Bottom-Left: DICOM Calibration & FOV */}
        <div className="absolute bottom-3 left-3 z-10 font-mono text-[10px] text-zinc-400 tracking-wider pointer-events-none space-y-0.5">
          <div>FOV: 240 x 240 mm</div>
          <div>RES: 512 x 512 · 0.8 mm/px</div>
        </div>

        {/* Bottom-Right: Window / Level & Triage Classification */}
        <div className="absolute bottom-3 right-3 z-10 font-mono text-[10px] text-zinc-400 tracking-wider text-right pointer-events-none space-y-0.5">
          <div>W/L: 450 / 120</div>
          {prediction && (
            <div
              className="font-bold tracking-widest uppercase"
              style={{ color: prediction.triageColor }}
            >
              TRIAGE: {prediction.triagePriority}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
