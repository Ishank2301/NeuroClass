import React from 'react';
import {
  Activity,
  Brain,
  Layers,
  BarChart3,
  ListFilter,
  Cpu,
  Sparkles,
  MessageSquare,
  Film,
  Palette
} from 'lucide-react';

export type NavTabType =
  | 'classifier'
  | 'chat'
  | 'video'
  | 'image-studio'
  | 'benchmarks'
  | 'batch'
  | 'augmentation';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
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
    <header className="border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Branding */}
          <div
            onClick={() => setActiveTab('classifier')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40 group-hover:scale-105 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <Brain className="h-6 w-6 text-white group-hover:animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  NeuroClass
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-400 border border-cyan-800">
                  AI CADx
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Clinical Brain Tumor PACS & GenAI Suite
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Scrollable on small displays) */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1.5 no-scrollbar">
            {/* MRI Diagnosis */}
            <button
              onClick={() => setActiveTab('classifier')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === 'classifier'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>MRI PACS</span>
            </button>

            {/* Gemini Multi-Turn Chatbot */}
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === 'chat'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
              <span>NeuroConsult AI</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-900/60 text-blue-300 font-mono hidden md:inline">
                Gemini
              </span>
            </button>

            {/* Veo Video Generator */}
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === 'video'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Film className="h-3.5 w-3.5 text-indigo-400" />
              <span>Veo 3D Cine</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-900/60 text-indigo-300 font-mono hidden md:inline">
                Veo
              </span>
            </button>

            {/* Image Creation & Edit */}
            <button
              onClick={() => setActiveTab('image-studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === 'image-studio'
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm shadow-purple-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Palette className="h-3.5 w-3.5 text-purple-400" />
              <span>Image Studio</span>
            </button>

            {/* Benchmarks */}
            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === 'benchmarks'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Model</span> Benchmarks
            </button>

            {/* Batch Triage */}
            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === 'batch'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span>Batch Triage</span>
            </button>

            {/* Augmentation Lab */}
            <button
              onClick={() => setActiveTab('augmentation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === 'augmentation'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Augmentation</span> Lab
            </button>
          </nav>

          {/* Model Selector & Status Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                aria-label="Select Deep Learning Model Backbone"
                className="bg-transparent text-cyan-300 font-mono font-semibold focus:outline-none cursor-pointer text-xs"
              >
                {availableModels.map((m) => (
                  <option key={m} value={m} className="bg-slate-900 text-slate-200">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

