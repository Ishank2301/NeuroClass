import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  RefreshCw,
  MessageSquare,
  Film,
  Palette,
  Crosshair,
  Database,
  Check,
  FileText,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { SampleMri, ModelPrediction, TumorClass } from '../types';
import { SAMPLE_SCANS } from '../data/sampleScans';
import { predictMriScan, TUMOR_CLASSES_METADATA } from '../utils/mriEngine';
import { MriViewer } from './MriViewer';
import { ClinicalReportModal } from './ClinicalReportModal';
import { NavTabType } from './Navbar';
import { useAuth } from '../context/AuthContext';

interface ScanClassifierProps {
  selectedModel: string;
  selectedScanId?: string | null;
  onNavigateToTab?: (tab: NavTabType, scanImageUrl?: string, contextData?: any) => void;
}

const CLASS_COLORS: Record<TumorClass, string> = {
  glioma: '#ff3366',
  meningioma: '#ffae00',
  pituitary: '#9d00ff',
  no_tumor: '#00ffa3',
};

export const ScanClassifier: React.FC<ScanClassifierProps> = ({
  selectedModel,
  selectedScanId,
  onNavigateToTab,
}) => {
  // Current Active Scan
  const [currentScan, setCurrentScan] = useState<SampleMri>(SAMPLE_SCANS[0]);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string>(SAMPLE_SCANS[0].patientId);
  const [patientAge, setPatientAge] = useState<number>(SAMPLE_SCANS[0].age);
  const [patientGender, setPatientGender] = useState<string>(SAMPLE_SCANS[0].gender);
  const [slicePlane, setSlicePlane] = useState<string>(SAMPLE_SCANS[0].slicePlane);
  const [sequence, setSequence] = useState<string>(SAMPLE_SCANS[0].sequence);

  // Mobile column switcher ('queue' | 'viewport' | 'findings')
  const [mobileView, setMobileView] = useState<'queue' | 'viewport' | 'findings'>('viewport');

  // Sync scan if selectedScanId is passed from external tab/triage
  useEffect(() => {
    if (selectedScanId) {
      const found = SAMPLE_SCANS.find((s) => s.id === selectedScanId);
      if (found) {
        setCurrentScan(found);
        setCustomImageUrl(null);
        setPatientId(found.patientId);
        setPatientAge(found.age);
        setPatientGender(found.gender);
        setSlicePlane(found.slicePlane);
        setSequence(found.sequence);
        setMobileView('viewport');
      }
    }
  }, [selectedScanId]);

  // Inference state
  const [prediction, setPrediction] = useState<ModelPrediction | null>(null);
  const [isInferring, setIsInferring] = useState<boolean>(false);

  // Report modal state
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Active scan image
  const activeImageUrl = customImageUrl || currentScan.imageUrl;

  // Run prediction whenever active scan or model changes
  useEffect(() => {
    let isMounted = true;
    setIsInferring(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeImageUrl;
    img.onload = async () => {
      try {
        const pred = await predictMriScan(img, selectedModel);
        if (isMounted) {
          setPrediction(pred);
          setIsInferring(false);
        }
      } catch (err) {
        console.error('Inference error:', err);
        if (isMounted) setIsInferring(false);
      }
    };

    return () => {
      isMounted = false;
    };
  }, [activeImageUrl, selectedModel]);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          setCustomImageUrl(base64);
          setPatientId(`UPLOAD-${Math.floor(1000 + Math.random() * 9000)}`);
          setPatientAge(52);
          setPatientGender('M');
          setSlicePlane('Axial');
          setSequence('T1-CE Contrast Enhanced');
          setMobileView('viewport');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const selectSampleCase = (scan: SampleMri) => {
    setCurrentScan(scan);
    setCustomImageUrl(null);
    setPatientId(scan.patientId);
    setPatientAge(scan.age);
    setPatientGender(scan.gender);
    setSlicePlane(scan.slicePlane);
    setSequence(scan.sequence);
    setMobileView('viewport');
  };

  // Save to Cloud SQL state
  const { saveScanToCloudSql, isAuthenticated, setAuthModalOpen } = useAuth();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSaveToDatabase = async () => {
    if (!prediction) return;
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    setSaveStatus('saving');
    const res = await saveScanToCloudSql({
      patientRef: patientId,
      scanName: currentScan.name,
      scanUrl: customImageUrl || currentScan.imageUrl,
      predictedClass: prediction.predictedClass,
      confidence: `${prediction.confidence}%`,
      slicePlane,
      heatmapType: 'Grad-CAM++',
      clinicalNotes: `Diagnostic CADx verification via ${selectedModel} with estimated diameter ${prediction.gradCamRoi.estimatedDiameterMm}mm.`,
    });
    if (res.success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3500);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const currentThemeColor = prediction ? CLASS_COLORS[prediction.predictedClass] : '#00ffa3';

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#08080a] border border-white/[0.08] shadow-2xl">
      {/* Mobile/Tablet View Segmented Switcher (Visible only < 1024px) */}
      <div className="lg:hidden flex items-center justify-between px-3 py-2 bg-[#0e0e12] border-b border-white/[0.08] shrink-0 font-mono text-xs">
        <span className="text-zinc-400 font-bold uppercase">Workstation View:</span>
        <div className="flex items-center gap-1 bg-[#16161c] p-0.5 border border-white/[0.08]">
          <button
            onClick={() => setMobileView('queue')}
            className={`px-2.5 py-1 transition-colors ${
              mobileView === 'queue' ? 'bg-[#00ffa3]/20 text-[#00ffa3] font-bold' : 'text-zinc-400'
            }`}
          >
            Queue
          </button>
          <button
            onClick={() => setMobileView('viewport')}
            className={`px-2.5 py-1 transition-colors ${
              mobileView === 'viewport' ? 'bg-[#00ffa3]/20 text-[#00ffa3] font-bold' : 'text-zinc-400'
            }`}
          >
            PACS Scan
          </button>
          <button
            onClick={() => setMobileView('findings')}
            className={`px-2.5 py-1 transition-colors ${
              mobileView === 'findings' ? 'bg-[#00ffa3]/20 text-[#00ffa3] font-bold' : 'text-zinc-400'
            }`}
          >
            Findings
          </button>
        </div>
      </div>

      {/* 3-Column PACS Workstation Grid (Strict 100% Height Fill) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_350px] overflow-hidden">
        {/* =========================================================================
            LEFT COLUMN: MRI Directory & Ingest Queue (Independent Scroll)
            ========================================================================= */}
        <aside
          className={`flex-col justify-between border-r border-white/[0.08] bg-[#0c0c0f]/70 overflow-y-auto p-3.5 space-y-4 ${
            mobileView === 'queue' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-zinc-400 tracking-wider uppercase font-semibold">
              <span className="flex items-center gap-1.5 text-[#00ffa3]">
                <Layers className="w-3.5 h-3.5" />
                Case Directory
              </span>
              <span className="text-[10px] text-zinc-500 font-normal">
                {SAMPLE_SCANS.length} Cases
              </span>
            </div>

            {/* Case List */}
            <div className="space-y-1.5">
              {SAMPLE_SCANS.map((scan) => {
                const isActive = !customImageUrl && currentScan.id === scan.id;
                const scanColor = CLASS_COLORS[scan.groundTruth];

                return (
                  <div
                    key={scan.id}
                    onClick={() => selectSampleCase(scan)}
                    className={`p-2.5 border transition-all cursor-pointer font-mono ${
                      isActive
                        ? 'bg-[#15151c] border-[#00ffa3]/50 shadow-sm'
                        : 'bg-[#101014] border-white/[0.05] hover:bg-[#15151a] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isActive ? 'text-[#00ffa3]' : 'text-zinc-200'}`}>
                        {scan.patientId}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full inline-block shadow-sm"
                          style={{ backgroundColor: scanColor }}
                          title={`Ground Truth: ${scan.groundTruth}`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                      <span style={{ color: scanColor }} className="font-semibold uppercase">
                        {scan.groundTruth}
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span>{scan.sequence.slice(0, 6)}</span>
                      <span className="text-zinc-600">·</span>
                      <span>{scan.slicePlane}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ingest Portal */}
          <div className="pt-3 border-t border-white/[0.08]">
            <div className="text-[10px] font-mono text-zinc-400 tracking-wider uppercase mb-2 font-semibold">
              Scan Ingest Portal
            </div>

            <div className="border border-dashed border-white/[0.15] hover:border-[#00ffa3]/60 bg-[#101014] p-3 text-center transition-all group cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <UploadCloud className="h-5 w-5 text-[#00ffa3]/70 group-hover:text-[#00ffa3] mx-auto mb-1.5 transition-colors" />
              <div className="font-mono text-[10px] text-zinc-200 font-bold">
                IMPORT LOCAL SCAN
              </div>
              <div className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">
                DICOM / PNG / JPEG
              </div>
            </div>

            {customImageUrl && (
              <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[#00ffa3] bg-[#00ffa3]/10 border border-[#00ffa3]/30 px-2.5 py-1.5">
                <span className="truncate">Loaded: {patientId}</span>
                <button
                  onClick={() => selectSampleCase(SAMPLE_SCANS[0])}
                  className="text-[10px] text-zinc-400 hover:text-white underline ml-2 shrink-0"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* =========================================================================
            CENTER COLUMN: Fixed PACS Canvas Viewport & Quick Extension Dock
            ========================================================================= */}
        <section
          className={`flex-col justify-between bg-black overflow-hidden relative ${
            mobileView === 'viewport' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* PACS Viewer Stage */}
          <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center">
            <MriViewer
              imageUrl={activeImageUrl}
              prediction={prediction}
              patientId={patientId}
              sequence={sequence}
              slicePlane={slicePlane}
            />
          </div>

          {/* Quick Precision Extension Modules Dock */}
          <div className="h-11 px-4 border-t border-white/[0.08] bg-[#09090b] flex items-center justify-between gap-2 shrink-0 z-10">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Crosshair className="h-3.5 w-3.5 text-[#00ffa3]" />
              <span className="hidden sm:inline">Clinical Extension Handover:</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  onNavigateToTab?.('chat', activeImageUrl, {
                    id: currentScan.id,
                    prediction: prediction ? TUMOR_CLASSES_METADATA[prediction.predictedClass].label : 'Unknown',
                    confidence: prediction?.confidence || 0,
                    sequence,
                    description: prediction ? TUMOR_CLASSES_METADATA[prediction.predictedClass].description : '',
                  })
                }
                className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 bg-[#141418] hover:bg-[#1a1a22] text-zinc-200 border border-white/[0.1] hover:border-[#00ffa3]/50 transition-all flex items-center gap-1.5"
                title="Consult Gemini 2.5 Flash on this patient case"
              >
                <MessageSquare className="h-3 w-3 text-[#00ffa3]" />
                <span>Consult Gemini</span>
              </button>

              <button
                onClick={() => onNavigateToTab?.('video', activeImageUrl)}
                className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 bg-[#141418] hover:bg-[#1a1a22] text-zinc-200 border border-white/[0.1] hover:border-[#00ffa3]/50 transition-all flex items-center gap-1.5"
                title="Synthesize 3D temporal MRI Cine-Loop via Veo"
              >
                <Film className="h-3 w-3 text-[#00ffa3]" />
                <span>Veo Cine</span>
              </button>

              <button
                onClick={() => onNavigateToTab?.('image-studio', activeImageUrl)}
                className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 bg-[#141418] hover:bg-[#1a1a22] text-zinc-200 border border-white/[0.1] hover:border-[#00ffa3]/50 transition-all flex items-center gap-1.5"
                title="Medical Image Studio enhancement"
              >
                <Palette className="h-3 w-3 text-[#00ffa3]" />
                <span>Enhance</span>
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            RIGHT COLUMN: Diagnostic Inference, Metrics & Actions (Independent Scroll)
            ========================================================================= */}
        <aside
          className={`flex-col justify-between border-l border-white/[0.08] bg-[#0c0c0f]/70 overflow-y-auto p-4 space-y-4 ${
            mobileView === 'findings' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="space-y-4">
            {/* Header Diagnosis */}
            <div className="pb-3 border-b border-white/[0.08]">
              <div className="text-[10px] font-mono text-zinc-400 tracking-wider uppercase mb-1 font-semibold flex items-center justify-between">
                <span>Diagnostic Inference</span>
                <span className="text-[#00ffa3] font-normal">{selectedModel}</span>
              </div>

              {isInferring ? (
                <div className="py-4 flex items-center gap-2.5">
                  <RefreshCw className="h-5 w-5 text-[#00ffa3] animate-spin" />
                  <span className="font-mono text-xs text-[#00ffa3] font-bold">ANALYZING VOXELS...</span>
                </div>
              ) : prediction ? (
                <div>
                  <h2
                    className="font-syne text-xl sm:text-2xl font-black tracking-tight"
                    style={{ color: currentThemeColor }}
                  >
                    {prediction.predictedClass === 'no_tumor' ? 'NO TUMOR DETECTED' : prediction.label}
                  </h2>
                  <div className="mt-1 flex items-center gap-2 font-mono text-xs">
                    <span className="text-[#00ffa3] font-bold">{prediction.confidence}% CONFIDENCE</span>
                    <span className="text-zinc-600">·</span>
                    <span
                      className="font-semibold uppercase text-[11px]"
                      style={{ color: prediction.triageColor }}
                    >
                      {prediction.triagePriority} Priority
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Stat Grid: Diameter & Area */}
            {prediction && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#121216] border border-white/[0.06] p-2.5 font-mono">
                  <div className="text-[9px] text-zinc-400 uppercase tracking-wider mb-0.5">Est. Diameter</div>
                  <div className="text-base font-bold" style={{ color: currentThemeColor }}>
                    {prediction.gradCamRoi.estimatedDiameterMm}
                    <span className="text-xs text-zinc-500 font-normal ml-1">mm</span>
                  </div>
                </div>

                <div className="bg-[#121216] border border-white/[0.06] p-2.5 font-mono">
                  <div className="text-[9px] text-zinc-400 uppercase tracking-wider mb-0.5">Est. Area</div>
                  <div className="text-base font-bold" style={{ color: currentThemeColor }}>
                    {prediction.gradCamRoi.estimatedAreaMm2}
                    <span className="text-xs text-zinc-500 font-normal ml-1">mm²</span>
                  </div>
                </div>
              </div>
            )}

            {/* Differential Analysis Probability Matrix */}
            {prediction && (
              <div>
                <div className="text-[10px] font-mono text-zinc-400 tracking-wider uppercase mb-2 font-semibold">
                  Differential Probability Matrix
                </div>
                <div className="space-y-2 font-mono text-xs">
                  {prediction.probabilities.map((prob) => {
                    const barColor = CLASS_COLORS[prob.className];
                    return (
                      <div key={prob.className} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-300 uppercase tracking-wider">{prob.label}</span>
                          <span className="font-bold text-zinc-100">{prob.probability}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-500 rounded-full"
                            style={{
                              width: `${prob.probability}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Clinical Impression Note */}
            {prediction && (
              <div className="p-3 bg-[#111116] border border-white/[0.06] font-mono text-xs">
                <div className="text-[9px] uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                  Clinical Impression
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  {TUMOR_CLASSES_METADATA[prediction.predictedClass].description}
                </p>
              </div>
            )}
          </div>

          {/* Action Sign-Off Buttons */}
          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            {prediction && (
              <button
                onClick={handleSaveToDatabase}
                disabled={saveStatus === 'saving'}
                className={`w-full py-2.5 px-3 font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 border transition-all ${
                  saveStatus === 'saved'
                    ? 'bg-emerald-950/70 text-[#00ffa3] border-[#00ffa3]'
                    : saveStatus === 'error'
                    ? 'bg-rose-950/70 text-rose-300 border-rose-500'
                    : 'bg-[#141418] hover:bg-[#1a1a22] text-[#00ffa3] border-white/[0.12] hover:border-[#00ffa3]/50'
                }`}
              >
                {saveStatus === 'saving' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : saveStatus === 'saved' ? (
                  <Check className="w-3.5 h-3.5 text-[#00ffa3]" />
                ) : (
                  <Database className="w-3.5 h-3.5 text-[#00ffa3]" />
                )}
                <span>
                  {saveStatus === 'saving'
                    ? 'PERSISTING TO CLOUD SQL...'
                    : saveStatus === 'saved'
                    ? '✓ PERSISTED IN CLOUD SQL'
                    : saveStatus === 'error'
                    ? 'ERROR PERSISTING'
                    : isAuthenticated
                    ? 'PERSIST TO CLOUD SQL'
                    : 'SIGN IN TO PERSIST TO SQL'}
                </span>
              </button>
            )}

            <button
              onClick={() => setIsReportOpen(true)}
              className="w-full py-2.5 px-3 bg-[#00ffa3] hover:bg-[#00e08f] text-black font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-black" />
              <span>Generate DICOM Report</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Clinical DICOM Report Modal */}
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
            scanName: currentScan.name,
          }}
        />
      )}
    </div>
  );
};
