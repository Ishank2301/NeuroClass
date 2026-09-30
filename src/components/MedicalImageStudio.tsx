import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Upload,
  Download,
  Image as ImageIcon,
  Sliders,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  SplitSquareVertical,
  Layers,
  Palette
} from 'lucide-react';
import { SAMPLE_SCANS } from '../data/sampleScans';

interface MedicalImageStudioProps {
  initialScanImage?: string;
}

export const MedicalImageStudio: React.FC<MedicalImageStudioProps> = ({ initialScanImage }) => {
  const [mode, setMode] = useState<'create' | 'edit'>('edit');
  const [sourceImage, setSourceImage] = useState<string>(
    initialScanImage || SAMPLE_SCANS[0]?.imageUrl || ''
  );
  const [prompt, setPrompt] = useState<string>(
    'Highlight the contrast-enhancing tumor margins in neon amber, delineate the central necrotic core in crimson red, and enhance T2/FLAIR peritumoral vasogenic edema in cyan blue.'
  );
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '3:4'>('1:1');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generationDesc, setGenerationDesc] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSourceImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExecute = async () => {
    if (!prompt.trim()) {
      setErrorMsg('Please enter a medical text prompt.');
      return;
    }
    if (mode === 'edit' && !sourceImage) {
      setErrorMsg('Please select or upload a source image to edit.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedImageUrl(null);

    try {
      const res = await fetch('/api/image/generate-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          sourceImageBase64: mode === 'edit' ? sourceImage : undefined,
          mode,
          aspectRatio,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setGenerationDesc(data.description || '');
      } else {
        throw new Error('Image generation did not return an image URL.');
      }
    } catch (err: any) {
      console.error('Image studio error:', err);
      setErrorMsg(err.message || 'Image generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const presetEditPrompts = [
    'Highlight the contrast-enhancing tumor margins in neon amber and delineate the central necrotic core in crimson red',
    'Enhance T2-FLAIR peritumoral vasogenic edema in cyan blue with clear demarcation of healthy brain parenchyma',
    'Simulate a surgical resection cavity with titanium mesh and post-operative hemostatic matrix',
    'Delineate the dural tail sign extending along the calvarium in fluorescent emerald green',
  ];

  const presetCreatePrompts = [
    '3D high-resolution anatomical rendering of an axial brain MRI scan showing a parasellar pituitary macroadenoma',
    'Microscopic histopathology stain (H&E) of glioblastoma multiforme showing microvascular proliferation and pseudopalisading necrosis',
    'Detailed clinical neurosurgical craniotomy trajectory diagram showing pterional approach for sphenoid wing meningioma',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Palette className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Medical Illustration & Image Enhancement Studio
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-semibold">
              gemini-3.1-flash-image-preview
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Use natural language prompts to create high-fidelity medical illustrations or edit brain tumor MRI scans with calibrated annotations.
          </p>
        </div>

        {/* Mode Switcher: Create vs Edit */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => {
              setMode('edit');
              setPrompt(presetEditPrompts[0]);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'edit'
                ? 'bg-purple-500/25 text-purple-200 border border-purple-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Edit MRI Scan
          </button>
          <button
            onClick={() => {
              setMode('create');
              setPrompt(presetCreatePrompts[0]);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'create'
                ? 'bg-purple-500/25 text-purple-200 border border-purple-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create from Text
          </button>
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800 shadow-lg space-y-4">
            {/* If Edit Mode: Source Image Upload/Picker */}
            {mode === 'edit' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5 text-purple-400" />
                    Source Scan to Edit
                  </label>
                  <label className="cursor-pointer text-xs text-purple-400 hover:text-purple-300 font-medium">
                    Upload Custom Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="relative aspect-square max-h-[220px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                  {sourceImage ? (
                    <img
                      src={sourceImage}
                      alt="Source scan"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">No source image selected</span>
                  )}
                </div>

                {/* Presets */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-mono">
                    Select sample case:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {SAMPLE_SCANS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSourceImage(s.imageUrl)}
                        className={`aspect-square rounded-lg overflow-hidden border transition-all ${
                          sourceImage === s.imageUrl
                            ? 'border-purple-400 ring-2 ring-purple-500/30'
                            : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={s.imageUrl}
                          alt={s.groundTruth}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Aspect Ratio Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['1:1', '16:9', '4:3', '3:4'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                      aspectRatio === ratio
                        ? 'bg-purple-500/20 text-purple-200 border-purple-500/50 font-bold'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Text Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>{mode === 'edit' ? 'Edit Instructions' : 'Generation Prompt'}</span>
                <span className="text-[10px] text-purple-400 lowercase font-mono">gemini-3.1-flash-image</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full rounded-xl bg-slate-950/90 border border-slate-800 focus:border-purple-500 p-3 text-xs text-slate-200 focus:outline-none resize-none"
                placeholder={mode === 'edit' ? 'Describe changes to make to the scan...' : 'Describe medical illustration to create...'}
              />

              {/* Preset Prompts */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono">Preset Prompts:</span>
                {(mode === 'edit' ? presetEditPrompts : presetCreatePrompts).slice(0, 3).map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(p)}
                    className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800/60 truncate transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Generating with Gemini Image...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>{mode === 'edit' ? 'Apply Medical Edit' : 'Generate Medical Illustration'}</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Output & Interactive Comparison View (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800 shadow-lg min-h-[500px] flex flex-col justify-between">
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
                <div className="h-16 w-16 rounded-2xl border-4 border-purple-500/30 border-t-purple-400 animate-spin flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-purple-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-bold text-white">Synthesizing Clinical Image...</h3>
                  <p className="text-xs text-slate-400 mt-1">Applying gemini-3.1-flash-image diffusion pipeline</p>
                </div>
              </div>
            ) : generatedImageUrl ? (
              <div className="space-y-4">
                {/* Result header & download */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">
                      {mode === 'edit' ? 'Enhanced Clinical MRI Output' : 'Generated Medical Illustration'}
                    </span>
                  </div>

                  <a
                    href={generatedImageUrl}
                    download="neuroclass-gemini-output.png"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-medium border border-purple-500/30 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Image</span>
                  </a>
                </div>

                {/* Display container */}
                {mode === 'edit' && sourceImage ? (
                  /* Interactive Split Comparison View */
                  <div className="space-y-2">
                    <div className="relative aspect-square max-h-[380px] rounded-xl overflow-hidden border border-slate-700 bg-black select-none mx-auto">
                      {/* Under layer: Enhanced result */}
                      <img
                        src={generatedImageUrl}
                        alt="Enhanced Result"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                      />

                      {/* Top layer: Original image with clip path */}
                      <div
                        className="absolute inset-0 overflow-hidden pointer-events-none"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                      >
                        <img
                          src={sourceImage}
                          alt="Original MRI"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Divider line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] pointer-events-none"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-[10px] text-cyan-300 font-bold shadow-lg">
                          ⇔
                        </div>
                      </div>

                      <div className="absolute top-3 left-3 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 border border-slate-800">
                        Original MRI
                      </div>
                      <div className="absolute top-3 right-3 bg-purple-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-purple-300 border border-purple-800">
                        Gemini Enhanced
                      </div>
                    </div>

                    {/* Comparison Slider */}
                    <div className="flex items-center gap-3 px-2">
                      <span className="text-[11px] font-mono text-slate-400">Original</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPosition}
                        onChange={(e) => setSliderPosition(Number(e.target.value))}
                        className="flex-1 accent-cyan-400 cursor-ew-resize"
                      />
                      <span className="text-[11px] font-mono text-purple-300">Enhanced</span>
                    </div>
                  </div>
                ) : (
                  /* Standard Image Display */
                  <div className="relative aspect-square max-h-[400px] rounded-xl overflow-hidden border border-slate-700 bg-black mx-auto flex items-center justify-center">
                    <img
                      src={generatedImageUrl}
                      alt="Generated"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {generationDesc && (
                  <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    {generationDesc}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-4 text-center text-slate-500">
                <div className="h-16 w-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <div className="max-w-xs">
                  <h3 className="text-sm font-semibold text-slate-300">No Image Rendered Yet</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Configure your prompt on the left and click "Apply Medical Edit" or "Generate Medical Illustration" to begin.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
