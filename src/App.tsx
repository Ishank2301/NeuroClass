import React, { useState } from 'react';
import { Navbar, NavTabType } from './components/Navbar';
import { ScanClassifier } from './components/ScanClassifier';
import { ModelEvaluation } from './components/ModelEvaluation';
import { BatchAnalyzer } from './components/BatchAnalyzer';
import { AugmentationLab } from './components/AugmentationLab';
import { DynamicBackground } from './components/DynamicBackground';
import { NeuroConsultChat } from './components/NeuroConsultChat';
import { VeoCineLoopStudio } from './components/VeoCineLoopStudio';
import { MedicalImageStudio } from './components/MedicalImageStudio';
import { Brain, ShieldCheck, HeartPulse, Database } from 'lucide-react';
import { SAMPLE_SCANS } from './data/sampleScans';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabType>('classifier');
  const [selectedModel, setSelectedModel] = useState<string>('ResNet-50');
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

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

      {/* Variation 8 Monospace Precision Telemetry Footer */}
      <footer className="h-10 px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center bg-[#000] font-mono text-[10px] text-[#f0f0f2]/40 tracking-wider border-t border-[rgba(240,240,242,0.08)] relative z-10 shrink-0">
        <div>NEUROCLASS V2.4 // ENGINE_TYPE: CONVOLUTIONAL_NEURAL_NET // BACKBONE: {selectedModel.toUpperCase()}</div>
        <div className="hidden sm:block">SESSIONS ACTIVE: 01 // GPU_TEMP: 42°C // DICOM_CALIBRATED: 0.80MM</div>
      </footer>
    </div>
  );
};

export default App;
