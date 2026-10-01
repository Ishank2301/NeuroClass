import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Shield,
  Cookie,
  FileText,
  Lock,
  CheckCircle,
  Database,
  Server,
  Key,
  Layers,
  AlertTriangle,
  Save,
} from 'lucide-react';

export const PolicyModal: React.FC = () => {
  const {
    policyModalOpen,
    setPolicyModalOpen,
    policyTab,
    setPolicyTab,
    preferences,
    updatePreferences,
  } = useAuth();

  // Local preferences state
  const [cookieConsent, setCookieConsent] = useState<'all' | 'essential' | 'custom'>(
    (preferences?.cookieConsent as any) || 'all'
  );
  const [cookieAnalytics, setCookieAnalytics] = useState(preferences?.cookieAnalytics ?? true);
  const [cookieMarketing, setCookieMarketing] = useState(preferences?.cookieMarketing ?? false);
  const [dataRetention, setDataRetention] = useState(24);
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!policyModalOpen) return null;

  const handleSavePreferences = async () => {
    setIsSaving(true);
    await updatePreferences({
      cookieConsent,
      cookieAnalytics,
      cookieMarketing,
      dataRetentionMonths: dataRetention,
    });
    setIsSaving(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0c0c0e] border border-[rgba(240,240,242,0.15)] shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Monospace Header */}
        <div className="h-11 px-5 bg-[#141418] border-b border-[rgba(240,240,242,0.08)] flex items-center justify-between shrink-0 font-mono text-[10px] text-[#f0f0f2]/60 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00ffa3]" />
            <span>NEUROCLASS CLINICAL GOVERNANCE & SECURITY SPECIFICATIONS</span>
          </div>
          <button
            onClick={() => setPolicyModalOpen(false)}
            className="p-1 text-[#f0f0f2]/50 hover:text-[#f0f0f2] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[rgba(240,240,242,0.08)] bg-[#101014] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setPolicyTab('cookies')}
            className={`flex items-center gap-2 px-5 py-3 font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              policyTab === 'cookies'
                ? 'border-b-2 border-[#00ffa3] text-[#00ffa3] bg-[#00ffa3]/5 font-bold'
                : 'text-[#f0f0f2]/60 hover:text-[#f0f0f2]'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            Cookie Settings
          </button>

          <button
            onClick={() => setPolicyTab('security')}
            className={`flex items-center gap-2 px-5 py-3 font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              policyTab === 'security'
                ? 'border-b-2 border-[#00ffa3] text-[#00ffa3] bg-[#00ffa3]/5 font-bold'
                : 'text-[#f0f0f2]/60 hover:text-[#f0f0f2]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Data Integrity & Security
          </button>

          <button
            onClick={() => setPolicyTab('privacy')}
            className={`flex items-center gap-2 px-5 py-3 font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              policyTab === 'privacy'
                ? 'border-b-2 border-[#00ffa3] text-[#00ffa3] bg-[#00ffa3]/5 font-bold'
                : 'text-[#f0f0f2]/60 hover:text-[#f0f0f2]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            HIPAA & Privacy Policy
          </button>

          <button
            onClick={() => setPolicyTab('terms')}
            className={`flex items-center gap-2 px-5 py-3 font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              policyTab === 'terms'
                ? 'border-b-2 border-[#00ffa3] text-[#00ffa3] bg-[#00ffa3]/5 font-bold'
                : 'text-[#f0f0f2]/60 hover:text-[#f0f0f2]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Clinical Terms
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#f0f0f2]">
          {/* ========================================================================= */}
          {/* 1. COOKIE SETTINGS */}
          {/* ========================================================================= */}
          {policyTab === 'cookies' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-syne text-lg font-bold text-[#f0f0f2]">
                  HTTP Cookie & Client Persistence Governance
                </h3>
                <p className="font-mono text-xs text-[#f0f0f2]/60">
                  NeuroClass uses hardened HTTP-only cookies and client storage strictly to maintain authenticated workstation sessions and prevent diagnostic state corruption.
                </p>
              </div>

              {/* Granular Toggles */}
              <div className="space-y-3">
                {/* Essential Cookies */}
                <div className="p-4 bg-[#141418] border border-[rgba(240,240,242,0.1)] flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#00ffa3]">
                        nc_session_token (Strictly Essential)
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/30">
                        ALWAYS ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-[#f0f0f2]/60 font-mono">
                      Cryptographically generated 384-bit token stored in an HttpOnly, SameSite=Lax cookie. Protects against CSRF and cross-site scripting (XSS) session interception.
                    </p>
                  </div>
                  <div className="shrink-0 pt-1">
                    <CheckCircle className="w-5 h-5 text-[#00ffa3]" />
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="p-4 bg-[#141418] border border-[rgba(240,240,242,0.1)] flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#f0f0f2]">
                        PACS Workstation Layout & Presets
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 bg-white/5 text-[#f0f0f2]/60 border border-white/10">
                        FUNCTIONAL
                      </span>
                    </div>
                    <p className="text-xs text-[#f0f0f2]/60 font-mono">
                      Saves your active DICOM windowing levels (Brain W:80 L:40, Subdural W:130 L:50), Grad-CAM++ colormap selection, and selected CNN inference backbone.
                    </p>
                  </div>
                  <div className="shrink-0 pt-1">
                    <CheckCircle className="w-5 h-5 text-[#00ffa3]" />
                  </div>
                </div>

                {/* Analytics & Diagnostic Quality */}
                <div className="p-4 bg-[#141418] border border-[rgba(240,240,242,0.1)] flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#f0f0f2]">
                        Diagnostic Quality & Telemetry
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 bg-white/5 text-[#f0f0f2]/60 border border-white/10">
                        OPTIONAL
                      </span>
                    </div>
                    <p className="text-xs text-[#f0f0f2]/60 font-mono">
                      Tracks inference execution latencies and model classification distribution anonymously to assist research model optimization. Zero patient images are transferred.
                    </p>
                  </div>
                  <button
                    onClick={() => setCookieAnalytics(!cookieAnalytics)}
                    className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                      cookieAnalytics ? 'bg-[#00ffa3]' : 'bg-[#2a2a30]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-black transition-transform ${
                        cookieAnalytics ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[rgba(240,240,242,0.08)]">
                <span className="font-mono text-xs text-[#00ffa3]">
                  {savedNotice ? '✓ Cookie preferences saved to Cloud SQL' : ''}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setCookieAnalytics(false);
                      setCookieMarketing(false);
                      setCookieConsent('essential');
                    }}
                    className="px-4 py-2 border border-[rgba(240,240,242,0.1)] hover:bg-[#1a1a20] font-mono text-xs text-[#f0f0f2]/70 uppercase"
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-mono font-bold text-xs uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,163,0.3)]"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'SAVING...' : 'SAVE PREFERENCES'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. DATA INTEGRITY & HIGH SECURITY ("DATA IS NOT BROKEN") */}
          {/* ========================================================================= */}
          {policyTab === 'security' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-syne text-lg font-bold text-[#f0f0f2] flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#00ffa3]" />
                  <span>Resilient Relational Architecture & Anti-Corruption Shield</span>
                </h3>
                <p className="font-mono text-xs text-[#f0f0f2]/60">
                  Engineered to ensure zero data loss, transactional isolation, and full protection against tampering or schema corruption.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 bg-[#141418] border border-[rgba(240,240,242,0.08)] space-y-2">
                  <div className="flex items-center gap-2 text-[#00ffa3] font-mono text-xs font-bold">
                    <Database className="w-4 h-4" />
                    <span>ACID PostgreSQL Engine</span>
                  </div>
                  <p className="text-xs text-[#f0f0f2]/70 font-mono leading-relaxed">
                    All patient diagnostic records and authentication sessions are committed via Atomic, Consistent, Isolated, and Durable transactions in Google Cloud SQL. Foreign key constraints enforce relational integrity.
                  </p>
                </div>

                <div className="p-4 bg-[#141418] border border-[rgba(240,240,242,0.08)] space-y-2">
                  <div className="flex items-center gap-2 text-[#00ffa3] font-mono text-xs font-bold">
                    <Key className="w-4 h-4" />
                    <span>Bcrypt Salted Encryption</span>
                  </div>
                  <p className="text-xs text-[#f0f0f2]/70 font-mono leading-relaxed">
                    User credentials never touch disk in plaintext. Passwords are salted with 12 rounds of bcrypt cryptographic derivation, resilient against rainbow table attacks and GPU brute-forcing.
                  </p>
                </div>

                <div className="p-4 bg-[#141418] border border-[rgba(240,240,242,0.08)] space-y-2">
                  <div className="flex items-center gap-2 text-[#00ffa3] font-mono text-xs font-bold">
                    <Server className="w-4 h-4" />
                    <span>Drizzle ORM Sanitization</span>
                  </div>
                  <p className="text-xs text-[#f0f0f2]/70 font-mono leading-relaxed">
                    Zero raw unparameterized SQL strings. Drizzle ORM compiles all database interactions into type-checked prepared statements, eliminating SQL Injection (SQLi) vectors.
                  </p>
                </div>

                <div className="p-4 bg-[#141418] border border-[rgba(240,240,242,0.08)] space-y-2">
                  <div className="flex items-center gap-2 text-[#00ffa3] font-mono text-xs font-bold">
                    <Layers className="w-4 h-4" />
                    <span>Immutable Audit Logging</span>
                  </div>
                  <p className="text-xs text-[#f0f0f2]/70 font-mono leading-relaxed">
                    Every signup, login, OTP dispatch, scan persistence, and policy change is recorded into an append-only <code className="text-[#00ffa3]">security_audit_logs</code> table with client IP and timestamps.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-emerald-950/20 border border-[#00ffa3]/30 space-y-2">
                <div className="font-mono text-xs font-bold text-[#00ffa3] flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Cloud SQL Auto-Recovery & Backup Policy</span>
                </div>
                <p className="font-mono text-xs text-[#f0f0f2]/70 leading-relaxed">
                  Automatic point-in-time recovery (PITR) and transaction write-ahead logging (WAL) are enabled on the instance. If a workstation disconnects mid-inference, patient scan records remain uncorrupted.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. HIPAA & PRIVACY POLICY */}
          {/* ========================================================================= */}
          {policyTab === 'privacy' && (
            <div className="space-y-5 font-mono text-xs text-[#f0f0f2]/80 leading-relaxed">
              <div className="space-y-1">
                <h3 className="font-syne text-lg font-bold text-[#f0f0f2]">
                  HIPAA De-Identification & Privacy Standards
                </h3>
                <p className="text-[#f0f0f2]/60">
                  Compliance protocol compliant with Health Insurance Portability and Accountability Act (HIPAA) 45 CFR § 164.514(b).
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-[#141418] border border-[rgba(240,240,242,0.08)] space-y-1">
                  <div className="font-bold text-[#00ffa3]">1. Safe Harbor De-Identification</div>
                  <p>
                    All MRI scans uploaded to the NeuroClass PACS CADx engine are sanitized on the client side. Patient names, Social Security Numbers, Medical Record Numbers (MRNs), and facial biometric metadata are stripped prior to neural tensor ingestion.
                  </p>
                </div>

                <div className="p-3 bg-[#141418] border border-[rgba(240,240,242,0.08)] space-y-1">
                  <div className="font-bold text-[#00ffa3]">2. No Commercial Data Reselling</div>
                  <p>
                    Diagnostic imaging data, patient identifiers, and neuroradiology notes stored in Cloud SQL are strictly private to the authenticated clinician account. We do not monetize or sell clinical data to third-party ad networks or data brokers.
                  </p>
                </div>

                <div className="p-3 bg-[#141418] border border-[rgba(240,240,242,0.08)] space-y-1">
                  <div className="font-bold text-[#00ffa3]">3. Right to Erasure (GDPR Art. 17)</div>
                  <p>
                    Clinicians maintain full sovereign ownership over their diagnostic history. Any saved scan or complete account profile can be permanently deleted from the database at any moment with cascading zero-trace removal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. CLINICAL TERMS OF SERVICE */}
          {/* ========================================================================= */}
          {policyTab === 'terms' && (
            <div className="space-y-5 font-mono text-xs text-[#f0f0f2]/80 leading-relaxed">
              <div className="space-y-1">
                <h3 className="font-syne text-lg font-bold text-[#f0f0f2]">
                  Clinical CADx Terms of Service & Medical Disclaimer
                </h3>
                <p className="text-[#f0f0f2]/60">
                  Effective Date: October 1, 2026 // Diagnostic Version: 2.4.0
                </p>
              </div>

              <div className="p-4 bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-300">CLINICAL DECISION SUPPORT NOTICE</div>
                  <p className="text-amber-200/80">
                    NeuroClass CADx is an investigational Computer-Aided Diagnostic (CADx) support tool intended for use by qualified neuroradiologists and certified medical specialists. Neural classifications, Grad-CAM++ saliency overlays, and Gemini clinical consultation summaries are secondary adjuncts and do not supersede certified histopathological diagnosis.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#f0f0f2]">Clinician Responsibilities:</h4>
                <ul className="list-disc pl-5 space-y-1 text-[#f0f0f2]/70">
                  <li>Validate automated lesion segmentation against calibrated axial, coronal, and sagittal DICOM slices.</li>
                  <li>Perform comprehensive multi-parametric correlation with clinical presentation and patient history.</li>
                  <li>Safeguard workstation login credentials and terminate active sessions on shared hospital terminals.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
