import React, { useState } from 'react';
import {
  Film,
  Upload,
  Play,
  Pause,
  Download,
  Sparkles,
  Layers,
  RotateCw,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  Video,
  Eye,
  Sliders,
  RefreshCw
} from 'lucide-react';
import { SAMPLE_SCANS } from '../data/sampleScans';

interface VeoCineLoopStudioProps {
  initialScanImage?: string;
}

export const VeoCineLoopStudio: React.FC<VeoCineLoopStudioProps> = ({ initialScanImage }) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    initialScanImage || SAMPLE_SCANS[0]?.imageUrl || ''
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [prompt, setPrompt] = useState<string>(
    '3D volumetric rotating cine-loop of brain tumor MRI axial sequence with contrast enhancement, showing lesion boundaries and surrounding anatomical structures in high-resolution medical visualization.'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVideo = async () => {
    if (!selectedImage) {
      setErrorMsg('Please select or upload an MRI scan slice.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);
    setStatusMessage('Submitting 3D volumetric task to Veo (veo-3.1-fast-generate-preview)...');
    setErrorMsg(null);
    setGeneratedVideoUrl(null);

    try {
      // 1. Start generation operation
      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageBase64: selectedImage,
          aspectRatio,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to initialize video generation (HTTP ${res.status})`);
      }

      const { operationName } = await res.json();

      // 2. Poll operation status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch('/api/video/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName }),
          });

          if (!statusRes.ok) {
            clearInterval(pollInterval);
            throw new Error('Status polling failed');
          }

          const statusData = await statusRes.json();

          if (statusData.done) {
            clearInterval(pollInterval);
            setGenerationProgress(90);
            setStatusMessage('Downloading high-definition medical cine-loop...');

            // 3. Download or retrieve video URL
            const downloadRes = await fetch('/api/video/download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName }),
            });

            if (downloadRes.headers.get('Content-Type')?.includes('video/mp4')) {
              const blob = await downloadRes.blob();
              const url = URL.createObjectURL(blob);
              setGeneratedVideoUrl(url);
            } else {
              const data = await downloadRes.json();
              if (data.videoUrl) {
                setGeneratedVideoUrl(data.videoUrl);
              } else {
                throw new Error('Video stream unavailable.');
              }
            }

            setGenerationProgress(100);
            setIsGenerating(false);
            setStatusMessage('Cine-loop rendered successfully!');
          } else {
            setGenerationProgress((prev) => {
              if (prev < 40) {
                setStatusMessage('Synthesizing 4D volumetric temporal interpolation...');
                return prev + 6;
              } else if (prev < 75) {
                setStatusMessage('Rendering smooth neuro-radiological rotation frames...');
                return prev + 4;
              } else {
                setStatusMessage('Finalizing 720p H.264 video encode...');
                return Math.min(88, prev + 2);
              }
            });
          }
        } catch (pollErr: any) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setErrorMsg(pollErr.message || 'Error occurred while polling Veo generation.');
        }
      }, 2500);
    } catch (err: any) {
      setIsGenerating(false);
      setErrorMsg(err.message || 'Error initializing Veo video.');
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const presetPrompts = [
    '3D volumetric rotating cine-loop of brain tumor MRI axial sequence with contrast enhancement',
    'Sagittal to coronal fly-through cross-sectional cinematic sequence showing internal tumor margins',
    '4D neurosurgical navigation pathway simulating microscope trajectory into the lesion cavity',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-[#111114] border border-[rgba(240,240,242,0.08)] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <span className="w-8 h-8 border border-[#00ffa3] bg-[#00ffa3]/10 text-[#00ffa3] flex items-center justify-center font-syne font-bold text-xs shrink-0">
              V
            </span>
            <h1 className="font-syne text-xl font-bold text-[#f0f0f2] tracking-tight uppercase">
              Veo 3D Cine-Loop Studio
            </h1>
            <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/30">
              veo-3.1-fast-generate-preview
            </span>
          </div>
          <p className="font-sans text-xs text-[#f0f0f2]/60">
            Synthesize dynamic 3D rotational cine-loop videos and 4D neurosurgical navigation pathways from 2D MRI slices.
          </p>
        </div>

        {/* Aspect Ratio Selector: 16:9 or 9:16 */}
        <div className="flex items-center gap-2 bg-[#080809] p-1 border border-[rgba(240,240,242,0.08)] font-mono text-[11px]">
          <span className="text-[#f0f0f2]/40 px-2 uppercase text-[10px]">Ratio:</span>
          <button
            onClick={() => setAspectRatio('16:9')}
            className={`px-3 py-1 font-semibold uppercase transition-all ${
              aspectRatio === '16:9'
                ? 'bg-[#00ffa3] text-[#080809] font-bold'
                : 'text-[#f0f0f2]/50 hover:text-[#f0f0f2]'
            }`}
          >
            16:9 Landscape
          </button>
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`px-3 py-1 font-semibold uppercase transition-all ${
              aspectRatio === '9:16'
                ? 'bg-[#00ffa3] text-[#080809] font-bold'
                : 'text-[#f0f0f2]/50 hover:text-[#f0f0f2]'
            }`}
          >
            9:16 Portrait
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Selector & Config (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Source Image Card */}
          <div className="p-5 bg-[#111114] border border-[rgba(240,240,242,0.08)] shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="label-precision text-[10px]">Source MRI Scan Slice</span>
              <label className="cursor-pointer font-mono text-[10px] text-[#00ffa3] hover:underline uppercase">
                Upload Custom
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Preview Box */}
            <div className="relative aspect-square max-h-[260px] border border-[rgba(240,240,242,0.08)] bg-black flex items-center justify-center group overflow-hidden">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Source Scan"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-4 text-slate-500 font-mono text-xs">
                  No image selected. Please choose a preset or upload.
                </div>
              )}
            </div>

            {/* Preset Selector */}
            <div>
              <span className="font-mono text-[10px] text-[#f0f0f2]/40 uppercase tracking-wider block mb-2">
                Preset Clinical Scans:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_SCANS.map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => setSelectedImage(scan.imageUrl)}
                    className={`relative aspect-square overflow-hidden border transition-all ${
                      selectedImage === scan.imageUrl
                        ? 'border-[#00ffa3] shadow-[0_0_10px_rgba(0,255,163,0.3)]'
                        : 'border-[rgba(240,240,242,0.08)] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={scan.imageUrl}
                      alt={scan.groundTruth}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-[#080809]/90 font-mono text-[8px] text-[#f0f0f2]/80 py-0.5 text-center uppercase truncate">
                      {scan.groundTruth}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="label-precision text-[10px]">Animation Prompt</span>
                <span className="font-mono text-[9px] text-[#00ffa3]/80 lowercase">veo-3.1-fast-generate-preview</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full bg-[#080809] border border-[rgba(240,240,242,0.12)] focus:border-[#00ffa3] p-3 font-mono text-xs text-[#f0f0f2] focus:outline-none resize-none"
                placeholder="Describe how the MRI slice should be animated into a video..."
              />

              {/* Preset prompt pills */}
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-[#f0f0f2]/40 uppercase tracking-wider">Presets:</span>
                <div className="space-y-1">
                  {presetPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(p)}
                      className="w-full text-left font-mono text-[10px] px-2.5 py-1.5 bg-[#080809] hover:bg-white/[0.04] text-[#f0f0f2]/60 hover:text-[#00ffa3] border border-[rgba(240,240,242,0.06)] truncate transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateVideo}
              disabled={isGenerating || !selectedImage}
              className="btn-cut w-full py-4 bg-[#00ffa3] hover:bg-white text-[#080809] font-mono font-bold text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00ffa3]/20"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#080809]" />
                  <span>Synthesizing ({generationProgress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Veo 3D Cine-Loop</span>
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

        {/* Right Column: Video Playback & Visualization Canvas (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 bg-[#111114] border border-[rgba(240,240,242,0.08)] shadow-lg flex flex-col items-center justify-center min-h-[460px]">
            {isGenerating ? (
              <div className="text-center py-16 space-y-6 max-w-md mx-auto font-mono">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-full h-full border-2 border-[#00ffa3] border-t-transparent animate-spin flex items-center justify-center">
                    <Video className="h-7 w-7 text-[#00ffa3]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-syne text-sm font-bold text-white uppercase tracking-wider">Veo Synthesis In Progress</h3>
                  <p className="text-[11px] text-[#f0f0f2]/60">{statusMessage}</p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#080809] h-1.5 overflow-hidden border border-[rgba(240,240,242,0.08)]">
                  <div
                    className="h-full bg-[#00ffa3] transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <span className="text-xs text-[#00ffa3]">{generationProgress}% Completed</span>
              </div>
            ) : generatedVideoUrl ? (
              <div className="w-full space-y-4 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#00ffa3]" />
                    <span className="text-xs font-bold text-[#f0f0f2] uppercase">Veo Cine-Loop Output</span>
                    <span className="text-[10px] px-2 py-0.5 bg-[#080809] text-[#00ffa3] border border-[#00ffa3]/30">
                      {aspectRatio} • 720P
                    </span>
                  </div>

                  <a
                    href={generatedVideoUrl}
                    download="neuroclass-veo-cineloop.mp4"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00ffa3]/10 hover:bg-[#00ffa3]/20 text-[#00ffa3] text-xs font-semibold border border-[#00ffa3]/40 transition-colors uppercase"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download MP4</span>
                  </a>
                </div>

                {/* Video Player Display */}
                <div
                  className={`relative mx-auto overflow-hidden border border-[rgba(240,240,242,0.12)] bg-black shadow-2xl flex items-center justify-center ${
                    aspectRatio === '9:16' ? 'max-w-[280px] aspect-[9/16]' : 'w-full aspect-video'
                  }`}
                >
                  <video
                    ref={videoRef}
                    src={generatedVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />

                  {/* Play/Pause overlay control */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-[#080809]/90 px-3 py-2 border border-[rgba(240,240,242,0.08)] text-xs">
                    <button
                      onClick={togglePlayPause}
                      className="p-1 text-[#00ffa3] hover:text-white transition-colors"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <span className="text-[10px] text-[#f0f0f2]/60 uppercase tracking-widest">
                      Veo 3D Neuro-Reconstruction
                    </span>
                    <button
                      onClick={() => videoRef.current?.requestFullscreen()}
                      className="p-1 text-[#f0f0f2]/60 hover:text-white"
                      title="Fullscreen"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 space-y-4 max-w-sm mx-auto text-[#f0f0f2]/40 font-mono">
                <div className="h-14 w-14 mx-auto border border-[rgba(240,240,242,0.1)] bg-[#080809] flex items-center justify-center text-[#00ffa3]">
                  <Film className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-syne text-sm font-semibold text-[#f0f0f2] uppercase tracking-wide">No Cine-Loop Rendered Yet</h3>
                  <p className="text-[11px] mt-1 text-[#f0f0f2]/40">
                    Select an MRI scan slice on the left, choose your aspect ratio, and click "Generate Veo 3D Cine-Loop".
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
