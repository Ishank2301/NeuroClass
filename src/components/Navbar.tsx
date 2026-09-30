import React from 'react';
import {
  Activity,
  Layers,
  BarChart3,
  ListFilter,
  Cpu,
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
    <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-[rgba(240,240,242,0.08)] bg-[#080809]/90 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between transition-all">
      {/* Zone 1: Brand Wordmark (Variation 8) */}
      <div
        onClick={() => setActiveTab('classifier')}
        className="logo-wrap cursor-pointer select-none group"
      >
        <div className="logo-mark">
          <span>N</span>
        </div>
        <div>
          <span className="font-syne text-base sm:text-lg font-extrabold tracking-tight text-[#f0f0f2]">
            NEUROCLASS
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#00ffa3] block">
            PRECISION AI
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Variation 8) */}
      <nav className="nav-links overflow-x-auto py-1 no-scrollbar max-w-[60%] lg:max-w-none">
        <button
          onClick={() => setActiveTab('classifier')}
          className={activeTab === 'classifier' ? 'active' : ''}
        >
          Diagnosis
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={activeTab === 'chat' ? 'active' : ''}
        >
          Consult
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className={activeTab === 'video' ? 'active' : ''}
        >
          Veo Cine
        </button>

        <button
          onClick={() => setActiveTab('image-studio')}
          className={activeTab === 'image-studio' ? 'active' : ''}
        >
          Enhance
        </button>

        <button
          onClick={() => setActiveTab('benchmarks')}
          className={activeTab === 'benchmarks' ? 'active' : ''}
        >
          Benchmarks
        </button>

        <button
          onClick={() => setActiveTab('batch')}
          className={activeTab === 'batch' ? 'active' : ''}
        >
          Triage
        </button>

        <button
          onClick={() => setActiveTab('augmentation')}
          className={activeTab === 'augmentation' ? 'active' : ''}
        >
          Augment
        </button>
      </nav>

      {/* Zone 3: Model Selector & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-2 bg-[#111114] border border-[rgba(240,240,242,0.08)] px-3 py-1.5 text-xs">
          <span className="font-mono text-[10px] text-[#f0f0f2]/40 uppercase tracking-widest">Backbone:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            aria-label="Select Deep Learning Model Backbone"
            className="bg-transparent text-[#00ffa3] font-mono text-[11px] focus:outline-none cursor-pointer uppercase"
          >
            {availableModels.map((m) => (
              <option key={m} value={m} className="bg-[#111114] text-[#f0f0f2]">
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="font-mono text-[10px] text-[#00ffa3] flex items-center gap-2 bg-[#111114] px-3 py-1.5 border border-[rgba(240,240,242,0.08)]">
          <span className="w-1.5 h-1.5 bg-[#00ffa3] rounded-full shadow-[0_0_8px_#00ffa3] animate-pulse"></span>
          <span className="tracking-widest font-semibold hidden sm:inline">ONLINE</span>
        </div>
      </div>
    </header>
  );
};
