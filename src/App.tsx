import React, { useState } from 'react';
import { AuthProvider, useAuth, PersistentScan } from './context/AuthContext';
import { Navbar, NavTabType } from './components/Navbar';
import { ScanClassifier } from './components/ScanClassifier';
import { ModelEvaluation } from './components/ModelEvaluation';
import { BatchAnalyzer } from './components/BatchAnalyzer';
import { AugmentationLab } from './components/AugmentationLab';
import { DynamicBackground } from './components/DynamicBackground';
import { NeuroConsultChat } from './components/NeuroConsultChat';
import { VeoCineLoopStudio } from './components/VeoCineLoopStudio';
import { MedicalImageStudio } from './components/MedicalImageStudio';
import { AuthModal } from './components/AuthModal';
import { PolicyModal } from './components/PolicyModal';
import { CookieBanner } from './components/CookieBanner';
import { ScanHistoryDrawer } from './components/ScanHistoryDrawer';
import { ShieldCheck, Lock, Cookie, Database } from 'lucide-react';
import { SAMPLE_SCANS } from './data/sampleScans';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabType>('classifier');
  const [selectedModel, setSelectedModel] = useState<string>('ResNet-50');
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  const { setPolicyModalOpen, setPolicyTab, setHistoryDrawerOpen, isAuthenticated, scanHistory } = useAuth();

  // Cross-tab context sharing
  const [activeScanImage, setActiveScanImage] = useState<string>(SAMPLE_SCANS[0]?.imageUrl || '');
  const [activeScanContext, setActiveScanContext] = useState<{
    id: string;
    prediction: string;
    confidence: number;
    sequence: string;
    description: string;
  } | null>({
    id: SAMPLE_SCANS[0]?.id || 'SAMPLE-01',
    prediction: 'Glioma',
    confidence: 98.4,
    sequence: 'Axial T1-CE + T2-FLAIR',
    description: 'High-grade infiltrative glioblastoma showing peripheral thick irregular ring enhancement and central necrosis.',
  });

  const availableModels = [
    'ResNet-50',
    'Custom CNN',
    'MobileNet-V2',
    'EfficientNet-B0',
    'Inception-V3',
  ];

  const handleSelectScanForDiagnosis = (scanId: string) => {
    setSelectedScanId(scanId);
    setActiveTab('classifier');
  };

  const handleNavigateToTab = (tab: NavTabType, scanImageUrl?: string, contextData?: any) => {
    if (scanImageUrl) {
      setActiveScanImage(scanImageUrl);
    }
    if (contextData) {
      setActiveScanContext(contextData);
    }
    setActiveTab(tab);
  };

  const handleLoadScanFromHistory = (scan: PersistentScan) => {
    if (scan.scanUrl) {
      setActiveScanImage(scan.scanUrl);
    }
    setActiveScanContext({
      id: scan.patientRef,
      prediction: scan.predictedClass,
      confidence: parseFloat(scan.confidence) || 98.4,
      sequence: scan.slicePlane || 'Axial T1-CE',
      description: scan.clinicalNotes || `Persisted scan for patient ${scan.patientRef}.`,
    });
    setActiveTab('classifier');
  };

  const isClassifierMode = activeTab === 'classifier';

  return (
    <div className="h-screen w-screen bg-[#08080a] text-zinc-100 flex flex-col selection:bg-[#00ffa3]/30 selection:text-[#00ffa3] relative overflow-hidden">
      {/* Calm Institutional Ambient Background */}
      <DynamicBackground showScanlines={false} />

      {/* Navigation Header (Fixed 56px) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        availableModels={availableModels}
      />

      {/* Main Content Area: Zero-scroll 100vh for PACS, scrollable for labs */}
      <main
        className={`flex-1 relative z-10 overflow-hidden ${
          isClassifierMode
            ? 'w-full h-[calc(100vh-3.5rem-2rem)] p-2 sm:p-3 flex flex-col'
            : 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto'
        }`}
      >
        {/* MRI Diagnosis Workstation (Fixed PACS Canvas) */}
        {activeTab === 'classifier' && (
          <ScanClassifier
            selectedModel={selectedModel}
            selectedScanId={selectedScanId}
            onNavigateToTab={handleNavigateToTab}
          />
        )}

        {/* Gemini Multi-Turn Consultation Chatbot */}
        {activeTab === 'chat' && (
          <NeuroConsultChat activeScanContext={activeScanContext} />
        )}

        {/* Veo 3D Cine-Loop Video Studio */}
        {activeTab === 'video' && (
          <VeoCineLoopStudio initialScanImage={activeScanImage} />
        )}

        {/* Medical Image Enhancement & Creation Studio */}
        {activeTab === 'image-studio' && (
          <MedicalImageStudio initialScanImage={activeScanImage} />
        )}

        {/* Model Evaluation & Benchmarks */}
        {activeTab === 'benchmarks' && (
          <ModelEvaluation />
        )}

        {/* Batch Triage */}
        {activeTab === 'batch' && (
          <BatchAnalyzer onSelectScanForDiagnosis={handleSelectScanForDiagnosis} />
        )}

        {/* Augmentation Lab */}
        {activeTab === 'augmentation' && (
          <AugmentationLab />
        )}
      </main>

      {/* Compact Monospace Telemetry Footer (32px Fixed) */}
      <footer className="h-8 px-3 sm:px-6 flex items-center justify-between bg-[#050507] font-mono text-[10px] text-zinc-500 tracking-wider border-t border-white/[0.08] relative z-20 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[#00ffa3] font-semibold">NEUROCLASS PACS V2.5</span>
          <span className="hidden md:inline text-zinc-600">//</span>
          <span className="hidden md:inline">BACKBONE: {selectedModel.toUpperCase()}</span>
          <span className="hidden lg:inline text-zinc-600">//</span>
          <span className="hidden lg:inline">ENGINE: TENSOR / GRAD-CAM++</span>
        </div>

        {/* Governance & SQL Triggers */}
        <div className="flex items-center gap-4 text-zinc-400">
          {isAuthenticated && (
            <button
              onClick={() => setHistoryDrawerOpen(true)}
              className="hover:text-[#00ffa3] transition-colors flex items-center gap-1"
            >
              <Database className="w-3 h-3 text-[#00ffa3]" />
              <span className="hidden sm:inline">SQL Archive:</span>
              <span className="text-[#00ffa3] font-bold">{scanHistory.length}</span>
            </button>
          )}

          <button
            onClick={() => {
              setPolicyTab('cookies');
              setPolicyModalOpen(true);
            }}
            className="hover:text-[#00ffa3] transition-colors flex items-center gap-1"
          >
            <Cookie className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Cookies</span>
          </button>

          <button
            onClick={() => {
              setPolicyTab('privacy');
              setPolicyModalOpen(true);
            }}
            className="hover:text-[#00ffa3] transition-colors flex items-center gap-1"
          >
            <Lock className="w-3 h-3 text-blue-400" />
            <span className="hidden sm:inline">HIPAA Privacy</span>
          </button>

          <button
            onClick={() => {
              setPolicyTab('security');
              setPolicyModalOpen(true);
            }}
            className="hover:text-[#00ffa3] transition-colors flex items-center gap-1"
          >
            <ShieldCheck className="w-3 h-3 text-[#00ffa3]" />
            <span className="hidden sm:inline">Security</span>
          </button>
        </div>
      </footer>

      {/* Modals and Persistent Drawers */}
      <AuthModal />
      <PolicyModal />
      <CookieBanner />
      <ScanHistoryDrawer onLoadScanIntoViewer={handleLoadScanFromHistory} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
