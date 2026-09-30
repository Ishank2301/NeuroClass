import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ScanClassifier } from './components/ScanClassifier';
import { ModelEvaluation } from './components/ModelEvaluation';
import { BatchAnalyzer } from './components/BatchAnalyzer';
import { AugmentationLab } from './components/AugmentationLab';
import { COMPARATIVE_MODELS } from './data/benchmarkData';
import { Brain, Activity, ShieldCheck, HeartPulse, FileText, Database } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'classifier' | 'benchmarks' | 'batch' | 'augmentation'>('classifier');
  const [selectedModel, setSelectedModel] = useState<string>('ResNet-50');
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        availableModels={availableModels}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'classifier' && (
          <ScanClassifier selectedModel={selectedModel} selectedScanId={selectedScanId} />
        )}

        {activeTab === 'benchmarks' && (
          <ModelEvaluation />
        )}

        {activeTab === 'batch' && (
          <BatchAnalyzer onSelectScanForDiagnosis={handleSelectScanForDiagnosis} />
        )}

        {activeTab === 'augmentation' && (
          <AugmentationLab />
        )}
      </main>

      {/* Hospital PACS Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-cyan-500" />
            <span className="font-semibold text-slate-400">
              NeuroClass AI Diagnostic Suite
            </span>
            <span className="text-slate-600">•</span>
            <span>Multi-Class Brain Tumor MRI Classification & Grad-CAM Heatmap Localization</span>
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
