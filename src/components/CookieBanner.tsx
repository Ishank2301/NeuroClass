import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cookie, ShieldCheck, Settings, X, Check } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const { preferences, updatePreferences, setPolicyModalOpen, setPolicyTab } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if consent has been explicitly acknowledged
    const localConsent = localStorage.getItem('nc_cookie_consent_ack');
    if (!localConsent && (!preferences || !preferences.cookieConsent)) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [preferences]);

  if (!visible) return null;

  const handleAcceptAll = async () => {
    localStorage.setItem('nc_cookie_consent_ack', 'true');
    setVisible(false);
    await updatePreferences({
      cookieConsent: 'all',
      cookieAnalytics: true,
      cookieMarketing: false,
    });
  };

  const handleRejectNonEssential = async () => {
    localStorage.setItem('nc_cookie_consent_ack', 'true');
    setVisible(false);
    await updatePreferences({
      cookieConsent: 'essential',
      cookieAnalytics: false,
      cookieMarketing: false,
    });
  };

  const handleOpenCustomize = () => {
    setPolicyTab('cookies');
    setPolicyModalOpen(true);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 animate-slide-up pointer-events-none">
      <div className="max-w-5xl mx-auto bg-[#0a0a0c]/95 border border-[rgba(240,240,242,0.18)] shadow-[0_0_40px_rgba(0,0,0,0.9)] backdrop-blur-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pointer-events-auto">
        {/* Left info */}
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2.5 bg-[#141418] border border-[rgba(240,240,242,0.1)] text-[#00ffa3] shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-syne text-sm font-bold text-[#f0f0f2]">
                CLINICAL COOKIE & WORKSTATION DATA GOVERNANCE
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/30">
                <ShieldCheck className="w-3 h-3" />
                HIPAA & GDPR SAFE HARBOR
              </span>
            </div>
            <p className="font-mono text-xs text-[#f0f0f2]/60 max-w-2xl leading-relaxed">
              We deploy encrypted HttpOnly session cookies to secure your authenticated Cloud SQL records and preserve PACS CADx calibrated viewing states. No biometric or patient MRI scan data is sold or shared.
            </p>
          </div>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto shrink-0 justify-end">
          <button
            onClick={handleOpenCustomize}
            className="flex-1 md:flex-none px-3.5 py-2 border border-[rgba(240,240,242,0.12)] hover:bg-[#16161c] text-[#f0f0f2]/80 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>

          <button
            onClick={handleRejectNonEssential}
            className="flex-1 md:flex-none px-3.5 py-2 border border-[rgba(240,240,242,0.12)] hover:bg-[#16161c] text-[#f0f0f2]/80 font-mono text-xs uppercase tracking-wider transition-colors"
          >
            Essential Only
          </button>

          <button
            onClick={handleAcceptAll}
            className="w-full sm:w-auto px-5 py-2 bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,255,163,0.35)] transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Accept All</span>
          </button>
        </div>
      </div>
    </div>
  );
};
