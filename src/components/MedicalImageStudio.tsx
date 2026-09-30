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
      <div className="p-6 bg-[#111114] border border-[rgba(240,240,242,0.08)] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <span className="w-8 h-8 border border-[#00ffa3] bg-[#00ffa3]/10 text-[#00ffa3] flex items-center justify-center font-syne font-bold text-xs shrink-0">
              M
            </span>
            <h1 className="font-syne text-xl font-bold text-[#f0f0f2] tracking-tight uppercase">
              Medical Illustration & Scan Studio
            </h1>
            <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/30">
              gemini-3.1-flash-image
            </span>
          </div>
          <p className="font-sans text-xs text-[#f0f0f2]/60">
            Use natural language prompts to create high-fidelity medical illustrations or edit brain tumor MRI scans with calibrated annotations.
          </p>
        </div>

        {/* Mode Switcher: Create vs Edit */}
        <div className="flex items-center gap-2 bg-[#080809] p-1 border border-[rgba(240,240,242,0.08)] font-mono text-[11px]">
          <button
            onClick={() => {
              setMode('edit');
              setPrompt(presetEditPrompts[0]);
            }}
            className={`px-3 py-1 font-semibold uppercase transition-all ${
              mode === 'edit'
                ? 'bg-[#00ffa3] text-[#080809] font-bold'
                : 'text-[#f0f0f2]/50 hover:text-[#f0f0f2]'
            }`}
          >
            Edit MRI Scan
          </button>
          <button
            onClick={() => {
              setMode('create');
              setPrompt(presetCreatePrompts[0]);
            }}
            className={`px-3 py-1 font-semibold uppercase transition-all ${
              mode === 'create'
                ? 'bg-[#00ffa3] text-[#080809] font-bold'
                : 'text-[#f0f0f2]/50 hover:text-[#f0f0f2]'
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
          <div className="p-5 bg-[#111114] border border-[rgba(240,240,242,0.08)] shadow-lg space-y-4 font-mono">
            {/* If Edit Mode: Source Image Upload/Picker */}
            {mode === 'edit' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="label-precision text-[10px]">Source Scan to Edit</span>
                  <label className="cursor-pointer text-[10px] text-[#00ffa3] hover:underline uppercase">
                    Upload Custom
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="relative aspect-square max-h-[220px] border border-[rgba(240,240,242,0.08)] bg-black flex items-center justify-center overflow-hidden">
                  {sourceImage ? (
                    <img
                      src={sourceImage}
                      alt="Source scan"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">No source image selected</span>
                  )}
                </div>

                {/* Presets */}
                <div>
                  <span className="text-[10px] text-[#f0f0f2]/40 block mb-1.5 uppercase tracking-wider">
                    Select Sample Case:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {SAMPLE_SCANS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSourceImage(s.imageUrl)}
                        className={`aspect-square overflow-hidden border transition-all ${
                          sourceImage === s.imageUrl
                            ? 'border-[#00ffa3] shadow-[0_0_10px_rgba(0,255,163,0.3)]'
                            : 'border-[rgba(240,240,242,0.08)] opacity-60 hover:opacity-100'
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
              <span className="label-precision text-[10px]">Aspect Ratio</span>
              <div className="grid grid-cols-4 gap-2">
                {(['1:1', '16:9', '4:3', '3:4'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1.5 text-xs font-mono transition-all border ${
                      aspectRatio === ratio
                        ? 'bg-[#00ffa3] text-[#080809] font-bold border-[#00ffa3]'
                        : 'bg-[#080809] text-[#f0f0f2]/50 border-[rgba(240,240,242,0.08)] hover:text-[#f0f0f2]'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Text Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="label-precision text-[10px]">
                  {mode === 'edit' ? 'Edit Instructions' : 'Generation Prompt'}
                </span>
                <span className="text-[9px] text-[#00ffa3]/80 lowercase">gemini-3.1-flash-image</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full bg-[#080809] border border-[rgba(240,240,242,0.12)] focus:border-[#00ffa3] p-3 text-xs text-[#f0f0f2] focus:outline-none resize-none font-mono"
                placeholder={mode === 'edit' ? 'Describe changes to make to the scan...' : 'Describe medical illustration to create...'}
              />

              {/* Preset Prompts */}
              <div className="space-y-1">
                <span className="text-[9px] text-[#f0f0f2]/40 uppercase tracking-wider">Presets:</span>
                {(mode === 'edit' ? presetEditPrompts : presetCreatePrompts).slice(0, 3).map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(p)}
                    className="w-full text-left text-[10px] px-2.5 py-1.5 bg-[#080809] hover:bg-white/[0.04] text-[#f0f0f2]/60 hover:text-[#00ffa3] border border-[rgba(240,240,242,0.06)] truncate transition-colors font-mono"
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
              className="btn-cut w-full py-4 bg-[#00ffa3] hover:bg-white text-[#080809] font-mono font-bold text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00ffa3]/20"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#080809]" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>{mode === 'edit' ? 'Apply Medical Edit' : 'Generate Medical Illustration'}</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 bg-rose-950/40 border border-rose-800 text-xs text-rose-300 font-mono flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Output & Interactive Comparison View (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 bg-[#111114] border border-[rgba(240,240,242,0.08)] shadow-lg min-h-[500px] flex flex-col justify-between font-mono">
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
                <div className="h-16 w-16 border-2 border-[#00ffa3] border-t-transparent animate-spin flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-[#00ffa3]" />
                </div>
                <div className="text-center">
                  <h3 className="font-syne text-sm font-bold text-white uppercase tracking-wider">Synthesizing Clinical Image...</h3>
                  <p className="text-[11px] text-[#f0f0f2]/60 mt-1">Applying gemini-3.1-flash-image diffusion pipeline</p>
                </div>
              </div>
            ) : generatedImageUrl ? (
              <div className="space-y-4">
                {/* Result header & download */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#00ffa3]" />
                    <span className="text-xs font-bold text-[#f0f0f2] uppercase">
                      {mode === 'edit' ? 'Enhanced Clinical MRI Output' : 'Generated Medical Illustration'}
                    </span>
                  </div>

                  <a
                    href={generatedImageUrl}
                    download="neuroclass-gemini-output.png"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00ffa3]/10 hover:bg-[#00ffa3]/20 text-[#00ffa3] text-xs font-semibold border border-[#00ffa3]/40 transition-colors uppercase"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Image</span>
                  </a>
                </div>

                {/* Display container */}
                {mode === 'edit' && sourceImage ? (
                  /* Interactive Split Comparison View */
                  <div className="space-y-3">
                    <div className="relative aspect-square max-h-[380px] overflow-hidden border border-[rgba(240,240,242,0.12)] bg-black select-none mx-auto">
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
                        className="absolute top-0 bottom-0 w-0.5 bg-[#00ffa3] shadow-[0_0_12px_#00ffa3] pointer-events-none"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-[#080809] border border-[#00ffa3] flex items-center justify-center text-[10px] text-[#00ffa3] font-bold shadow-lg">
                          ⇔
                        </div>
                      </div>

                      <div className="absolute top-3 left-3 bg-[#080809]/90 px-2 py-0.5 text-[9px] text-[#f0f0f2]/60 border border-[rgba(240,240,242,0.1)] uppercase tracking-wider">
                        Original MRI
                      </div>
                      <div className="absolute top-3 right-3 bg-[#00ffa3]/10 px-2 py-0.5 text-[9px] text-[#00ffa3] border border-[#00ffa3]/30 uppercase tracking-wider">
                        Gemini Enhanced
                      </div>
                    </div>

                    {/* Comparison Slider */}
                    <div className="flex items-center gap-3 px-2">
                      <span className="text-[10px] text-[#f0f0f2]/40 uppercase tracking-wider">Original</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPosition}
                        onChange={(e) => setSliderPosition(Number(e.target.value))}
                        className="flex-1 accent-[#00ffa3] cursor-ew-resize h-1 bg-[rgba(240,240,242,0.1)] rounded"
                      />
                      <span className="text-[10px] text-[#00ffa3] uppercase tracking-wider">Enhanced</span>
                    </div>
                  </div>
                ) : (
                  /* Standard Image Display */
                  <div className="relative aspect-square max-h-[400px] overflow-hidden border border-[rgba(240,240,242,0.12)] bg-black mx-auto flex items-center justify-center">
                    <img
                      src={generatedImageUrl}
                      alt="Generated"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {generationDesc && (
                  <p className="font-sans text-xs text-[#f0f0f2]/70 bg-[#080809] p-3 border border-[rgba(240,240,242,0.08)] leading-relaxed">
                    {generationDesc}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-4 text-center text-[#f0f0f2]/40 font-mono">
                <div className="h-14 w-14 border border-[rgba(240,240,242,0.1)] bg-[#080809] flex items-center justify-center text-[#00ffa3]">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <div className="max-w-xs">
                  <h3 className="font-syne text-sm font-semibold text-[#f0f0f2] uppercase tracking-wide">No Image Rendered Yet</h3>
                  <p className="text-[11px] text-[#f0f0f2]/40 mt-1">
                    Configure your prompt on the left and click "Apply Medical Edit" or "Generate Medical Illustration".
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
