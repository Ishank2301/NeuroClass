import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleAuthProvider, githubAuthProvider } from '../lib/firebase';

export interface User {
  id: number;
  uid: string;
  username: string | null;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  provider: string;
}

export interface UserPreferences {
  cookieConsent: string;
  cookieAnalytics: boolean;
  cookieMarketing: boolean;
  hipaaConsentAccepted: boolean;
  dataRetentionMonths?: number;
  theme: string;
}

export interface PersistentScan {
  id: number;
  userId: number;
  patientRef: string;
  scanName: string;
  scanUrl: string | null;
  predictedClass: string;
  confidence: string;
  allScores: string | null;
  slicePlane: string | null;
  heatmapType: string | null;
  clinicalNotes: string | null;
  status: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  preferences: UserPreferences | null;
  scanHistory: PersistentScan[];
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  policyModalOpen: boolean;
  setPolicyModalOpen: (open: boolean) => void;
  policyTab: 'cookies' | 'privacy' | 'security' | 'terms';
  setPolicyTab: (tab: 'cookies' | 'privacy' | 'security' | 'terms') => void;
  historyDrawerOpen: boolean;
  setHistoryDrawerOpen: (open: boolean) => void;
  loginWithCredentials: (identifier: string, password?: string, otpCode?: string) => Promise<{ success: boolean; error?: string }>;
  signupWithCredentials: (data: {
    username: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    displayName?: string;
    role?: string;
    otpCode?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithGithub: () => Promise<{ success: boolean; error?: string }>;
  sendOtp: (target: string, purpose?: string) => Promise<{ success: boolean; message?: string; debugCode?: string; error?: string }>;
  verifyOtp: (target: string, code: string, purpose?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  saveScanToCloudSql: (scanData: {
    patientRef: string;
    scanName: string;
    scanUrl?: string;
    predictedClass: string;
    confidence: string;
    allScores?: Record<string, number>;
    slicePlane?: string;
    heatmapType?: string;
    clinicalNotes?: string;
  }) => Promise<{ success: boolean; scan?: PersistentScan; error?: string }>;
  loadUserScanHistory: () => Promise<void>;
  deleteScanFromHistory: (scanId: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [scanHistory, setScanHistory] = useState<PersistentScan[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<'cookies' | 'privacy' | 'security' | 'terms'>('cookies');
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  // Check current session on mount
  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setPreferences(data.preferences || null);
          // Load scan history in background
          fetchScanHistory();
        } else {
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Session check error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchScanHistory = async () => {
    try {
      const res = await fetch('/api/scans');
      if (res.ok) {
        const data = await res.json();
        setScanHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch scan history:', err);
    }
  };

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Login via account name (username) or email/phone + password/otp
  const loginWithCredentials = async (identifier: string, password?: string, otpCode?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed.' };
      }
      setUser(data.user);
      setPreferences(data.preferences || null);
      setAuthModalOpen(false);
      fetchScanHistory();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login.' };
    }
  };

  // Sign up with credentials & optional OTP verification
  const signupWithCredentials = async (formData: {
    username: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    displayName?: string;
    role?: string;
    otpCode?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Signup failed.' };
      }
      setUser(data.user);
      setPreferences(data.preferences || null);
      setAuthModalOpen(false);
      fetchScanHistory();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration.' };
    }
  };

  // Google (Gmail) OAuth Sign-In via Firebase
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const firebaseUser = result.user;

      const res = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          provider: 'google',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to sync Google account.' };
      }

      setUser(data.user);
      setPreferences(data.preferences || null);
      setAuthModalOpen(false);
      fetchScanHistory();
      return { success: true };
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      return { success: false, error: err.message || 'Google sign-in popup failed or was closed.' };
    }
  };

  // GitHub OAuth Sign-In via Firebase
  const loginWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubAuthProvider);
      const firebaseUser = result.user;

      const res = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          provider: 'github',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to sync GitHub account.' };
      }

      setUser(data.user);
      setPreferences(data.preferences || null);
      setAuthModalOpen(false);
      fetchScanHistory();
      return { success: true };
    } catch (err: any) {
      console.error('GitHub Sign-In Error:', err);
      return { success: false, error: err.message || 'GitHub sign-in popup failed or was closed.' };
    }
  };

  // Send OTP
  const sendOtp = async (target: string, purpose: string = 'signup') => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, purpose }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to send OTP.' };
      }
      return { success: true, message: data.message, debugCode: data.debugCode };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error sending OTP.' };
    }
  };

  // Verify OTP
  const verifyOtp = async (target: string, code: string, purpose: string = 'signup') => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, code, purpose }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid OTP code.' };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error verifying OTP.' };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await firebaseSignOut(auth).catch(() => {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setScanHistory([]);
    }
  };

  // Update Preferences
  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    try {
      const res = await fetch('/api/auth/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs),
      });
      if (res.ok) {
        const data = await res.json();
        setPreferences(data.preferences);
      }
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  };

  // Persist MRI scan diagnosis into Cloud SQL
  const saveScanToCloudSql = async (scanData: {
    patientRef: string;
    scanName: string;
    scanUrl?: string;
    predictedClass: string;
    confidence: string;
    allScores?: Record<string, number>;
    slicePlane?: string;
    heatmapType?: string;
    clinicalNotes?: string;
  }) => {
    if (!user) {
      setAuthModalOpen(true);
      return { success: false, error: 'Sign in to persist patient diagnostic records in Cloud SQL.' };
    }

    try {
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to save scan record.' };
      }

      setScanHistory((prev) => [data.scan, ...prev]);
      return { success: true, scan: data.scan };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error saving scan.' };
    }
  };

  const deleteScanFromHistory = async (scanId: number) => {
    try {
      const res = await fetch(`/api/scans/${scanId}`, { method: 'DELETE' });
      if (res.ok) {
        setScanHistory((prev) => prev.filter((s) => s.id !== scanId));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Delete scan error:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        preferences,
        scanHistory,
        authModalOpen,
        setAuthModalOpen,
        policyModalOpen,
        setPolicyModalOpen,
        policyTab,
        setPolicyTab,
        historyDrawerOpen,
        setHistoryDrawerOpen,
        loginWithCredentials,
        signupWithCredentials,
        loginWithGoogle,
        loginWithGithub,
        sendOtp,
        verifyOtp,
        logout,
        updatePreferences,
        saveScanToCloudSql,
        loadUserScanHistory: fetchScanHistory,
        deleteScanFromHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
