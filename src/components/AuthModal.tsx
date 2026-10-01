import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    loginWithCredentials,
    signupWithCredentials,
    loginWithGoogle,
    loginWithGithub,
    sendOtp,
    verifyOtp,
    setPolicyModalOpen,
    setPolicyTab,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [signupMethod, setSignupMethod] = useState<'standard' | 'phone'>('standard');

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('clinician');

  // OTP state
  const [otpTarget, setOtpTarget] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status & error
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resend timer countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!authModalOpen) return null;

  const resetForm = () => {
    setIdentifier('');
    setPassword('');
    setUsername('');
    setEmail('');
    setPhoneNumber('');
    setDisplayName('');
    setOtpTarget('');
    setOtpCode('');
    setOtpSent(false);
    setOtpVerified(false);
    setDebugOtp(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleClose = () => {
    resetForm();
    setAuthModalOpen(false);
  };

  // Dispatch OTP
  const handleSendOtp = async (targetVal?: string) => {
    const target = targetVal || (signupMethod === 'phone' ? phoneNumber : identifier);
    if (!target || target.trim().length < 3) {
      setErrorMsg('Please enter a valid phone number or email address to receive OTP.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await sendOtp(target, activeTab === 'signup' ? 'signup' : 'login');
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setOtpTarget(target);
      setResendCooldown(30);
      if (res.debugCode) {
        setDebugOtp(res.debugCode);
      }
      setSuccessMsg(`Verification OTP dispatched to ${target}. Enter code below.`);
    } else {
      setErrorMsg(res.error || 'Failed to dispatch verification code.');
    }
  };

  // Handle Sign In Submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Account username, Gmail, or phone number is required.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await loginWithCredentials(
      identifier,
      authMode === 'password' ? password : undefined,
      authMode === 'otp' ? otpCode : undefined
    );

    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed. Please check credentials.');
    }
  };

  // Handle Sign Up Submission
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || username.trim().length < 3) {
      setErrorMsg('Account name must be at least 3 characters.');
      return;
    }

    if (signupMethod === 'standard' && !password) {
      setErrorMsg('Please specify a secure password for your account.');
      return;
    }

    if (signupMethod === 'phone' && (!phoneNumber || !otpCode)) {
      setErrorMsg('Please verify your phone number with the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await signupWithCredentials({
      username,
      email: email.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      password: password || undefined,
      displayName: displayName.trim() || username,
      role,
      otpCode: otpCode || undefined,
    });

    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Registration failed.');
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await loginWithGoogle();
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Google login was interrupted.');
    }
  };

  // GitHub OAuth Login
  const handleGithubLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await loginWithGithub();
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'GitHub login was interrupted.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0c0c0e] border border-[rgba(240,240,242,0.12)] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Monospace Telemetry Header */}
        <div className="h-10 px-4 bg-[#141418] border-b border-[rgba(240,240,242,0.08)] flex items-center justify-between shrink-0 font-mono text-[10px] text-[#f0f0f2]/60 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ffa3] shadow-[0_0_8px_#00ffa3]"></span>
            <span>CLINICAL_ACCESS_GATEWAY // CLOUD_SQL_SECURE</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-[#f0f0f2]/50 hover:text-[#f0f0f2] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Brand Header */}
          <div className="text-center space-y-1">
            <h2 className="font-syne text-xl sm:text-2xl font-extrabold tracking-tight text-[#f0f0f2]">
              NEUROCLASS CADx WORKSTATION
            </h2>
            <p className="font-mono text-xs text-[#00ffa3] tracking-wider">
              PERSISTENT RELATIONAL DATA LAYER // POSTGRESQL + FIREBASE
            </p>
          </div>

          {/* Tab Selector: Sign In / Sign Up */}
          <div className="flex bg-[#16161a] p-1 border border-[rgba(240,240,242,0.08)]">
            <button
              onClick={() => {
                setActiveTab('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 font-mono text-xs uppercase tracking-wider transition-all ${
                activeTab === 'signin'
                  ? 'bg-[#00ffa3] text-black font-bold shadow-[0_0_12px_rgba(0,255,163,0.3)]'
                  : 'text-[#f0f0f2]/60 hover:text-[#f0f0f2]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 font-mono text-xs uppercase tracking-wider transition-all ${
                activeTab === 'signup'
                  ? 'bg-[#00ffa3] text-black font-bold shadow-[0_0_12px_rgba(0,255,163,0.3)]'
                  : 'text-[#f0f0f2]/60 hover:text-[#f0f0f2]'
              }`}
            >
              Register Account
            </button>
          </div>

          {/* OAuth Buttons (Gmail / GitHub) */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#131317] hover:bg-[#1a1a20] border border-[rgba(240,240,242,0.1)] text-[#f0f0f2] text-xs font-mono tracking-wide transition-all disabled:opacity-50 group hover:border-[#00ffa3]/40"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google (Gmail)</span>
              </button>

              <button
                type="button"
                onClick={handleGithubLogin}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#131317] hover:bg-[#1a1a20] border border-[rgba(240,240,242,0.1)] text-[#f0f0f2] text-xs font-mono tracking-wide transition-all disabled:opacity-50 group hover:border-[#00ffa3]/40"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-[rgba(240,240,242,0.08)]"></div>
              <span className="font-mono text-[10px] text-[#f0f0f2]/40 uppercase tracking-widest">
                OR CREDENTIAL / OTP
              </span>
              <div className="flex-1 h-px bg-[rgba(240,240,242,0.08)]"></div>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2 p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs font-mono animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#00ffa3] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div>{successMsg}</div>
                {debugOtp && (
                  <div className="text-[10px] text-[#00ffa3] bg-black/60 px-2 py-0.5 inline-block border border-[#00ffa3]/30">
                    TEST_CODE: <span className="font-bold underline">{debugOtp}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: SIGN IN */}
          {/* ========================================================================= */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="flex justify-between items-center text-xs font-mono text-[#f0f0f2]/60">
                <span>AUTHENTICATION METHOD:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('password');
                      setErrorMsg(null);
                    }}
                    className={`px-2 py-0.5 text-[11px] ${
                      authMode === 'password' ? 'text-[#00ffa3] font-bold border-b border-[#00ffa3]' : 'text-slate-400'
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('otp');
                      setErrorMsg(null);
                    }}
                    className={`px-2 py-0.5 text-[11px] ${
                      authMode === 'otp' ? 'text-[#00ffa3] font-bold border-b border-[#00ffa3]' : 'text-slate-400'
                    }`}
                  >
                    Phone / Email OTP
                  </button>
                </div>
              </div>

              {/* Identifier Input */}
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-[#f0f0f2]/60 uppercase tracking-wider">
                  Account Name / Gmail / Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. Ishank2301 or user@gmail.com or +15551234567"
                    className="w-full bg-[#131317] border border-[rgba(240,240,242,0.12)] px-3 py-2 text-xs font-mono text-[#f0f0f2] placeholder-[#f0f0f2]/30 focus:outline-none focus:border-[#00ffa3] transition-colors"
                  />
                  <UserIcon className="w-4 h-4 text-[#f0f0f2]/40 absolute right-3 top-2.5" />
                </div>
              </div>

              {/* Password Mode */}
              {authMode === 'password' && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block font-mono text-[10px] text-[#f0f0f2]/60 uppercase tracking-wider">
                      Master Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#131317] border border-[rgba(240,240,242,0.12)] px-3 py-2 text-xs font-mono text-[#f0f0f2] placeholder-[#f0f0f2]/30 focus:outline-none focus:border-[#00ffa3] transition-colors"
                    />
                    <Lock className="w-4 h-4 text-[#f0f0f2]/40 absolute right-3 top-2.5" />
                  </div>
                </div>
              )}

              {/* OTP Mode */}
              {authMode === 'otp' && (
                <div className="space-y-2 bg-[#101014] p-3 border border-[rgba(240,240,242,0.08)]">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-[#f0f0f2]/60 uppercase">6-Digit Verification Code</span>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={() => handleSendOtp(identifier)}
                      className="font-mono text-[10px] text-[#00ffa3] hover:underline disabled:opacity-40"
                    >
                      {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Send OTP Code'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit OTP (e.g. 749201)"
                      className="w-full bg-[#16161c] border border-[rgba(240,240,242,0.12)] px-3 py-2 text-sm font-mono tracking-widest text-[#00ffa3] placeholder-[#f0f0f2]/30 focus:outline-none focus:border-[#00ffa3]"
                    />
                    <KeyRound className="w-4 h-4 text-[#00ffa3]/60 absolute right-3 top-2.5" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-mono font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,163,0.3)] disabled:opacity-50 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{loading ? 'AUTHENTICATING...' : 'SIGN IN TO WORKSTATION'}</span>
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SIGN UP */}
          {/* ========================================================================= */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSignupMethod('standard');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 font-mono text-[10px] uppercase border ${
                    signupMethod === 'standard'
                      ? 'border-[#00ffa3] text-[#00ffa3] bg-[#00ffa3]/10 font-bold'
                      : 'border-[rgba(240,240,242,0.1)] text-slate-400'
                  }`}
                >
                  Standard (User + Email)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignupMethod('phone');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 font-mono text-[10px] uppercase border ${
                    signupMethod === 'phone'
                      ? 'border-[#00ffa3] text-[#00ffa3] bg-[#00ffa3]/10 font-bold'
                      : 'border-[rgba(240,240,242,0.1)] text-slate-400'
                  }`}
                >
                  Phone with OTP Verification
                </button>
              </div>

              {/* Account Name */}
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-[#f0f0f2]/60 uppercase tracking-wider">
                  Account Name (Username) *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Ishank2301 or dr_mishra"
                  className="w-full bg-[#131317] border border-[rgba(240,240,242,0.12)] px-3 py-2 text-xs font-mono text-[#f0f0f2] placeholder-[#f0f0f2]/30 focus:outline-none focus:border-[#00ffa3]"
                />
              </div>

              {/* Display Name & Role */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block font-mono text-[10px] text-[#f0f0f2]/60 uppercase tracking-wider">
                    Full Name / Title
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Dr. Ishank Mishra"
                    className="w-full bg-[#131317] border border-[rgba(240,240,242,0.12)] px-3 py-2 text-xs font-mono text-[#f0f0f2] placeholder-[#f0f0f2]/30 focus:outline-none focus:border-[#00ffa3]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-[10px] text-[#f0f0f2]/60 uppercase tracking-wider">
                    Clinical Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#131317] border border-[rgba(240,240,242,0.12)] px-2 py-2 text-xs font-mono text-[#00ffa3] focus:outline-none focus:border-[#00ffa3]"
                  >
                    <option value="clinician">Neuroradiologist</option>
                    <option value="neurosurgeon">Neurosurgeon</option>
                    <option value="researcher">Clinical Researcher</option>
                    <option value="resident">Medical Resident</option>
                  </select>
                </div>
              </div>

              {/* Email (Optional or Required for Standard) */}
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-[#f0f0f2]/60 uppercase tracking-wider">
                  Gmail / Primary Email {signupMethod === 'standard' ? '*' : '(Optional)'}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required={signupMethod === 'standard'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ishankmishra579@gmail.com"
                    className="w-full bg-[#131317] border border-[rgba(240,240,242,0.12)] px-3 py-2 text-xs font-mono text-[#f0f0f2] placeholder-[#f0f0f2]/30 focus:outline-none focus:border-[#00ffa3]"
                  />
                  <Mail className="w-4 h-4 text-[#f0f0f2]/40 absolute right-3 top-2.5" />
                </div>
              </div>

              {/* Phone + OTP if Phone signup */}
              {signupMethod === 'phone' && (
                <div className="space-y-3 bg-[#101014] p-3 border border-[#00ffa3]/30">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block font-mono text-[10px] text-[#00ffa3] uppercase tracking-wider">
                        Phone Number (With Country Code) *
                      </label>
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || loading || !phoneNumber}
                        onClick={() => handleSendOtp(phoneNumber)}
                        className="font-mono text-[10px] text-[#00ffa3] hover:underline disabled:opacity-40"
                      >
                        {resendCooldown > 0 ? `Wait ${resendCooldown}s` : 'Send Verification OTP'}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 98765 43210 or +1 415 555 2671"
                        className="w-full bg-[#16161c] border border-[rgba(240,240,242,0.12)] px-3 py-2 text-xs font-mono text-[#f0f0f2] placeholder-[#f0f0f2]/30 focus:outline-none focus:border-[#00ffa3]"
                      />
                      <Phone className="w-4 h-4 text-[#00ffa3]/60 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-mono text-[10px] text-[#f0f0f2]/60 uppercase tracking-wider">
                      Enter 6-Digit OTP *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="6-digit verification code"
                      className="w-full bg-[#16161c] border border-[rgba(240,240,242,0.12)] px-3 py-2 text-sm font-mono tracking-widest text-[#00ffa3] placeholder-[#f0f0f2]/30 focus:outline-none focus:border-[#00ffa3]"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1">
                <label className="block font-mono text-[10px] text-[#f0f0f2]/60 uppercase tracking-wider">
                  Create Password {signupMethod === 'phone' ? '(Optional for direct OTP sign-in)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required={signupMethod === 'standard'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-[#131317] border border-[rgba(240,240,242,0.12)] px-3 py-2 text-xs font-mono text-[#f0f0f2] placeholder-[#f0f0f2]/30 focus:outline-none focus:border-[#00ffa3]"
                  />
                  <Lock className="w-4 h-4 text-[#f0f0f2]/40 absolute right-3 top-2.5" />
                </div>
              </div>

              {/* Consent check */}
              <div className="text-[11px] font-mono text-[#f0f0f2]/50 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00ffa3] shrink-0 mt-0.5" />
                <span>
                  By registering, you agree to our{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setPolicyTab('terms');
                      setPolicyModalOpen(true);
                    }}
                    className="text-[#00ffa3] hover:underline"
                  >
                    Clinical Terms
                  </button>
                  ,{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setPolicyTab('privacy');
                      setPolicyModalOpen(true);
                    }}
                    className="text-[#00ffa3] hover:underline"
                  >
                    Privacy Policy
                  </button>
                  , and secure HTTP cookies.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-mono font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,163,0.3)] disabled:opacity-50 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'CREATING ACCOUNT...' : 'REGISTER & INITIALIZE DATABASE'}</span>
              </button>
            </form>
          )}

          {/* Security & Data Integrity Telemetry Footer */}
          <div className="pt-3 border-t border-[rgba(240,240,242,0.08)] flex items-center justify-between font-mono text-[9px] text-[#f0f0f2]/40">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00ffa3]" />
              POSTGRESQL AES-256 // BCRYPT // SECURE COOKIES
            </span>
            <button
              onClick={() => {
                setPolicyTab('security');
                setPolicyModalOpen(true);
              }}
              className="text-[#00ffa3] hover:underline"
            >
              SECURITY SPECS →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
