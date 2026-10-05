import React from 'react';
import {
  Activity,
  ArrowRight,
  Brain,
  CheckCircle2,
  Cpu,
  Database,
  Eye,
  FileText,
  Film,
  Layers,
  Lock,
  MessageSquare,
  Microscope,
  Palette,
  Ruler,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import { NavTabType } from './Navbar';
import { SAMPLE_SCANS } from '../data/sampleScans';
import { TumorClass } from '../types';

interface PortalHomeProps {
  onNavigateToTab: (tab: NavTabType, scanImageUrl?: string, contextData?: any) => void;
  onSelectScan: (scanId: string) => void;
  selectedModel: string;
}

const CLASS_THEME_COLORS: Record<TumorClass, { text: string; bg: string; border: string }> = {
  glioma: { text: '#ff3366', bg: 'rgba(255, 51, 102, 0.1)', border: 'rgba(255, 51, 102, 0.3)' },
  meningioma: { text: '#ffae00', bg: 'rgba(255, 174, 0, 0.1)', border: 'rgba(255, 174, 0, 0.3)' },
  pituitary: { text: '#9d00ff', bg: 'rgba(157, 0, 255, 0.1)', border: 'rgba(157, 0, 255, 0.3)' },
  no_tumor: { text: '#00ffa3', bg: 'rgba(0, 255, 163, 0.1)', border: 'rgba(0, 255, 163, 0.3)' },
};

export const PortalHome: React.FC<PortalHomeProps> = ({
  onNavigateToTab,
  onSelectScan,
  selectedModel,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 pb-16">
      {/* =========================================================================
          1. HERO EXECUTIVE SUMMARY: Clean, uncluttered clinical orientation
          ========================================================================= */}
      <section className="relative pt-4 sm:pt-8 pb-6 border-b border-white/[0.08]">
        {/* Telemetry pill row */}
        <div className="flex flex-wrap items-center gap-2 mb-4 font-mono text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5 text-[#00ffa3] bg-[#00ffa3]/10 px-2.5 py-0.5 border border-[#00ffa3]/30 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] animate-pulse" />
            CLINICAL CADx V2.5
          </span>
          <span className="text-zinc-600">/</span>
          <span className="flex items-center gap-1 text-zinc-300">
            <Cpu className="w-3.5 h-3.5 text-[#00ffa3]" />
            ACTIVE ENGINE: {selectedModel.toUpperCase()}
          </span>
          <span className="text-zinc-600">/</span>
          <span className="flex items-center gap-1 text-zinc-300">
            <Database className="w-3.5 h-3.5 text-[#00ffa3]" />
            PERSISTENT CLOUD SQL
          </span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            HIPAA COMPLIANT
          </span>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="max-w-3xl">
          <h1 className="font-syne text-3xl sm:text-4xl md:text-5xl font-black text-zinc-100 tracking-tight leading-tight">
            PRECISION NEURO-ONCOLOGY <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffa3] via-teal-300 to-cyan-400">
              CADx & GRAD-CAM EXPLAINABILITY
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed font-sans">
            NeuroClass is an institutional-grade computer-assisted diagnostic (CADx) platform designed for 
            radiologists and neuro-oncologists. Providing sub-second axial, coronal, and sagittal MRI classification,
            grad-CAM attention localization, calibrated tumor caliper metrication, and multi-turn clinical consultation.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs">
          <button
            onClick={() => onNavigateToTab('classifier')}
            className="px-5 py-3 bg-[#00ffa3] hover:bg-[#00e08f] text-black font-bold tracking-wider uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,163,0.3)] transition-all hover:scale-[1.02]"
          >
            <Activity className="w-4 h-4 text-black" />
            <span>Launch PACS Workstation</span>
            <ArrowRight className="w-3.5 h-3.5 text-black ml-1" />
          </button>

          <button
            onClick={() => onNavigateToTab('chat')}
            className="px-4 py-3 bg-[#121216] hover:bg-[#181820] text-zinc-200 border border-white/[0.12] hover:border-[#00ffa3]/50 tracking-wider uppercase flex items-center gap-2 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-[#00ffa3]" />
            <span>Consult Gemini 2.5</span>
          </button>

          <button
            onClick={() => onNavigateToTab('batch')}
            className="px-4 py-3 bg-[#121216] hover:bg-[#181820] text-zinc-200 border border-white/[0.12] hover:border-[#00ffa3]/50 tracking-wider uppercase flex items-center gap-2 transition-all"
          >
            <Layers className="w-4 h-4 text-[#00ffa3]" />
            <span>Batch Triage Queue</span>
          </button>
        </div>

        {/* Clinical Performance Metrics Strip */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
          <div className="p-3.5 bg-[#0e0e12] border border-white/[0.08]">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Model Accuracy</div>
            <div className="text-2xl font-bold text-[#00ffa3] mt-0.5">98.4%</div>
            <div className="text-[10px] text-zinc-400 mt-1">Cross-validated ResNet-50</div>
          </div>

          <div className="p-3.5 bg-[#0e0e12] border border-white/[0.08]">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">AUROC Score</div>
            <div className="text-2xl font-bold text-teal-400 mt-0.5">0.991</div>
            <div className="text-[10px] text-zinc-400 mt-1">Multi-class ROC AUC</div>
          </div>

          <div className="p-3.5 bg-[#0e0e12] border border-white/[0.08]">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Inference Latency</div>
            <div className="text-2xl font-bold text-cyan-400 mt-0.5">&lt;15ms</div>
            <div className="text-[10px] text-zinc-400 mt-1">Client-side WebGL acceleration</div>
          </div>

          <div className="p-3.5 bg-[#0e0e12] border border-white/[0.08]">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Histological Classes</div>
            <div className="text-2xl font-bold text-purple-400 mt-0.5">4 Types</div>
            <div className="text-[10px] text-zinc-400 mt-1">Glioma, Meningioma, Pituitary, Normal</div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. DEDICATED SECTIONS HUB: Distinct pages & functional capabilities
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-syne text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Clinical & Research System Modules
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Select a specialized module to initiate diagnosis, consult multimodal intelligence, or stress-test neural backbones.
            </p>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Diagnostic CADx Workstation */}
          <div
            onClick={() => onNavigateToTab('classifier')}
            className="group p-5 bg-[#0d0d10] hover:bg-[#121217] border border-white/[0.08] hover:border-[#00ffa3]/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded bg-[#00ffa3]/10 border border-[#00ffa3]/30 flex items-center justify-center text-[#00ffa3]">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#00ffa3] bg-[#00ffa3]/10 px-2 py-0.5 border border-[#00ffa3]/30">
                  Primary Workstation
                </span>
              </div>
              <h3 className="font-syne text-base font-bold text-zinc-100 group-hover:text-[#00ffa3] transition-colors">
                Diagnostic CADx & PACS Viewport
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Full-featured 100vh radiological DICOM viewport with Grad-CAM++ neural explainability,
                calibrated electronic calipers (0.8mm/px), 5 windowing filters, and DICOM telemetry readouts.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-zinc-400 group-hover:text-[#00ffa3] transition-colors">
              <span>Open Workstation</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 2: NeuroConsult AI (Gemini 2.5) */}
          <div
            onClick={() => onNavigateToTab('chat')}
            className="group p-5 bg-[#0d0d10] hover:bg-[#121217] border border-white/[0.08] hover:border-[#00ffa3]/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 border border-blue-500/30">
                  Multimodal AI
                </span>
              </div>
              <h3 className="font-syne text-base font-bold text-zinc-100 group-hover:text-[#00ffa3] transition-colors">
                NeuroConsult Clinical Dialogue
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Multi-turn radiologic dialogue powered by Gemini 2.5 Flash. Ingests patient MRI voxels,
                tumor volume measurements, and differential diagnosis for structured second-opinion consults.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-zinc-400 group-hover:text-[#00ffa3] transition-colors">
              <span>Start Consultation</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 3: Batch Triage Queue */}
          <div
            onClick={() => onNavigateToTab('batch')}
            className="group p-5 bg-[#0d0d10] hover:bg-[#121217] border border-white/[0.08] hover:border-[#00ffa3]/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2 py-0.5 border border-teal-500/30">
                  High Throughput
                </span>
              </div>
              <h3 className="font-syne text-base font-bold text-zinc-100 group-hover:text-[#00ffa3] transition-colors">
                Batch Patient Triage Queue
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Ingest institutional cohort batches simultaneously. Automatically classifies urgent cases,
                flags high-grade lesions for immediate resection review, and allows 1-click CADx handover.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-zinc-400 group-hover:text-[#00ffa3] transition-colors">
              <span>Open Batch Queue</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 4: Veo 3D Cine-Loop Studio */}
          <div
            onClick={() => onNavigateToTab('video')}
            className="group p-5 bg-[#0d0d10] hover:bg-[#121217] border border-white/[0.08] hover:border-[#00ffa3]/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Film className="w-4 h-4" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 border border-purple-500/30">
                  Veo Video Gen
                </span>
              </div>
              <h3 className="font-syne text-base font-bold text-zinc-100 group-hover:text-[#00ffa3] transition-colors">
                Veo 3D Volumetric Cine-Loop Studio
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Generate high-definition 3D temporal MRI cine-loops using Google Veo. Synthesizes smooth
                volumetric slice transitions for surgical trajectory mapping and anatomical review.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-zinc-400 group-hover:text-[#00ffa3] transition-colors">
              <span>Launch Cine Studio</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 5: Medical Image Studio */}
          <div
            onClick={() => onNavigateToTab('image-studio')}
            className="group p-5 bg-[#0d0d10] hover:bg-[#121217] border border-white/[0.08] hover:border-[#00ffa3]/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Palette className="w-4 h-4" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/30">
                  Imagen Super-Res
                </span>
              </div>
              <h3 className="font-syne text-base font-bold text-zinc-100 group-hover:text-[#00ffa3] transition-colors">
                Medical Image Studio & Enhancement
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Apply super-resolution artifact reduction, synthetic slice generation, and modality translation
                (T1-CE to T2-FLAIR) for educational neuro-pathology instruction.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-zinc-400 group-hover:text-[#00ffa3] transition-colors">
              <span>Open Image Studio</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 6: Model Evaluation & Benchmarks */}
          <div
            onClick={() => onNavigateToTab('benchmarks')}
            className="group p-5 bg-[#0d0d10] hover:bg-[#121217] border border-white/[0.08] hover:border-[#00ffa3]/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Microscope className="w-4 h-4" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 border border-rose-500/30">
                  Validation
                </span>
              </div>
              <h3 className="font-syne text-base font-bold text-zinc-100 group-hover:text-[#00ffa3] transition-colors">
                Model Benchmarks & ROC Curves
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Inspect 4-class confusion matrices, sensitivity, specificity, and F1-score across 5 model backbones
                (ResNet-50, MobileNet-V2, EfficientNet-B0, Inception-V3, Custom CNN).
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-zinc-400 group-hover:text-[#00ffa3] transition-colors">
              <span>View ROC Metrics</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. INTERACTIVE CASE SHOWCASE: Instant 1-click workstation launch
          ========================================================================= */}
      <section className="space-y-4 pt-4 border-t border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-syne text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Pre-Validated Clinical Case Library
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Click any verified MRI case below to load it directly into the 100vh PACS workstation with live neural inferencing.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('classifier')}
            className="self-start sm:self-auto font-mono text-xs text-[#00ffa3] hover:underline flex items-center gap-1"
          >
            <span>View all cases in workstation</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Case Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_SCANS.slice(0, 4).map((scan) => {
            const theme = CLASS_THEME_COLORS[scan.groundTruth];
            return (
              <div
                key={scan.id}
                onClick={() => onSelectScan(scan.id)}
                className="group bg-[#0d0d10] hover:bg-[#14141a] border border-white/[0.08] hover:border-[#00ffa3]/50 transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                {/* Scan Image Thumbnail */}
                <div className="relative aspect-square w-full bg-black overflow-hidden">
                  <img
                    src={scan.imageUrl}
                    alt={scan.patientId}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-85 group-hover:opacity-100"
                  />
                  <div className="absolute top-2 left-2 font-mono text-[9px] bg-black/80 px-1.5 py-0.5 border border-white/10 text-zinc-200">
                    {scan.patientId}
                  </div>
                  <div
                    className="absolute top-2 right-2 font-mono text-[9px] px-1.5 py-0.5 border uppercase font-bold"
                    style={{
                      color: theme.text,
                      backgroundColor: theme.bg,
                      borderColor: theme.border,
                    }}
                  >
                    {scan.groundTruth}
                  </div>
                </div>

                {/* Case Info */}
                <div className="p-3 font-mono space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-200 font-bold">{scan.name}</span>
                    <span className="text-zinc-400 text-[10px]">{scan.age}Y · {scan.gender}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    {scan.sequence} · {scan.slicePlane}
                  </div>
                  <div className="pt-2 text-[10px] text-[#00ffa3] group-hover:underline flex items-center justify-between">
                    <span>Load Case Into PACS</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          4. GOVERNANCE, AUDIT TRAILS & DATA SOVEREIGNTY
          ========================================================================= */}
      <section className="p-5 bg-[#0a0a0d] border border-white/[0.08] grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-zinc-400">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#00ffa3] shrink-0 mt-0.5" />
          <div>
            <div className="text-zinc-200 font-bold text-[11px] uppercase tracking-wider">
              Zero Telemetry Leakage
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
              Diagnostic inference runs entirely client-side or on dedicated Google Cloud SQL instances. No unanonymized PHI is stored on public servers.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-zinc-200 font-bold text-[11px] uppercase tracking-wider">
              HIPAA & DICOM Standardized
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
              Calibrated pixel spacing (0.8 mm/px), window/level presets, and structured DICOM reporting match hospital PACS specifications.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-zinc-200 font-bold text-[11px] uppercase tracking-wider">
              PostgreSQL Cloud Archive
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
              Persistent Cloud SQL database integration enables saving diagnostic impressions, tumor metric history, and clinician audit trails.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
