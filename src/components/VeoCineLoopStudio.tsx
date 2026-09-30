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
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Film className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Veo 3D Cine-Loop Video Studio</h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
              veo-3.1-fast-generate-preview
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Transform static 2D brain tumor MRI scan slices into dynamic 3D rotational cine-loop videos and neurosurgical fly-throughs.
          </p>
        </div>

        {/* Aspect Ratio Selector: 16:9 or 9:16 as specified in prompt */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 px-2 font-mono">Aspect Ratio:</span>
          <button
            onClick={() => setAspectRatio('16:9')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              aspectRatio === '16:9'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            16:9 Landscape
          </button>
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              aspectRatio === '9:16'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
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
          <div className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5 text-cyan-400" />
                Source MRI Scan Slice
              </label>
              <label className="cursor-pointer text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                Upload Custom Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Preview Box */}
            <div className="relative aspect-square max-h-[260px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center group">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Source Scan"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-4 text-slate-500 text-xs">
                  No image selected. Please choose a preset or upload.
                </div>
              )}
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-xs bg-slate-900/90 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700">
                  Ready for Veo Animation
                </span>
              </div>
            </div>

            {/* Preset Selector */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-2 font-mono">
                Or select from preset clinical scans:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_SCANS.map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => setSelectedImage(scan.imageUrl)}
                    className={`relative aspect-square rounded-lg overflow-hidden border transition-all ${
                      selectedImage === scan.imageUrl
                        ? 'border-cyan-400 ring-2 ring-cyan-500/30'
                        : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={scan.imageUrl}
                      alt={scan.groundTruth}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] text-slate-300 py-0.5 text-center capitalize truncate">
                      {scan.groundTruth}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input Area */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Animation Prompt</span>
                <span className="text-[10px] text-cyan-400 lowercase font-mono">veo-3.1-fast-generate-preview</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-500 p-3 text-xs text-slate-200 focus:outline-none resize-none"
                placeholder="Describe how the MRI slice should be animated..."
              />

              {/* Preset prompt pills */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono">Preset Prompts:</span>
                <div className="space-y-1">
                  {presetPrompts.map((p, idx) => (
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
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateVideo}
              disabled={isGenerating || !selectedImage}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Synthesizing Veo Cine-Loop ({generationProgress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Veo 3D Cine-Loop</span>
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

        {/* Right Column: Video Playback & Visualization Canvas (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800 shadow-lg flex flex-col items-center justify-center min-h-[460px]">
            {isGenerating ? (
              <div className="text-center py-16 space-y-6 max-w-md mx-auto">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping" />
                  <div className="w-full h-full rounded-full border-4 border-cyan-400 border-t-transparent animate-spin flex items-center justify-center">
                    <Video className="h-8 w-8 text-cyan-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">Veo Video Generation In Progress</h3>
                  <p className="text-xs text-slate-400">{statusMessage}</p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-cyan-400">{generationProgress}% Completed</span>
              </div>
            ) : generatedVideoUrl ? (
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">Veo Generated Cine-Loop</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                      {aspectRatio} • 720p H.264
                    </span>
                  </div>

                  <a
                    href={generatedVideoUrl}
                    download="neuroclass-veo-cineloop.mp4"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-medium border border-cyan-500/30 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download MP4</span>
                  </a>
                </div>

                {/* Video Player Display */}
                <div
                  className={`relative mx-auto rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl flex items-center justify-center ${
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
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-950/70 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={togglePlayPause}
                      className="p-1 rounded text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <span className="font-mono text-[11px] text-slate-400">Veo 3D Neuro-Reconstruction</span>
                    <button
                      onClick={() => videoRef.current?.requestFullscreen()}
                      className="p-1 rounded text-slate-400 hover:text-slate-200"
                      title="Fullscreen"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 space-y-4 max-w-sm mx-auto text-slate-500">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400">
                  <Film className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-300">No Cine-Loop Rendered Yet</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Select an MRI scan slice on the left, choose your aspect ratio (`16:9` or `9:16`), and click "Generate Veo 3D Cine-Loop".
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
