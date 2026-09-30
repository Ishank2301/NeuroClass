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
  Download
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

export const MriViewer: React.FC<MriViewerProps> = ({
  imageUrl,
  prediction,
  patientId = 'ANON-MR-2026',
  sequence = 'T1-CE',
  slicePlane = 'Axial'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const filterCanvasRef = useRef<HTMLCanvasElement>(null);
  const camCanvasRef = useRef<HTMLCanvasElement>(null);

  // Viewer State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Grad-CAM Controls
  const [showGradCam, setShowGradCam] = useState<boolean>(true);
  const [camOpacity, setCamOpacity] = useState<number>(0.65);
  const [colormap, setColormap] = useState<'jet' | 'inferno' | 'turbo' | 'viridis'>('jet');
  const [showRoiBox, setShowRoiBox] = useState<boolean>(true);

  // Caliper & Measurement Tool
  const [caliperActive, setCaliperActive] = useState<boolean>(false);
  const [caliperPoints, setCaliperPoints] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [isDrawingCaliper, setIsDrawingCaliper] = useState<boolean>(false);

  // Filter & Crosshair
  const [filter, setFilter] = useState<'standard' | 'contrast' | 'bone' | 'sobel' | 'invert'>('standard');
  const [showCrosshairs, setShowCrosshairs] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showScanlines, setShowScanlines] = useState<boolean>(true);
  const [showPulsingHalo, setShowPulsingHalo] = useState<boolean>(true);

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

  // Pan and Caliper Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (caliperActive) {
      setIsDrawingCaliper(true);
      setCaliperPoints({ x1: clientX, y1: clientY, x2: clientX, y2: clientY });
    } else {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    setMousePos({ x: clientX, y: clientY });

    if (caliperActive && isDrawingCaliper && caliperPoints) {
      setCaliperPoints({ ...caliperPoints, x2: clientX, y2: clientY });
    } else if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    if (caliperActive) {
      setIsDrawingCaliper(false);
    }
    setIsPanning(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCaliperPoints(null);
  };

  // Calculate Caliper Distance in mm (calibration 0.8 mm/px)
  const caliperDistanceMm = caliperPoints
    ? (Math.hypot(caliperPoints.x2 - caliperPoints.x1, caliperPoints.y2 - caliperPoints.y1) / zoom * 0.8).toFixed(1)
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
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(`NEUROCLASS: ${prediction?.label || 'ANALYSIS'} (${(prediction?.confidence ? prediction.confidence * 100 : 0).toFixed(1)}%)`, 16, 380);

    const link = document.createElement('a');
    link.download = `neuroclass_mri_${patientId}_${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="bg-[#000] overflow-hidden flex flex-col w-full h-full">
      {/* Top Precision Toolbar */}
      <div className="p-3 bg-[#080809] border-b border-[rgba(240,240,242,0.08)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className="font-semibold text-[#00ffa3] bg-[#00ffa3]/10 px-2.5 py-0.5 border border-[#00ffa3]/30 text-[11px]">
            {patientId}
          </span>
          <span className="text-[#f0f0f2]/40 text-[11px] uppercase tracking-wider">
            {slicePlane} • {sequence}
          </span>
          {prediction && (
            <span
              className="px-2 py-0.5 font-bold text-[10px] tracking-wider uppercase border border-current"
              style={{ color: prediction.triageColor, backgroundColor: `${prediction.triageColor}15` }}
            >
              {prediction.triagePriority}
            </span>
          )}
        </div>

        {/* View & Tool Buttons */}
        <div className="flex items-center gap-1.5 bg-[#111114] p-1 border border-[rgba(240,240,242,0.08)]">
          <button
            onClick={() => setZoom((z) => Math.min(3.5, z + 0.25))}
            className="p-1.5 text-[#f0f0f2]/60 hover:text-[#00ffa3] hover:bg-white/[0.05] transition"
            title="Zoom In (+)"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
            className="p-1.5 text-[#f0f0f2]/60 hover:text-[#00ffa3] hover:bg-white/[0.05] transition"
            title="Zoom Out (-)"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 text-[#f0f0f2]/60 hover:text-[#00ffa3] hover:bg-white/[0.05] transition"
            title="Reset View"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-3.5 bg-[rgba(240,240,242,0.1)] my-auto mx-0.5"></div>
          <button
            onClick={() => setCaliperActive(!caliperActive)}
            className={`p-1.5 transition ${
              caliperActive
                ? 'bg-[#00ffa3] text-[#080809] font-bold'
                : 'text-[#f0f0f2]/60 hover:text-[#00ffa3] hover:bg-white/[0.05]'
            }`}
            title="Measurement Caliper (mm)"
          >
            <Ruler className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowCrosshairs(!showCrosshairs)}
            className={`p-1.5 transition ${
              showCrosshairs
                ? 'bg-[#00ffa3]/20 text-[#00ffa3]'
                : 'text-[#f0f0f2]/60 hover:text-[#00ffa3] hover:bg-white/[0.05]'
            }`}
            title="Toggle Reticle Crosshairs"
          >
            <Crosshair className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowScanlines(!showScanlines)}
            className={`p-1.5 transition ${
              showScanlines
                ? 'bg-[#00ffa3]/20 text-[#00ffa3]'
                : 'text-[#f0f0f2]/30 hover:text-[#00ffa3] hover:bg-white/[0.05]'
            }`}
            title="Toggle CRT Scanline Overlay"
          >
            <Layers className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleExportSnapshot}
            className="p-1.5 text-[#f0f0f2]/60 hover:text-[#00ffa3] hover:bg-white/[0.05] transition"
            title="Export Image Snapshot"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Scan Canvas Area (Variation 8) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`canvas-area w-full h-[400px] sm:h-[500px] select-none ${
          caliperActive ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Subtle Static Center Crosshairs */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.04] pointer-events-none" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/[0.04] pointer-events-none" />

        {/* Hidden original canvas */}
        <canvas ref={baseCanvasRef} className="hidden" />

        {/* Viewport Container with Zoom & Pan */}
        <div
          className="mri-image-placeholder transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: 440,
            height: 440,
          }}
        >
          {/* Filtered MRI Scan Canvas */}
          <canvas
            ref={filterCanvasRef}
            className="absolute inset-0 w-full h-full border border-white/5"
          />

          {/* Grad-CAM Heatmap Layer */}
          <canvas
            ref={camCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
          />

          {/* Pulsing Lesion Glow Halo */}
          {showPulsingHalo && showRoiBox && prediction && prediction.predictedClass !== 'no_tumor' && (
            <div
              className="absolute pointer-events-none animate-pulse bg-rose-500/25 filter blur-lg"
              style={{
                left: `${prediction.gradCamRoi.x - 12}px`,
                top: `${prediction.gradCamRoi.y - 12}px`,
                width: `${prediction.gradCamRoi.width + 24}px`,
                height: `${prediction.gradCamRoi.height + 24}px`
              }}
            />
          )}

          {/* ROI Bounding Box with Precision Reticle Brackets (Variation 8) */}
          {showRoiBox && prediction && prediction.predictedClass !== 'no_tumor' && (
            <div
              className="roi-box pointer-events-none transition-all shadow-[0_0_20px_rgba(255,51,102,0.35)]"
              style={{
                left: `${prediction.gradCamRoi.x}px`,
                top: `${prediction.gradCamRoi.y}px`,
                width: `${prediction.gradCamRoi.width}px`,
                height: `${prediction.gradCamRoi.height}px`,
                borderColor: '#ff3366',
                color: '#ff3366',
                backgroundColor: 'rgba(255, 51, 102, 0.05)'
              }}
            >
              <div className="absolute -bottom-6 left-0 font-mono text-[9px] text-[#ff3366] font-semibold whitespace-nowrap tracking-wider">
                ROI: {prediction.gradCamRoi.estimatedDiameterMm}mm ({prediction.gradCamRoi.estimatedAreaMm2}mm²)
              </div>
            </div>
          )}

          {/* Medical Workstation Scanline Effect */}
          {showScanlines && (
            <div className="absolute inset-0 pointer-events-none z-10 opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.6)_50%)] bg-[length:100%_4px]" />
          )}

          {/* Interactive Dynamic Reticle Crosshairs */}
          {showCrosshairs && (
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute w-full border-t border-[#00ffa3]/40"
                style={{ top: `${mousePos.y}px` }}
              />
              <div
                className="absolute h-full border-l border-[#00ffa3]/40"
                style={{ left: `${mousePos.x}px` }}
              />
            </div>
          )}

          {/* Caliper Line Render */}
          {caliperPoints && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
              <line
                x1={caliperPoints.x1}
                y1={caliperPoints.y1}
                x2={caliperPoints.x2}
                y2={caliperPoints.y2}
                stroke="#00ffa3"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              <circle cx={caliperPoints.x1} cy={caliperPoints.y1} r="4" fill="#00ffa3" />
              <circle cx={caliperPoints.x2} cy={caliperPoints.y2} r="4" fill="#00ffa3" />
              <text
                x={(caliperPoints.x1 + caliperPoints.x2) / 2 + 8}
                y={(caliperPoints.y1 + caliperPoints.y2) / 2 - 8}
                fill="#00ffa3"
                fontSize="12"
                fontWeight="bold"
                fontFamily="monospace"
                className="drop-shadow-md"
              >
                {caliperDistanceMm} mm
              </text>
            </svg>
          )}
        </div>

        {/* HUD Elements */}
        <div className="absolute bottom-3 left-3 text-[10px] font-mono text-[#f0f0f2]/60 bg-[#080809]/90 px-2.5 py-1.5 border border-[rgba(240,240,242,0.08)] pointer-events-none">
          <div>SCALE: 0.80 mm/voxel</div>
          <div>ZOOM: {(zoom * 100).toFixed(0)}%</div>
          {caliperDistanceMm && <div className="text-[#00ffa3] font-bold">CALIPER: {caliperDistanceMm} mm</div>}
        </div>

        <div className="absolute top-3 right-3 text-[10px] font-mono text-[#f0f0f2]/60 bg-[#080809]/90 px-2.5 py-1.5 border border-[rgba(240,240,242,0.08)] pointer-events-none">
          <div>WINDOW: {filter.toUpperCase()}</div>
          <div>CAM: {showGradCam ? `${colormap.toUpperCase()} (${Math.round(camOpacity * 100)}%)` : 'OFF'}</div>
        </div>
      </div>

      {/* Variation 8 Viewer Controls Grid */}
      <div className="viewer-controls">
        {/* Overlays checkboxes */}
        <div>
          <span className="label text-[9px] mb-2">Overlays</span>
          <div className="flex items-center gap-4">
            <label className="font-mono text-xs text-[#f0f0f2]/80 flex items-center gap-2 cursor-pointer select-none hover:text-[#f0f0f2]">
              <input
                type="checkbox"
                checked={showGradCam}
                onChange={(e) => setShowGradCam(e.target.checked)}
                className="accent-[#00ffa3] cursor-pointer"
              />
              <span>HEATMAP</span>
            </label>

            <label className="font-mono text-xs text-[#f0f0f2]/80 flex items-center gap-2 cursor-pointer select-none hover:text-[#f0f0f2]">
              <input
                type="checkbox"
                checked={showRoiBox}
                onChange={(e) => setShowRoiBox(e.target.checked)}
                className="accent-[#00ffa3] cursor-pointer"
              />
              <span>BBOX</span>
            </label>
          </div>
        </div>

        {/* Transparency slider */}
        <div>
          <span className="label text-[9px] mb-2">Transparency ({Math.round(camOpacity * 100)}%)</span>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={camOpacity}
              onChange={(e) => setCamOpacity(parseFloat(e.target.value))}
              disabled={!showGradCam}
              className="w-full accent-[#00ffa3] cursor-pointer h-1 bg-[rgba(240,240,242,0.1)] rounded"
            />
          </div>
        </div>

        {/* Map Type selector */}
        <div>
          <span className="label text-[9px] mb-1.5">Map Type</span>
          <select
            value={colormap}
            onChange={(e) => setColormap(e.target.value as any)}
            className="w-full bg-[#111114] border border-[rgba(240,240,242,0.12)] text-[#f0f0f2] font-mono text-xs px-3 py-1.5 focus:border-[#00ffa3] focus:outline-none cursor-pointer uppercase"
          >
            <option value="inferno">INFERNO</option>
            <option value="jet">JET</option>
            <option value="turbo">TURBO</option>
            <option value="viridis">VIRIDIS</option>
          </select>
        </div>
      </div>

      {/* Row 2: Window / Level Filters */}
      <div className="px-4 py-2.5 bg-[#080809] border-t border-[rgba(240,240,242,0.08)] flex items-center gap-2 overflow-x-auto text-xs font-mono">
        <span className="text-[#f0f0f2]/40 text-[10px] uppercase tracking-wider whitespace-nowrap">
          Radiology Window:
        </span>
        {[
          { id: 'standard', label: 'BRAIN STD' },
          { id: 'contrast', label: 'HI-CONTRAST' },
          { id: 'bone', label: 'BONE/SELLAR' },
          { id: 'sobel', label: 'SOBEL EDGE' },
          { id: 'invert', label: 'FILM INVERT' }
        ].map((preset) => (
          <button
            key={preset.id}
            onClick={() => setFilter(preset.id as any)}
            className={`px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase transition whitespace-nowrap border ${
              filter === preset.id
                ? 'bg-[#00ffa3]/15 text-[#00ffa3] border-[#00ffa3]/40 font-bold'
                : 'bg-[#111114] text-[#f0f0f2]/60 hover:text-[#f0f0f2] border-[rgba(240,240,242,0.08)]'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};
