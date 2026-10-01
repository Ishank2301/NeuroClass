import React from 'react';
import { useAuth, PersistentScan } from '../context/AuthContext';
import {
  X,
  Database,
  Trash2,
  ExternalLink,
  Calendar,
  Layers,
  Activity,
  AlertCircle,
  FileCheck,
  RefreshCw,
} from 'lucide-react';

interface ScanHistoryDrawerProps {
  onLoadScanIntoViewer?: (scan: PersistentScan) => void;
}

export const ScanHistoryDrawer: React.FC<ScanHistoryDrawerProps> = ({ onLoadScanIntoViewer }) => {
  const {
    historyDrawerOpen,
    setHistoryDrawerOpen,
    scanHistory,
    deleteScanFromHistory,
    loadUserScanHistory,
    user,
    setAuthModalOpen,
  } = useAuth();

  if (!historyDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-xl bg-[#0a0a0c] border-l border-[rgba(240,240,242,0.12)] shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col h-full animate-slide-left">
        {/* Monospace Header */}
        <div className="h-12 px-5 bg-[#121216] border-b border-[rgba(240,240,242,0.08)] flex items-center justify-between shrink-0 font-mono text-xs text-[#f0f0f2]/70 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#00ffa3]" />
            <span className="font-bold text-[#f0f0f2]">PERSISTENT CLOUD SQL DIAGNOSTIC ARCHIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadUserScanHistory()}
              className="p-1.5 hover:text-[#00ffa3] text-[#f0f0f2]/50 transition-colors"
              title="Refresh SQL Records"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setHistoryDrawerOpen(false)}
              className="p-1.5 hover:text-[#f0f0f2] text-[#f0f0f2]/50 transition-colors"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Status Bar */}
        <div className="px-5 py-3 bg-[#16161b] border-b border-[rgba(240,240,242,0.06)] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ffa3]"></span>
            <span className="text-[#f0f0f2]">
              CLINICIAN: <span className="text-[#00ffa3] font-bold">{user?.displayName || user?.username || 'Guest'}</span>
            </span>
          </div>
          <span className="text-[#f0f0f2]/40 text-[10px]">
            RECORDS PERSISTED: {scanHistory.length}
          </span>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!user ? (
            <div className="p-8 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-syne text-base font-bold text-[#f0f0f2]">Sign In Required</h4>
                <p className="font-mono text-xs text-[#f0f0f2]/60">
                  Please sign in or register to synchronize and retrieve your patient MRI diagnostic archive from Cloud SQL.
                </p>
              </div>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-5 py-2.5 bg-[#00ffa3] text-black font-mono font-bold text-xs uppercase"
              >
                Sign In Now
              </button>
            </div>
          ) : scanHistory.length === 0 ? (
            <div className="p-8 text-center space-y-3 border border-dashed border-[rgba(240,240,242,0.1)]">
              <FileCheck className="w-8 h-8 text-[#00ffa3]/50 mx-auto" />
              <h4 className="font-syne text-sm font-bold text-[#f0f0f2]">No Saved MRI Scans Yet</h4>
              <p className="font-mono text-xs text-[#f0f0f2]/50 leading-relaxed">
                When you run CADx classification on an MRI scan in the Diagnosis tab, click &quot;Save to Cloud SQL&quot; to securely archive the patient findings and Grad-CAM++ parameters.
              </p>
            </div>
          ) : (
            scanHistory.map((scan) => (
              <div
                key={scan.id}
                className="p-4 bg-[#111114] border border-[rgba(240,240,242,0.08)] hover:border-[#00ffa3]/40 transition-all space-y-3 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#00ffa3]">
                        {scan.patientRef}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 uppercase tracking-wider font-bold ${
                          scan.predictedClass === 'Glioma'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                            : scan.predictedClass === 'Meningioma'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                            : scan.predictedClass === 'Pituitary'
                            ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {scan.predictedClass} // {scan.confidence}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-[#f0f0f2]/70 mt-0.5">
                      {scan.scanName}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteScanFromHistory(scan.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Delete Record from Cloud SQL"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#f0f0f2]/50 bg-[#16161c] p-2">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-[#00ffa3]" />
                    <span>PLANE: {scan.slicePlane || 'Axial T1-CE'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-[#00ffa3]" />
                    <span>HEATMAP: {scan.heatmapType || 'Grad-CAM++'}</span>
                  </div>
                </div>

                {scan.clinicalNotes && (
                  <p className="font-mono text-[11px] text-[#f0f0f2]/80 italic bg-[#0c0c0e] p-2 border-l-2 border-[#00ffa3]">
                    &quot;{scan.clinicalNotes}&quot;
                  </p>
                )}

                {/* Footer and load button */}
                <div className="flex items-center justify-between pt-2 border-t border-[rgba(240,240,242,0.06)]">
                  <div className="flex items-center gap-1 font-mono text-[9px] text-[#f0f0f2]/40">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(scan.createdAt).toLocaleDateString()}</span>
                  </div>

                  {onLoadScanIntoViewer && (
                    <button
                      onClick={() => {
                        onLoadScanIntoViewer(scan);
                        setHistoryDrawerOpen(false);
                      }}
                      className="px-2.5 py-1 bg-[#1a1a22] hover:bg-[#00ffa3] hover:text-black text-[#00ffa3] font-mono text-[10px] uppercase font-bold flex items-center gap-1 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>LOAD TO PACS</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
