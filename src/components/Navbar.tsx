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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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

      {/* Zone 3: Model Selector, Scans & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden xl:flex items-center gap-2 bg-[#111114] border border-[rgba(240,240,242,0.08)] px-3 py-1.5 text-xs">
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

        {/* Persistent Cloud SQL Scans Button */}
        {isAuthenticated && (
          <button
            onClick={() => setHistoryDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#121216] hover:bg-[#1a1a22] border border-[rgba(240,240,242,0.12)] text-[#00ffa3] font-mono text-xs tracking-wider transition-all"
            title="Open Persistent MRI Scans from Cloud SQL"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">SQL ARCHIVE</span>
            <span className="px-1.5 py-0.2 bg-[#00ffa3]/20 text-[#00ffa3] text-[10px] font-bold border border-[#00ffa3]/40">
              {scanHistory.length}
            </span>
          </button>
        )}

        {/* Online Status */}
        <div className="hidden sm:flex font-mono text-[10px] text-[#00ffa3] items-center gap-2 bg-[#111114] px-2.5 py-1.5 border border-[rgba(240,240,242,0.08)]">
          <span className="w-1.5 h-1.5 bg-[#00ffa3] rounded-full shadow-[0_0_8px_#00ffa3] animate-pulse"></span>
          <span className="tracking-widest font-semibold">SQL ON</span>
        </div>

        {/* User Authentication Trigger / Profile Dropdown */}
        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 py-1 px-2 sm:px-2.5 bg-[#141418] hover:bg-[#1a1a22] border border-[#00ffa3]/30 text-xs font-mono transition-all text-[#f0f0f2]"
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
              <ChevronDown className="w-3 h-3 text-[#f0f0f2]/50" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0e0e11] border border-[rgba(240,240,242,0.15)] shadow-[0_10px_40px_rgba(0,0,0,0.9)] z-50 p-2 space-y-1 font-mono text-xs animate-fade-in">
                <div className="p-2 border-b border-[rgba(240,240,242,0.08)]">
                  <div className="font-bold text-[#f0f0f2] truncate">
                    {user.displayName || user.username}
                  </div>
                  <div className="text-[10px] text-[#f0f0f2]/50 truncate">
                    {user.email || user.phoneNumber || `@${user.username}`}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[9px] text-[#00ffa3]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ffa3]"></span>
                    <span className="uppercase">ROLE: {user.role} // CLOUD_SQL</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setHistoryDrawerOpen(true);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-2 py-2 hover:bg-[#181820] text-[#f0f0f2]/80 hover:text-[#00ffa3] flex items-center gap-2 transition-colors"
                >
                  <Database className="w-3.5 h-3.5 text-[#00ffa3]" />
                  <span>Persistent Patient Scans ({scanHistory.length})</span>
                </button>

                <button
                  onClick={() => {
                    setPolicyModalOpen(true);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-2 py-2 hover:bg-[#181820] text-[#f0f0f2]/80 hover:text-[#00ffa3] flex items-center gap-2 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-[#00ffa3]" />
                  <span>Security & Cookie Policies</span>
                </button>

                <div className="pt-1 border-t border-[rgba(240,240,242,0.08)]">
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-2 py-2 hover:bg-rose-950/40 text-rose-300 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,255,163,0.3)] cursor-pointer"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SIGN IN / REGISTER</span>
            <span className="sm:hidden">SIGN IN</span>
          </button>
        )}
      </div>
    </header>
  );
};
