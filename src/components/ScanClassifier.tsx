import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileCheck,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { SampleMri, ModelPrediction } from '../types';
import { SAMPLE_SCANS } from '../data/sampleScans';
import { predictMriScan, TUMOR_CLASSES_METADATA } from '../utils/mriEngine';
import { MriViewer } from './MriViewer';
import { ClinicalReportModal } from './ClinicalReportModal';
import { NavTabType } from './Navbar';
import { MessageSquare, Film, Palette } from 'lucide-react';

interface ScanClassifierProps {
  selectedModel: string;
  selectedScanId?: string | null;
  onNavigateToTab?: (tab: NavTabType, scanImageUrl?: string, contextData?: any) => void;
}

export const ScanClassifier: React.FC<ScanClassifierProps> = ({
  selectedModel,
  selectedScanId,
  onNavigateToTab
}) => {
  // Current Active Scan
  const [currentScan, setCurrentScan] = useState<SampleMri>(SAMPLE_SCANS[0]);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string>(SAMPLE_SCANS[0].patientId);
  const [patientAge, setPatientAge] = useState<number>(SAMPLE_SCANS[0].age);
  const [patientGender, setPatientGender] = useState<string>(SAMPLE_SCANS[0].gender);
  const [slicePlane, setSlicePlane] = useState<string>(SAMPLE_SCANS[0].slicePlane);
  const [sequence, setSequence] = useState<string>(SAMPLE_SCANS[0].sequence);

  // Sync scan if selectedScanId is passed from external tab/triage
  useEffect(() => {
    if (selectedScanId) {
      const found = SAMPLE_SCANS.find(s => s.id === selectedScanId);
      if (found) {
        setCurrentScan(found);
        setCustomImageUrl(null);
        setPatientId(found.patientId);
        setPatientAge(found.age);
        setPatientGender(found.gender);
        setSlicePlane(found.slicePlane);
        setSequence(found.sequence);
      }
    }
  }, [selectedScanId]);

  // Inference state
  const [prediction, setPrediction] = useState<ModelPrediction | null>(null);
  const [isInferring, setIsInferring] = useState<boolean>(false);

  // Report modal state
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Run prediction whenever current scan or model changes
  const runPrediction = async (url: string) => {
    setIsInferring(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = async () => {
      const pred = await predictMriScan(img, selectedModel);
      setPrediction(pred);
      setIsInferring(false);
    };
  };

  useEffect(() => {
    const url = customImageUrl || currentScan.imageUrl;
    runPrediction(url);
  }, [currentScan, customImageUrl, selectedModel]);

  // Handle custom upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const res = event.target.result as string;
          setCustomImageUrl(res);
          setPatientId(`UPLOAD-${Math.floor(Math.random() * 8999 + 1000)}`);
          setPatientAge(52);
          setPatientGender('M');
          setSlicePlane('Axial');
          setSequence('T1-CE (Contrast Enhanced)');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Select sample case
  const selectSampleCase = (sample: SampleMri) => {
    setCustomImageUrl(null);
    setCurrentScan(sample);
    setPatientId(sample.patientId);
    setPatientAge(sample.age);
    setPatientGender(sample.gender);
    setSlicePlane(sample.slicePlane);
    setSequence(sample.sequence);
  };

  const activeImageUrl = customImageUrl || currentScan.imageUrl;

  return (
    <div className="space-y-6">
      {/* Top Banner / Triage Callout */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-semibold border border-cyan-500/30">
                CLINICAL INFERENCE ENGINE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Active Architecture: <strong className="text-white">{selectedModel}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Brain Tumor Multi-Class Classification & Grad-CAM Analysis
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Upload patient neuroimaging or evaluate standard clinical benchmark cases. Our neural network segments features across Glioma, Meningioma, Pituitary Adenoma, and Healthy controls with real-time Class Activation Mapping.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReportOpen(true)}
              disabled={!prediction}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-cyan-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-4 w-4" />
              <span>Generate Clinical Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Viewer + Inference Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive MRI Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <MriViewer
            imageUrl={activeImageUrl}
            prediction={prediction}
            patientId={patientId}
            sequence={sequence}
            slicePlane={slicePlane}
          />

          {/* Quick Case Switcher Carousel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5 text-cyan-400" />
                Verified Clinical Library (Click to Evaluate)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {SAMPLE_SCANS.length} Scans Loaded
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_SCANS.map((scan) => {
                const isSelected = !customImageUrl && currentScan.id === scan.id;
                const meta = TUMOR_CLASSES_METADATA[scan.groundTruth];
                return (
                  <button
                    key={scan.id}
                    onClick={() => selectSampleCase(scan)}
                    className={`p-2 rounded-lg border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-sm shadow-cyan-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[10px] font-mono text-slate-400 font-bold truncate">
                        {scan.patientId}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: meta.color }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-200 truncate block">
                      {meta.label.replace(' Tumor', '')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {scan.slicePlane} • {scan.sequence.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Prediction & Clinical Intelligence (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Primary Prediction Diagnostic Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            {isInferring && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-20">
                <div className="flex items-center gap-2.5 text-cyan-400 font-mono text-xs">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Computing Convolutional Activations...</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                Diagnosis Prediction
              </span>
              {prediction && (
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <Clock className="h-3 w-3 text-cyan-400" />
                  <span>{prediction.inferenceTimeMs}ms inference</span>
                </div>
              )}
            </div>

            {prediction ? (
              <div className="mt-4 space-y-4">
                {/* Result Title & Confidence */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-2xl font-bold tracking-tight"
                      style={{ color: prediction.probabilities[0].color }}
                    >
                      {prediction.label}
                    </span>
                    <span
                      className="px-2.5 py-1 rounded-lg font-mono font-bold text-xs"
                      style={{
                        backgroundColor: `${prediction.triageColor}20`,
                        color: prediction.triageColor,
                        border: `1px solid ${prediction.triageColor}40`
                      }}
                    >
                      {prediction.triagePriority}
                    </span>
                  </div>

                  {/* Main Probability Metric */}
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold font-mono text-white">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-400">model certainty</span>
                    <span className="text-slate-600 text-xs">•</span>
                    <span className="text-xs font-mono text-slate-400">
                      Entropy: {prediction.uncertaintyScore} bits
                    </span>
                  </div>
                </div>

                {/* Multi-Class Probability Breakdown */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Classification Distribution:
                  </span>
                  {prediction.probabilities.map((item) => (
                    <div key={item.className} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300 font-medium">{item.label}</span>
                        <span className="text-slate-400">{(item.probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.probability * 100}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Anatomical ROI metrics */}
                {prediction.predictedClass !== 'no_tumor' && (
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">ESTIMATED DIAMETER</span>
                      <span className="text-cyan-300 font-bold text-sm">
                        {prediction.gradCamRoi.estimatedDiameterMm} mm
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">ESTIMATED 2D AREA</span>
                      <span className="text-cyan-300 font-bold text-sm">
                        {prediction.gradCamRoi.estimatedAreaMm2} mm²
                      </span>
                    </div>
                  </div>
                )}

                {/* Clinical Notes & Action */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 space-y-1.5">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                    AI Diagnostic Impression:
                  </span>
                  <p className="leading-relaxed">
                    {TUMOR_CLASSES_METADATA[prediction.predictedClass].description}
                  </p>
                </div>

                {/* GenAI Workflow Quick Navigation */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">
                    AI Clinical Extension Modules:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() =>
                        onNavigateToTab?.('chat', activeImageUrl, {
                          id: currentScan.id,
                          prediction: TUMOR_CLASSES_METADATA[prediction.predictedClass].label,
                          confidence: prediction.confidence,
                          sequence,
                          description: TUMOR_CLASSES_METADATA[prediction.predictedClass].description,
                        })
                      }
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-[11px] font-semibold transition"
                      title="Open multi-turn Gemini consultation for this case"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Consult Gemini</span>
                    </button>

                    <button
                      onClick={() => onNavigateToTab?.('video', activeImageUrl)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition"
                      title="Generate 3D volumetric cine-loop using Veo"
                    >
                      <Film className="h-3 w-3" />
                      <span>Veo 3D Cine</span>
                    </button>

                    <button
                      onClick={() => onNavigateToTab?.('image-studio', activeImageUrl)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[11px] font-semibold transition"
                      title="Edit or enhance scan with Gemini Image Studio"
                    >
                      <Palette className="h-3 w-3" />
                      <span>Enhance Scan</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Upload Custom MRI Scan Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
              <UploadCloud className="h-4 w-4 text-cyan-400" />
              Upload Custom Patient MRI
            </h3>

            <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/80 bg-slate-950/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition group">
              <UploadCloud className="h-8 w-8 text-slate-500 group-hover:text-cyan-400 transition mb-2" />
              <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                Drag and drop brain MRI image here
              </span>
              <span className="text-[11px] text-slate-500 mt-1">
                Supports DICOM-derived PNG, JPEG, TIFF (224x224 normalized)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {customImageUrl && (
              <div className="mt-3 flex items-center justify-between text-xs font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-800/40 px-3 py-1.5 rounded-lg">
                <span className="truncate">Custom scan loaded: {patientId}</span>
                <button
                  onClick={() => selectSampleCase(SAMPLE_SCANS[0])}
                  className="text-xs underline text-slate-400 hover:text-white ml-2"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {prediction && (
        <ClinicalReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          prediction={prediction}
          scanInfo={{
            patientId,
            age: patientAge,
            gender: patientGender,
            sequence,
            slicePlane,
            scanName: currentScan.name
          }}
        />
      )}
    </div>
  );
};
