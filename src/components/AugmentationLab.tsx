import React, { useState, useRef, useEffect } from 'react';
import { Layers, Sliders, RefreshCw, Wand2, ShieldCheck, ArrowRight, Eye } from 'lucide-react';
import { SAMPLE_SCANS } from '../data/sampleScans';

export const AugmentationLab: React.FC = () => {
  const [selectedScan, setSelectedScan] = useState(SAMPLE_SCANS[0]);
  const [rotation, setRotation] = useState<number>(15);
  const [zoom, setZoom] = useState<number>(1.1);
  const [flipH, setFlipH] = useState<boolean>(true);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(10);
  const [noise, setNoise] = useState<number>(15);

  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const augmentedCanvasRef = useRef<HTMLCanvasElement>(null);
  const histogramCanvasRef = useRef<HTMLCanvasElement>(null);

  // Render original 224x224 resized tensor
  useEffect(() => {
    const oCanvas = originalCanvasRef.current;
    if (!oCanvas) return;
    const ctx = oCanvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedScan.imageUrl;
    img.onload = () => {
      oCanvas.width = 224;
      oCanvas.height = 224;
      ctx.clearRect(0, 0, 224, 224);
      ctx.drawImage(img, 0, 0, 224, 224);

      renderAugmentedView(img);
    };
  }, [selectedScan]);

  // Recompute augmented pipeline
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedScan.imageUrl;
    img.onload = () => {
      renderAugmentedView(img);
    };
  }, [rotation, zoom, flipH, flipV, brightness, noise]);

  const renderAugmentedView = (img: HTMLImageElement) => {
    const aCanvas = augmentedCanvasRef.current;
    const hCanvas = histogramCanvasRef.current;
    if (!aCanvas || !hCanvas) return;

    const ctx = aCanvas.getContext('2d');
    if (!ctx) return;

    aCanvas.width = 224;
    aCanvas.height = 224;

    ctx.save();
    ctx.clearRect(0, 0, 224, 224);

    // Dark background
    ctx.fillStyle = '#06090e';
    ctx.fillRect(0, 0, 224, 224);

    // Apply affine transform
    ctx.translate(112, 112);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -zoom : zoom, flipV ? -zoom : zoom);
    ctx.translate(-112, -112);

    ctx.drawImage(img, 0, 0, 224, 224);
    ctx.restore();

    // Pixel level adjustments: brightness & Gaussian noise
    const imgData = ctx.getImageData(0, 0, 224, 224);
    const data = imgData.data;
    const histogram = new Array(256).fill(0);

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        const n = (Math.random() - 0.5) * noise * 2;
        let r = Math.min(255, Math.max(0, data[i] + brightness + n));
        let g = Math.min(255, Math.max(0, data[i + 1] + brightness + n));
        let b = Math.min(255, Math.max(0, data[i + 2] + brightness + n));

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;

        const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        histogram[lum]++;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Render Histogram
    renderHistogram(hCanvas, histogram);
  };

  const renderHistogram = (canvas: HTMLCanvasElement, hist: number[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 256;
    canvas.height = 80;

    ctx.clearRect(0, 0, 256, 80);
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 256, 80);

    const maxVal = Math.max(...hist.slice(10)); // ignore background peak
    ctx.fillStyle = '#06b6d4';

    for (let i = 0; i < 256; i++) {
      const h = (hist[i] / (maxVal || 1)) * 70;
      ctx.fillRect(i, 80 - h, 1, h);
    }
  };

  const resetAugmentations = () => {
    setRotation(0);
    setZoom(1.0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(0);
    setNoise(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-semibold border border-cyan-500/30">
              DATA PREPROCESSING & AUGMENTATION PIPELINE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Input Dimension: 224 × 224 × 3 Tensor
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Data Augmentation & Robustness Lab
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Simulate real-time Keras/TensorFlow data augmentation transforms (`ImageDataGenerator` / `tf.keras.layers.RandomFlip`) applied during training to prevent overfitting and improve generalization across clinical imaging centers.
          </p>
        </div>

        <button
          onClick={resetAugmentations}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset Transforms</span>
        </button>
      </div>

      {/* Main Grid: Visual Pipeline + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dual Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="h-4 w-4 text-cyan-400" />
              Preprocessed Input vs Augmented Mini-Batch Tensor
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              Normalization: [0, 1] Rescaling
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
            {/* Original Input */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-mono text-slate-400 mb-2 font-bold">
                1. Standard Input (224×224)
              </span>
              <div className="p-1 bg-slate-950 border border-slate-800 rounded-xl shadow-lg">
                <canvas
                  ref={originalCanvasRef}
                  width={224}
                  height={224}
                  className="rounded-lg shadow"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1">
                Zero augmentation
              </span>
            </div>

            <div className="hidden sm:flex text-slate-600">
              <ArrowRight className="h-6 w-6 text-cyan-500 animate-pulse" />
            </div>

            {/* Augmented Output */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-mono text-cyan-400 mb-2 font-bold">
                2. Augmented Tensor (224×224)
              </span>
              <div className="p-1 bg-cyan-950/40 border border-cyan-500/40 rounded-xl shadow-lg shadow-cyan-500/10">
                <canvas
                  ref={augmentedCanvasRef}
                  width={224}
                  height={224}
                  className="rounded-lg shadow"
                />
              </div>
              <span className="text-[10px] text-cyan-400 font-mono mt-1">
                Transformed for mini-batch
              </span>
            </div>
          </div>

          {/* Histogram Spectrum */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-400">
                Pixel Intensity Distribution Spectrum (0-255)
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                Brightness Offset: {brightness > 0 ? `+${brightness}` : brightness}
              </span>
            </div>
            <canvas ref={histogramCanvasRef} className="w-full h-16 rounded" />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>0 (Air / CSF)</span>
              <span>128 (Brain Parenchyma)</span>
              <span>255 (Cortical Bone / Gadolinium)</span>
            </div>
          </div>
        </div>

        {/* Right: Interactive Pipeline Controls (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-cyan-400" />
              Augmentation Hyperparameters
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Live Preview
            </span>
          </div>

          {/* Sample scan selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Source Clinical Scan:
            </label>
            <select
              value={selectedScan.id}
              onChange={(e) => {
                const s = SAMPLE_SCANS.find((x) => x.id === e.target.value);
                if (s) setSelectedScan(s);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {SAMPLE_SCANS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.groundTruth})
                </option>
              ))}
            </select>
          </div>

          {/* Sliders */}
          <div className="space-y-3 pt-2">
            {/* Rotation */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Random Rotation:</span>
                <span className="text-cyan-400 font-bold">{rotation}°</span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="5"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Zoom / Scale */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Zoom / Scaling Factor:</span>
                <span className="text-cyan-400 font-bold">{zoom.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Brightness Shift */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Brightness / Contrast Shift:</span>
                <span className="text-cyan-400 font-bold">{brightness}</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="5"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Gaussian Noise Simulation */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Rician / Gaussian Noise:</span>
                <span className="text-cyan-400 font-bold">{noise}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={noise}
                onChange={(e) => setNoise(parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Flips */}
            <div className="pt-2 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={flipH}
                  onChange={(e) => setFlipH(e.target.checked)}
                  className="rounded text-cyan-500 bg-slate-950 border-slate-700"
                />
                <span>Horizontal Flip</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={flipV}
                  onChange={(e) => setFlipV(e.target.checked)}
                  className="rounded text-cyan-500 bg-slate-950 border-slate-700"
                />
                <span>Vertical Flip</span>
              </label>
            </div>
          </div>

          {/* Educational Insights Box */}
          <div className="mt-4 p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              Generalization Benefit:
            </span>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Applying random rotation and horizontal flipping forces the convolutional filters to learn rotation-invariant spatial features (e.g. necrotic core borders, dural tails) rather than memorizing fixed pixel coordinates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
