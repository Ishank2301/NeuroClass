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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Toolbar */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800/80">
            {patientId}
          </span>
          <span className="text-slate-400 font-mono">
            {slicePlane.toUpperCase()} | {sequence}
          </span>
          {prediction && (
            <span
              className="px-2 py-0.5 rounded font-mono font-bold text-[11px]"
              style={{ backgroundColor: `${prediction.triageColor}20`, color: prediction.triageColor }}
            >
              {prediction.triagePriority}
            </span>
          )}
        </div>

        {/* View & Tool Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setZoom((z) => Math.min(3.5, z + 0.25))}
            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
            title="Zoom In (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
            title="Zoom Out (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
            title="Reset View"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-slate-800 my-auto mx-0.5"></div>
          <button
            onClick={() => setCaliperActive(!caliperActive)}
            className={`p-1.5 rounded transition ${
              caliperActive
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
            }`}
            title="Measurement Caliper (mm)"
          >
            <Ruler className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowCrosshairs(!showCrosshairs)}
            className={`p-1.5 rounded transition ${
              showCrosshairs
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
            }`}
            title="Toggle Crosshairs"
          >
            <Crosshair className="h-4 w-4" />
          </button>
          <button
            onClick={handleExportSnapshot}
            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
            title="Export Image Snapshot"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Scan Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative w-full h-[400px] sm:h-[450px] bg-black flex items-center justify-center overflow-hidden select-none ${
          caliperActive ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Hidden original canvas */}
        <canvas ref={baseCanvasRef} className="hidden" />

        {/* Viewport Container with Zoom & Pan */}
        <div
          className="relative transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: 400,
            height: 400
          }}
        >
          {/* Filtered MRI Scan Canvas */}
          <canvas
            ref={filterCanvasRef}
            className="absolute inset-0 w-full h-full rounded shadow-inner"
          />

          {/* Grad-CAM Heatmap Layer */}
          <canvas
            ref={camCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
          />

          {/* ROI Bounding Box & Label */}
          {showRoiBox && prediction && prediction.predictedClass !== 'no_tumor' && (
            <div
              className="absolute border-2 border-red-500/90 rounded pointer-events-none transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              style={{
                left: `${prediction.gradCamRoi.x}px`,
                top: `${prediction.gradCamRoi.y}px`,
                width: `${prediction.gradCamRoi.width}px`,
                height: `${prediction.gradCamRoi.height}px`
              }}
            >
              <div className="absolute -top-6 left-0 bg-red-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                ROI: {prediction.gradCamRoi.estimatedDiameterMm} mm (Area ~{prediction.gradCamRoi.estimatedAreaMm2} mm²)
              </div>
            </div>
          )}

          {/* Crosshairs Overlay */}
          {showCrosshairs && (
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute w-full border-t border-cyan-400/40"
                style={{ top: `${mousePos.y}px` }}
              />
              <div
                className="absolute h-full border-l border-cyan-400/40"
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
                stroke="#06b6d4"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              <circle cx={caliperPoints.x1} cy={caliperPoints.y1} r="4" fill="#06b6d4" />
              <circle cx={caliperPoints.x2} cy={caliperPoints.y2} r="4" fill="#06b6d4" />
              <text
                x={(caliperPoints.x1 + caliperPoints.x2) / 2 + 8}
                y={(caliperPoints.y1 + caliperPoints.y2) / 2 - 8}
                fill="#22d3ee"
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
        <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400/80 bg-slate-950/80 backdrop-blur px-2.5 py-1.5 rounded border border-slate-800 pointer-events-none">
          <div>SCALE: 0.80 mm/voxel</div>
          <div>ZOOM: {(zoom * 100).toFixed(0)}%</div>
          {caliperDistanceMm && <div className="text-cyan-300 font-bold">CALIPER: {caliperDistanceMm} mm</div>}
        </div>

        <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400/80 bg-slate-950/80 backdrop-blur px-2.5 py-1.5 rounded border border-slate-800 pointer-events-none">
          <div>WINDOW: {filter.toUpperCase()}</div>
          <div>CAM: {showGradCam ? `${colormap.toUpperCase()} (${Math.round(camOpacity * 100)}%)` : 'OFF'}</div>
        </div>
      </div>

      {/* Bottom Control Deck */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 space-y-3">
        {/* Row 1: Grad-CAM Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showGradCam}
                onChange={(e) => setShowGradCam(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-500 focus:ring-offset-slate-950"
              />
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                Grad-CAM Activation Map
              </span>
            </label>

            {showGradCam && (
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={showRoiBox}
                  onChange={(e) => setShowRoiBox(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                />
                <span className="text-slate-400">ROI Box</span>
              </label>
            )}
          </div>

          {showGradCam && (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Colormap Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Map:</span>
                {(['jet', 'inferno', 'turbo', 'viridis'] as const).map((mapName) => (
                  <button
                    key={mapName}
                    onClick={() => setColormap(mapName)}
                    className={`px-2 py-0.5 rounded capitalize text-[11px] font-mono transition ${
                      colormap === mapName
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {mapName}
                  </button>
                ))}
              </div>

              {/* Opacity Slider */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Alpha:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={camOpacity}
                  onChange={(e) => setCamOpacity(parseFloat(e.target.value))}
                  className="w-20 accent-cyan-500 cursor-pointer"
                />
                <span className="font-mono text-cyan-400 text-[11px] w-8">
                  {Math.round(camOpacity * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Row 2: Window / Level Filters */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 flex items-center gap-1 whitespace-nowrap text-[11px]">
            <Sliders className="h-3.5 w-3.5 text-slate-400" />
            Radiology Preset:
          </span>
          {[
            { id: 'standard', label: 'Brain Standard' },
            { id: 'contrast', label: 'High Contrast' },
            { id: 'bone', label: 'Bone / Sellar' },
            { id: 'sobel', label: 'Sobel Edge' },
            { id: 'invert', label: 'Inverted (Film)' }
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setFilter(preset.id as any)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition whitespace-nowrap ${
                filter === preset.id
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
