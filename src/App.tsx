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

  const { setPolicyModalOpen, setPolicyTab, setHistoryDrawerOpen, isAuthenticated } = useAuth();

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
    'Inception-V3'
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Dynamic Animated Neural Particle & Laser Sweep Background */}
      <DynamicBackground showScanlines={true} />

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        availableModels={availableModels}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {/* MRI Diagnosis Tab */}
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

      {/* Variation 8 Monospace Precision Telemetry Footer with Policy Links */}
      <footer className="h-auto py-2 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center bg-[#000] font-mono text-[10px] text-[#f0f0f2]/40 tracking-wider border-t border-[rgba(240,240,242,0.08)] relative z-10 shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <span>NEUROCLASS V2.4 // ENGINE: CNN // BACKBONE: {selectedModel.toUpperCase()}</span>
          <span className="hidden md:inline">// CLOUD_SQL: POSTGRESQL</span>
        </div>

        {/* Policy & Governance Links */}
        <div className="flex items-center flex-wrap gap-4 text-[#f0f0f2]/60">
          {isAuthenticated && (
            <button
              onClick={() => setHistoryDrawerOpen(true)}
              className="hover:text-[#00ffa3] transition-colors flex items-center gap-1"
            >
              <Database className="w-3 h-3 text-[#00ffa3]" />
              <span>SQL History</span>
            </button>
          )}

          <button
            onClick={() => {
              setPolicyTab('cookies');
              setPolicyModalOpen(true);
            }}
            className="hover:text-[#00ffa3] transition-colors flex items-center gap-1"
          >
            <Cookie className="w-3 h-3" />
            <span>Cookies</span>
          </button>

          <button
            onClick={() => {
              setPolicyTab('security');
              setPolicyModalOpen(true);
            }}
            className="hover:text-[#00ffa3] transition-colors flex items-center gap-1"
          >
            <Lock className="w-3 h-3 text-[#00ffa3]" />
            <span>Security Architecture</span>
          </button>

          <button
            onClick={() => {
              setPolicyTab('privacy');
              setPolicyModalOpen(true);
            }}
            className="hover:text-[#00ffa3] transition-colors flex items-center gap-1"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>HIPAA & Privacy</span>
          </button>

          <button
            onClick={() => {
              setPolicyTab('terms');
              setPolicyModalOpen(true);
            }}
            className="hover:text-[#00ffa3] transition-colors"
          >
            Terms
          </button>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
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
