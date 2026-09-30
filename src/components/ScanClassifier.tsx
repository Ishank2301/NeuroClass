import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  RefreshCw,
  MessageSquare,
  Film,
  Palette,
  Crosshair
} from 'lucide-react';
import { SampleMri, ModelPrediction, TumorClass } from '../types';
import { SAMPLE_SCANS } from '../data/sampleScans';
import { predictMriScan, TUMOR_CLASSES_METADATA } from '../utils/mriEngine';
import { MriViewer } from './MriViewer';
import { ClinicalReportModal } from './ClinicalReportModal';
import { NavTabType } from './Navbar';

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
      const found = SAMPLE_SCANS.find((s) => s.id === selectedScanId);
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
  };

  const currentThemeColor = prediction ? CLASS_COLORS[prediction.predictedClass] : '#00ffa3';

  return (
    <div className="w-full">
      {/* Variation 8 App Shell (3-Column Layout: 300px | 1fr | 340px) */}
      <div className="app-shell border border-[rgba(240,240,242,0.08)] bg-[#080809] shadow-2xl overflow-hidden min-h-[720px]">
        {/* =========================================================================
            LEFT COLUMN: Sidebar Left (Library & Ingest)
            ========================================================================= */}
        <section className="sidebar-left flex flex-col justify-between">
          <div>
            <div className="label">MRI Directory</div>

            <div className="space-y-1">
              {SAMPLE_SCANS.map((scan) => {
                const isActive = !customImageUrl && currentScan.id === scan.id;
                const scanColor = CLASS_COLORS[scan.groundTruth];

                return (
                  <div
                    key={scan.id}
                    onClick={() => selectSampleCase(scan)}
                    className={`mri-card ${isActive ? 'active' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4>{scan.patientId}</h4>
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: scanColor }}
                        title={`Ground Truth: ${scan.groundTruth}`}
                      />
                    </div>
                    <div className="meta">
                      <span style={{ color: scanColor }} className="font-semibold">{scan.groundTruth}</span>
                      <span> · </span>
                      <span>{scan.sequence.slice(0, 6)}</span>
                      <span> · </span>
                      <span>{scan.slicePlane}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ingest Portal */}
          <div className="mt-6 pt-5 border-t border-[rgba(240,240,242,0.08)]">
            <div className="label">Ingest Portal</div>
            <div className="border border-dashed border-[rgba(240,240,242,0.15)] hover:border-[#00ffa3]/60 bg-[#111114] p-4 text-center transition-all group cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <UploadCloud className="h-5 w-5 text-[#00ffa3]/70 group-hover:text-[#00ffa3] mx-auto mb-2 transition-colors" />
              <div className="font-mono text-[10px] text-[#f0f0f2] font-semibold mb-0.5">
                LOAD LOCAL SCAN
              </div>
              <div className="font-mono text-[9px] text-[#f0f0f2]/40 uppercase tracking-widest">
                DICOM / PNG / JPEG
              </div>
            </div>

            {customImageUrl && (
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#00ffa3] bg-[#00ffa3]/5 border border-[#00ffa3]/20 px-3 py-1.5">
                <span className="truncate">Loaded: {patientId}</span>
                <button
                  onClick={() => selectSampleCase(SAMPLE_SCANS[0])}
                  className="text-[10px] underline text-slate-400 hover:text-white ml-2"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            CENTER COLUMN: Viewer Container (Variation 8 PACS Display)
            ========================================================================= */}
        <section className="viewer-container">
          {/* Top Viewer Metadata Bar */}
          <div className="viewer-meta">
            <div>
              <span className="opacity-40">SUBJECT ID: </span>
              <span className="text-[#f0f0f2] font-semibold">{patientId}</span>
            </div>
            <div>
              <span className="opacity-40">SEQUENCE: </span>
              <span className="text-[#f0f0f2] font-semibold">{sequence}</span>
            </div>
            <div>
              <span className="opacity-40">MODEL: </span>
              <span className="text-[#00ffa3] font-semibold">{selectedModel}</span>
            </div>
          </div>

          {/* Interactive MRI PACS Viewer Canvas Area */}
          <div className="flex-1 flex flex-col justify-between">
            <MriViewer
              imageUrl={activeImageUrl}
              prediction={prediction}
              patientId={patientId}
              sequence={sequence}
              slicePlane={slicePlane}
            />

            {/* Quick Precision Extension Modules Dock */}
            <div className="px-5 py-3 border-t border-[rgba(240,240,242,0.08)] bg-[#080809] flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#f0f0f2]/40 flex items-center gap-1.5">
                <Crosshair className="h-3 w-3 text-[#00ffa3]" />
                Precision Extension Modules:
              </span>

              <div className="flex items-center gap-2">
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
                  className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 bg-[#111114] hover:bg-[#1a1a20] text-[#f0f0f2] border border-[rgba(240,240,242,0.12)] hover:border-[#00ffa3]/60 transition-all flex items-center gap-1.5"
                >
                  <MessageSquare className="h-3 w-3 text-[#00ffa3]" />
                  <span>Consult Gemini</span>
                </button>

                <button
                  onClick={() => onNavigateToTab?.('video', activeImageUrl)}
                  className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 bg-[#111114] hover:bg-[#1a1a20] text-[#f0f0f2] border border-[rgba(240,240,242,0.12)] hover:border-[#00ffa3]/60 transition-all flex items-center gap-1.5"
                >
                  <Film className="h-3 w-3 text-[#00ffa3]" />
                  <span>Veo 3D Cine</span>
                </button>

                <button
                  onClick={() => onNavigateToTab?.('image-studio', activeImageUrl)}
                  className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 bg-[#111114] hover:bg-[#1a1a20] text-[#f0f0f2] border border-[rgba(240,240,242,0.12)] hover:border-[#00ffa3]/60 transition-all flex items-center gap-1.5"
                >
                  <Palette className="h-3 w-3 text-[#00ffa3]" />
                  <span>Enhance Scan</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            RIGHT COLUMN: Sidebar Right (Stats & Impressions - Variation 8)
            ========================================================================= */}
        <section className="sidebar-right flex flex-col justify-between">
          <div>
            {/* Header Diagnosis */}
            <div className="diag-header">
              <div className="label">Diagnostic Inference</div>
              {isInferring ? (
                <div className="py-6 flex items-center gap-3">
                  <RefreshCw className="h-6 w-6 text-[#00ffa3] animate-spin" />
                  <span className="font-mono text-sm text-[#00ffa3]">ANALYZING VOXELS...</span>
                </div>
              ) : prediction ? (
                <div>
                  <h2 style={{ color: currentThemeColor }}>
                    {prediction.predictedClass === 'no_tumor' ? 'NO TUMOR' : prediction.label}
                  </h2>
                  <div className="conf-pill">
                    {prediction.confidence}% CONFIDENCE
                  </div>
                </div>
              ) : null}
            </div>

            {/* Stat Grid */}
            {prediction && (
              <div className="stat-grid">
                <div className="stat-cell">
                  <div className="label text-[9px] mb-1">Est. Diameter</div>
                  <span style={{ color: currentThemeColor }}>
                    {prediction.gradCamRoi.estimatedDiameterMm}
                    <span className="text-xs text-[#f0f0f2]/40 font-mono ml-1">mm</span>
                  </span>
                </div>
                <div className="stat-cell">
                  <div className="label text-[9px] mb-1">Est. Area</div>
                  <span style={{ color: currentThemeColor }}>
                    {prediction.gradCamRoi.estimatedAreaMm2}
                    <span className="text-xs text-[#f0f0f2]/40 font-mono ml-1">mm²</span>
                  </span>
                </div>
              </div>
            )}

            {/* Probability Matrix */}
            {prediction && (
              <div className="mt-6 mb-6">
                <div className="label">Differential Analysis</div>
                <div className="space-y-3">
                  {prediction.probabilities.map((prob) => {
                    const barColor = CLASS_COLORS[prob.className];
                    return (
                      <div key={prob.className} className="matrix-row mb-3">
                        <div className="matrix-info">
                          <span className="uppercase text-[#f0f0f2]/80">{prob.label}</span>
                          <span className="font-bold text-[#f0f0f2]">{prob.probability}%</span>
                        </div>
                        <div className="bar-bg">
                          <div
                            className="bar-fill transition-all duration-500"
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

            {/* Impression Box */}
            {prediction && (
              <div className="impression-box">
                <div className="label text-[9px] mb-2 text-[#f0f0f2]/50">
                  Clinical Impression
                </div>
                <p className="leading-relaxed">
                  {TUMOR_CLASSES_METADATA[prediction.predictedClass].description}
                </p>
              </div>
            )}
          </div>

          {/* Primary Action Button (Variation 8 Clipped Corner) */}
          <div className="mt-6">
            <button
              onClick={() => setIsReportOpen(true)}
              className="btn-primary"
            >
              Report Diagnostics
            </button>
          </div>
        </section>
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
            scanName: currentScan.name
          }}
        />
      )}
    </div>
  );
};
