import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Layers,
  BarChart3,
  ListFilter,
  Cpu,
  MessageSquare,
  Film,
  Palette,
  User as UserIcon,
  LogOut,
  Database,
  Shield,
  Cookie,
  ChevronDown,
  Sparkles,
  Sliders,
  Home,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTabType =
  | 'home'
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
  availableModels,
}) => {
  const {
    user,
    isAuthenticated,
    setAuthModalOpen,
    setPolicyModalOpen,
    setHistoryDrawerOpen,
    scanHistory,
    logout,
  } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [labsMenuOpen, setLabsMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const labsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (labsRef.current && !labsRef.current.contains(event.target as Node)) {
        setLabsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLabTabActive = ['video', 'image-studio', 'benchmarks', 'augmentation'].includes(activeTab);

  const labTabNames: Record<string, string> = {
    video: 'Veo 3D Cine',
    'image-studio': 'Image Studio',
    benchmarks: 'Benchmarks',
    augmentation: 'Augmentation',
  };

  return (
    <header className="h-14 px-3 sm:px-6 border-b border-white/[0.08] bg-[#09090b]/95 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between transition-all shrink-0">
      {/* Brand Identity -> routes to Home/Portal */}
      <div
        onClick={() => setActiveTab('home')}
        className="flex items-center gap-3 cursor-pointer select-none group"
        title="Return to NeuroClass Clinical Portal"
      >
        <div className="w-7 h-7 border border-[#00ffa3] bg-[#00ffa3]/5 flex items-center justify-center font-syne font-black text-sm text-[#00ffa3] relative transition-transform group-hover:scale-105">
          <span>N</span>
          <div className="absolute inset-0 border border-[#00ffa3]/20 -m-1 pointer-events-none" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-syne text-sm sm:text-base font-extrabold tracking-tight text-zinc-100">
              NEUROCLASS
            </span>
            <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-widest text-[#00ffa3] bg-[#00ffa3]/10 px-1.5 py-0.2 border border-[#00ffa3]/30">
              CADx PACS
            </span>
          </div>
        </div>
      </div>

      {/* Central Navigation: Overview, Clinical Suite + Research Labs Dropdown */}
      <nav className="flex items-center gap-1 sm:gap-1.5">
        {/* Portal Home / Overview */}
        <button
          onClick={() => setActiveTab('home')}
          className={`px-2.5 sm:px-3 py-1.5 text-xs font-mono tracking-wider transition-all border flex items-center gap-1.5 ${
            activeTab === 'home'
              ? 'bg-[#00ffa3]/10 text-[#00ffa3] border-[#00ffa3]/40 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-white/[0.04]'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Overview</span>
        </button>

        {/* Primary Operational Workstation */}
        <button
          onClick={() => setActiveTab('classifier')}
          className={`px-2.5 sm:px-3 py-1.5 text-xs font-mono tracking-wider transition-all border ${
            activeTab === 'classifier'
              ? 'bg-[#00ffa3]/10 text-[#00ffa3] border-[#00ffa3]/40 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-white/[0.04]'
          }`}
        >
          CADx Triage
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-2.5 sm:px-3 py-1.5 text-xs font-mono tracking-wider transition-all border ${
            activeTab === 'chat'
              ? 'bg-[#00ffa3]/10 text-[#00ffa3] border-[#00ffa3]/40 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-white/[0.04]'
          }`}
        >
          Consult
        </button>

        <button
          onClick={() => setActiveTab('batch')}
          className={`px-2.5 sm:px-3 py-1.5 text-xs font-mono tracking-wider transition-all border ${
            activeTab === 'batch'
              ? 'bg-[#00ffa3]/10 text-[#00ffa3] border-[#00ffa3]/40 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-white/[0.04]'
          }`}
        >
          Batch Queue
        </button>

        {/* Secondary Labs & AI Tools Dropdown Menu */}
        <div className="relative" ref={labsRef}>
          <button
            onClick={() => setLabsMenuOpen(!labsMenuOpen)}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-mono tracking-wider transition-all flex items-center gap-1.5 border ${
              isLabTabActive
                ? 'bg-[#9d00ff]/15 text-[#c084fc] border-[#9d00ff]/40 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#00ffa3]" />
            <span>{isLabTabActive ? labTabNames[activeTab] : 'AI Labs'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${labsMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {labsMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-52 bg-[#0d0d10] border border-white/[0.12] shadow-2xl z-50 py-1 font-mono text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-zinc-500 border-b border-white/[0.06]">
                Advanced Deep Learning Tools
              </div>

              <button
                onClick={() => {
                  setActiveTab('video');
                  setLabsMenuOpen(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/[0.05] transition-colors ${
                  activeTab === 'video' ? 'text-[#00ffa3] bg-[#00ffa3]/10' : 'text-zinc-300'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-[#00ffa3]" />
                <div>
                  <div className="font-semibold">Veo 3D Cine-Loop</div>
                  <div className="text-[10px] text-zinc-500">Volumetric temporal loop</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('image-studio');
                  setLabsMenuOpen(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/[0.05] transition-colors ${
                  activeTab === 'image-studio' ? 'text-[#00ffa3] bg-[#00ffa3]/10' : 'text-zinc-300'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-[#00ffa3]" />
                <div>
                  <div className="font-semibold">Medical Image Studio</div>
                  <div className="text-[10px] text-zinc-500">Imagen enhancement</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('benchmarks');
                  setLabsMenuOpen(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/[0.05] transition-colors ${
                  activeTab === 'benchmarks' ? 'text-[#00ffa3] bg-[#00ffa3]/10' : 'text-zinc-300'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#00ffa3]" />
                <div>
                  <div className="font-semibold">Model Benchmarks</div>
                  <div className="text-[10px] text-zinc-500">Confusion matrices & ROC</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('augmentation');
                  setLabsMenuOpen(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/[0.05] transition-colors ${
                  activeTab === 'augmentation' ? 'text-[#00ffa3] bg-[#00ffa3]/10' : 'text-zinc-300'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-[#00ffa3]" />
                <div>
                  <div className="font-semibold">Augmentation Lab</div>
                  <div className="text-[10px] text-zinc-500">Geometric stress testing</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Right Actions: Model Backbone, Database Archive & Auth */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Model Backbone Indicator */}
        <div className="hidden lg:flex items-center gap-2 bg-[#121215] border border-white/[0.08] px-2.5 py-1 text-xs">
          <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">MODEL:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            aria-label="Select Deep Learning Model Backbone"
            className="bg-transparent text-[#00ffa3] font-mono text-[11px] focus:outline-none cursor-pointer uppercase font-semibold"
          >
            {availableModels.map((m) => (
              <option key={m} value={m} className="bg-[#121215] text-zinc-200">
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Cloud SQL Patient Archive Button */}
        {isAuthenticated && (
          <button
            onClick={() => setHistoryDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#121215] hover:bg-[#181820] border border-white/[0.12] hover:border-[#00ffa3]/50 text-[#00ffa3] font-mono text-xs tracking-wider transition-all"
            title="Open Persistent MRI Scans from Cloud SQL"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">SQL ARCHIVE</span>
            <span className="px-1.5 py-0.2 bg-[#00ffa3]/20 text-[#00ffa3] text-[10px] font-bold border border-[#00ffa3]/40">
              {scanHistory.length}
            </span>
          </button>
        )}

        {/* User Authentication Trigger / Profile Dropdown */}
        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 py-1 px-2 sm:px-2.5 bg-[#141418] hover:bg-[#1a1a22] border border-[#00ffa3]/30 text-xs font-mono transition-all text-zinc-200"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName || 'Clinician'}
                  className="w-5 h-5 rounded-full object-cover border border-[#00ffa3]/50"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#00ffa3]/20 text-[#00ffa3] flex items-center justify-center font-bold text-[10px]">
                  {(user.displayName || user.username || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline font-bold text-[#00ffa3] max-w-[90px] truncate">
                {user.displayName || user.username}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-[#121215] border border-white/[0.12] shadow-2xl z-50 py-1 font-mono text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-white/[0.08]">
                  <div className="font-semibold text-zinc-100 truncate">
                    {user.displayName || user.username}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    {user.email || user.phoneNumber || 'Authenticated Clinician'}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[9px] text-[#00ffa3] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-[#00ffa3] rounded-full animate-pulse" />
                    <span>Role: {user.role || 'Clinician'}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setHistoryDrawerOpen(true);
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.05] flex items-center gap-2 transition-colors"
                >
                  <Database className="w-3.5 h-3.5 text-[#00ffa3]" />
                  <span>My Cloud SQL Scans</span>
                  <span className="ml-auto text-[10px] bg-white/[0.08] px-1.5 py-0.5 rounded text-zinc-400">
                    {scanHistory.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setPolicyModalOpen(true);
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.05] flex items-center gap-2 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>HIPAA & Security Compliance</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors border-t border-white/[0.08] mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#00ffa3]/10 hover:bg-[#00ffa3]/20 border border-[#00ffa3]/40 text-[#00ffa3] font-mono text-xs tracking-wider transition-all font-semibold"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>CLINICIAN LOGIN</span>
          </button>
        )}
      </div>
    </header>
  );
};
