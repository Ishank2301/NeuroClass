import React from 'react';
import { Activity, Brain, Layers, BarChart3, ListFilter, Cpu, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'classifier' | 'benchmarks' | 'batch' | 'augmentation';
  setActiveTab: (tab: 'classifier' | 'benchmarks' | 'batch' | 'augmentation') => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: string[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedModel,
  setSelectedModel,
  availableModels
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
              <Brain className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  NeuroClass
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  v2.4 AI Clinical
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Brain Tumor MRI Classification & Grad-CAM Triage
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('classifier')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'classifier'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>MRI Diagnosis</span>
            </button>

            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'benchmarks'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Model</span> Benchmarks
            </button>

            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'batch'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ListFilter className="h-4 w-4" />
              <span>Batch Triage</span>
            </button>

            <button
              onClick={() => setActiveTab('augmentation')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'augmentation'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span className="hidden md:inline">Augmentation</span> Lab
            </button>
          </nav>

          {/* Model Selector */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 bg-slate-800/70 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-slate-400">Backbone:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                aria-label="Select Deep Learning Model Backbone"
                className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
              >
                {availableModels.map((m) => (
                  <option key={m} value={m} className="bg-slate-900 text-slate-200">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
