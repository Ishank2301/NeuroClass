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

      {/* Hospital PACS Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md py-6 text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-cyan-500" />
            <span className="font-semibold text-slate-400">
              NeuroClass AI Diagnostic Suite
            </span>
            <span className="text-slate-600">•</span>
            <span>Multi-Class Brain Tumor MRI Classification, Veo 3D Cine-Loop & Gemini GenAI Studio</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-slate-400">
              <Database className="h-3 w-3 text-cyan-500" />
              5,546 Multi-Class MRI Slices
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <HeartPulse className="h-3 w-3 text-emerald-500" />
              DICOM Compliant (0.8mm Calibration)
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="h-3 w-3 text-cyan-400" />
              CADx Assisted Protocol
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
