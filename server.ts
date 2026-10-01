import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import {
  createUserWithCredentials,
  verifyUserPassword,
  createSession,
  revokeSession,
  createOtp,
  verifyOtp,
  getOrCreateUserByFirebase,
  getUserScanHistory,
  addScanHistory,
  deleteScanHistory,
  getUserPreferences,
  updateUserPreferences,
  logSecurityAudit,
  findUserByIdentifier,
} from './src/db/users.ts';
import { requireAuth, optionalAuth, AuthRequest } from './src/middleware/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Shared server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// ============================================================================
// 1. CHATBOT API (gemini-3.5-flash, gemini-3.1-flash-lite, gemini-3.1-pro-preview)
// ============================================================================
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, role = 'neuroradiologist', model = 'gemini-3.5-flash', contextData } = req.body;

    // Validate model selection
    const allowedModels = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
    const selectedModel = allowedModels.includes(model) ? model : 'gemini-3.5-flash';

    // System instruction defining clinical persona
    let systemInstruction = 'You are NeuroConsult AI, an expert clinical neuroradiologist and neuro-oncology diagnostic consultant embedded inside the NeuroClass PACS platform.';
    if (role === 'neurosurgeon') {
      systemInstruction = 'You are NeuroConsult Surgical, a senior neurosurgeon specializing in brain tumor craniotomies, transsphenoidal pituitary resections, stereotactic biopsies, and awake intraoperative mapping. Focus on surgical feasibility, Eloquent cortex proximity, trajectory, and extent of resection (EOR).';
    } else if (role === 'patient_counselor') {
      systemInstruction = 'You are NeuroConsult Care, a compassionate neuro-oncology clinical specialist who explains brain tumor MRI findings, WHO grades, prognosis, and treatment roadmaps in reassuring, clear, jargon-free medical language for patients and families.';
    }

    if (contextData) {
      systemInstruction += `\n\nActive PACS Patient Context:\nTumor Classification: ${contextData.prediction || 'Unknown'}\nConfidence: ${contextData.confidence || 'N/A'}\nSequence: ${contextData.sequence || 'T1-Gd + T2-FLAIR'}\nLesion Coordinates: ${contextData.bbox ? JSON.stringify(contextData.bbox) : 'Not specified'}`;
    }

    if (ai) {
      // Transform incoming messages to contents structure
      const contents = (messages || []).map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // Ensure last message is from user
      if (contents.length === 0) {
        return res.status(400).json({ error: 'No messages provided' });
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({
        reply: response.text || 'Unable to generate clinical response.',
        modelUsed: selectedModel,
        timestamp: new Date().toISOString(),
      });
    }

    // High-fidelity fallback simulation if GEMINI_API_KEY is not configured yet
    const lastUserMsg = (messages && messages[messages.length - 1]?.content) || '';
    let simulatedReply = `**[Simulated NeuroConsult Analysis (${selectedModel})]**\n\nBased on your query regarding "${lastUserMsg.slice(0, 80)}...":\n\n1. **Diagnostic Correlation:** Multi-parametric MRI evaluation confirms characteristics consistent with ${contextData?.prediction || 'intracranial pathology'}.\n2. **Histopathological Differential:** Primary considerations include High-Grade Glioma vs. Atypical Meningioma vs. Pituitary Adenoma based on dural tail sign and T2/FLAIR hyperintensity.\n3. **Clinical Recommendation:** Perform contrast-enhanced T1 mapping, perfusion MRI (rCBV assessment), and magnetic resonance spectroscopy (Cho/Cr ratio). Multidisciplinary tumor board review recommended.`;

    if (role === 'neurosurgeon') {
      simulatedReply = `**[Simulated Surgical Board Planning (${selectedModel})]**\n\n1. **Surgical Trajectory:** Frameless stereotactic neuronavigation with 5-ALA fluorescence guidance.\n2. **Surgical Risk:** Assessment of motor strip proximity; consider pre-operative DTI tractography.\n3. **Resection Goal:** Maximal safe resection with neuromonitoring (MEP/SSEP).`;
    }

    return res.json({
      reply: simulatedReply,
      modelUsed: selectedModel,
      isSimulated: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    return res.status(500).json({
      error: err.message || 'Internal server error in clinical chat.',
    });
  }
});

// ============================================================================
// 2. IMAGE CREATION & EDITING API (gemini-3.1-flash-image)
// ============================================================================
app.post('/api/image/generate-edit', async (req, res) => {
  try {
    const { prompt, sourceImageBase64, mode = 'create', aspectRatio = '1:1' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Text prompt is required.' });
    }

    if (ai) {
      const parts: any[] = [];
      if (mode === 'edit' && sourceImageBase64) {
        // Strip data:image/...;base64, prefix if present
        const cleanBase64 = sourceImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: cleanBase64,
          },
        });
      }
      parts.push({ text: prompt });

      // gemini-3.1-flash-image (alias for gemini-3.1-flash-image-preview)
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: ['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio) ? aspectRatio : '1:1',
            imageSize: '1K',
          },
        },
      });

      let generatedImageUrl: string | null = null;
      let textDescription = '';

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          } else if (part.text) {
            textDescription += part.text;
          }
        }
      }

      if (generatedImageUrl) {
        return res.json({
          imageUrl: generatedImageUrl,
          description: textDescription,
          prompt,
          mode,
        });
      }
    }

    // Fallback image generator (medical SVG rasterized or placeholder)
    const fallbackSvg = `
      <svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="600" fill="#030712"/>
        <circle cx="300" cy="300" r="240" fill="#090d16" stroke="#06b6d4" stroke-width="2" stroke-dasharray="6,4"/>
        <path d="M 200,260 Q 300,180 400,260 T 360,420 Q 300,450 240,420 Z" fill="#111827" stroke="#374151" stroke-width="3"/>
        <circle cx="280" cy="270" r="55" fill="rgba(239, 68, 68, 0.45)" stroke="#ef4444" stroke-width="2"/>
        <circle cx="280" cy="270" r="28" fill="rgba(245, 158, 11, 0.85)"/>
        <text x="300" y="520" fill="#06b6d4" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle" font-weight="600">
          NEUROCLASS MEDICAL ENHANCEMENT STUDIO
        </text>
        <text x="300" y="550" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">
          ${prompt.slice(0, 60)}
        </text>
      </svg>
    `;
    const fallbackBase64 = `data:image/svg+xml;base64,${Buffer.from(fallbackSvg).toString('base64')}`;

    return res.json({
      imageUrl: fallbackBase64,
      description: `Generated clinical illustration corresponding to: "${prompt}"`,
      prompt,
      mode,
      isSimulated: true,
    });
  } catch (err: any) {
    console.error('Error in /api/image/generate-edit:', err);
    return res.status(500).json({ error: err.message || 'Image generation failed.' });
  }
});

// ============================================================================
// 3. VEO VIDEO GENERATION (veo-3.1-fast-generate-preview)
// ============================================================================
app.post('/api/video/generate', async (req, res) => {
  try {
    const { prompt, imageBase64, aspectRatio = '16:9' } = req.body;

    const validatedRatio = aspectRatio === '9:16' ? '9:16' : '16:9';

    if (ai) {
      let imagePayload: any = undefined;
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        imagePayload = {
          imageBytes: cleanBase64,
          mimeType: 'image/png',
        };
      }

      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || '3D volumetric cine-loop rotating reconstruction of brain tumor MRI axial sequence with contrast enhancement',
        image: imagePayload,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: validatedRatio,
        },
      });

      return res.json({
        operationName: operation.name,
        aspectRatio: validatedRatio,
      });
    }

    // Simulated operation name if API key is not yet set
    const mockOpId = `models/veo-3.1-fast-generate-preview/operations/mock-${Date.now()}`;
    return res.json({
      operationName: mockOpId,
      aspectRatio: validatedRatio,
      isSimulated: true,
    });
  } catch (err: any) {
    console.error('Error in /api/video/generate:', err);
    return res.status(500).json({ error: err.message || 'Video generation initialization failed.' });
  }
});

app.post('/api/video/status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    // Check if simulated
    if (operationName.includes('mock-')) {
      const createdTime = parseInt(operationName.split('mock-')[1] || '0', 10);
      const elapsed = Date.now() - createdTime;
      // Finish mock after 4 seconds
      const done = elapsed > 4000;
      return res.json({
        done,
        progress: done ? 100 : Math.min(95, Math.floor((elapsed / 4000) * 100)),
        isSimulated: true,
      });
    }

    if (ai) {
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      return res.json({
        done: Boolean(updated.done),
        error: updated.error ? updated.error.message : undefined,
      });
    }

    return res.json({ done: true, isSimulated: true });
  } catch (err: any) {
    console.error('Error in /api/video/status:', err);
    return res.status(500).json({ error: err.message || 'Error checking video status' });
  }
});

app.post('/api/video/download', async (req, res) => {
  try {
    const { operationName } = req.body;

    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    if (operationName.includes('mock-') || !ai) {
      // Send a high-quality simulated looping MRI cine-loop data response or redirect
      return res.json({
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        isSimulated: true,
      });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).json({ error: 'Video URI not found in completed operation.' });
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey || '' },
    });

    res.setHeader('Content-Type', 'video/mp4');
    const arrayBuffer = await videoRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error('Error in /api/video/download:', err);
    return res.status(500).json({ error: err.message || 'Video download failed.' });
  }
});

// ============================================================================
// 4. AUTHENTICATION & SECURITY APIs (PostgreSQL + Firebase + OTP + Secure Cookies)
// ============================================================================

// Cookie options for secure HTTP-only session cookies
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/',
};

// 4.1 SEND OTP (Phone Number or Email)
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { target, purpose = 'signup' } = req.body;
    if (!target || typeof target !== 'string') {
      return res.status(400).json({ error: 'Valid phone number or email address is required.' });
    }

    const cleanTarget = target.trim();
    const otpRecord = await createOtp(cleanTarget, purpose);

    await logSecurityAudit(null, 'OTP_SENT', req.ip, `Target: ${cleanTarget}, Purpose: ${purpose}`);

    return res.json({
      success: true,
      message: `Verification code generated for ${cleanTarget}.`,
      expiresAt: otpRecord.expiresAt,
      // For clinical workstation preview, return debugCode so user can test without SMS gateway
      debugCode: otpRecord.code,
    });
  } catch (err: any) {
    console.error('Error in /api/auth/send-otp:', err);
    return res.status(500).json({ error: err.message || 'Failed to dispatch verification code.' });
  }
});

// 4.2 VERIFY OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { target, code, purpose = 'signup' } = req.body;
    if (!target || !code) {
      return res.status(400).json({ error: 'Target identifier and 6-digit OTP code are required.' });
    }

    const verification = await verifyOtp(target, code, purpose);
    if (!verification.success) {
      return res.status(400).json({ error: verification.message });
    }

    await logSecurityAudit(null, 'OTP_VERIFIED', req.ip, `Target: ${target}`);
    return res.json({ success: true, message: verification.message });
  } catch (err: any) {
    console.error('Error in /api/auth/verify-otp:', err);
    return res.status(500).json({ error: err.message || 'OTP verification failed.' });
  }
});

// 4.3 USER SIGNUP (Credentials, Phone with OTP, or Email)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, phoneNumber, password, displayName, role, otpCode } = req.body;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Account username must be at least 3 characters long.' });
    }

    // Require either password or verified phone/email
    if (!password && !phoneNumber) {
      return res.status(400).json({ error: 'Password or Phone Number verification is required.' });
    }

    // If phone number is supplied, verify OTP
    if (phoneNumber) {
      if (!otpCode) {
        return res.status(400).json({ error: 'OTP code is required to verify your phone number.' });
      }
      const otpRes = await verifyOtp(phoneNumber, otpCode, 'signup');
      if (!otpRes.success) {
        return res.status(400).json({ error: otpRes.message });
      }
    }

    // If email is supplied with an otpCode, verify it
    if (email && otpCode && !phoneNumber) {
      const otpRes = await verifyOtp(email, otpCode, 'signup');
      if (!otpRes.success) {
        return res.status(400).json({ error: otpRes.message });
      }
    }

    const newUser = await createUserWithCredentials({
      username,
      email,
      phoneNumber,
      password,
      displayName,
      role: role || 'clinician',
    });

    // Create session and set HTTP-only cookie
    const session = await createSession(newUser.id, req.ip, req.headers['user-agent']);
    res.cookie('nc_session_token', session.token, COOKIE_OPTIONS);

    await logSecurityAudit(newUser.id, 'USER_SIGNUP', req.ip, `Provider: ${newUser.provider}, Role: ${newUser.role}`);

    const preferences = await getUserPreferences(newUser.id);

    return res.status(201).json({
      success: true,
      message: 'Account registered and authenticated successfully.',
      user: {
        id: newUser.id,
        uid: newUser.uid,
        username: newUser.username,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        displayName: newUser.displayName,
        avatarUrl: newUser.avatarUrl,
        role: newUser.role,
        provider: newUser.provider,
      },
      preferences,
    });
  } catch (err: any) {
    console.error('Error in /api/auth/signup:', err);
    return res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

// 4.4 USER LOGIN (Username OR Email + Password, OR Phone + OTP)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password, otpCode } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: 'Account username, Gmail/email, or phone number is required.' });
    }

    let user = null;

    // Password login across username, email, or phone
    if (password) {
      user = await verifyUserPassword(identifier, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials. Please verify your account name and password.' });
      }
    } else if (otpCode) {
      // OTP-based phone or email login
      const otpRes = await verifyOtp(identifier, otpCode, 'login');
      if (!otpRes.success) {
        return res.status(401).json({ error: otpRes.message });
      }
      user = await findUserByIdentifier(identifier);
      if (!user) {
        return res.status(404).json({ error: 'No account registered with this phone or email. Please sign up first.' });
      }
    } else {
      return res.status(400).json({ error: 'Password or OTP verification code is required to sign in.' });
    }

    const session = await createSession(user.id, req.ip, req.headers['user-agent']);
    res.cookie('nc_session_token', session.token, COOKIE_OPTIONS);

    await logSecurityAudit(user.id, 'USER_LOGIN', req.ip, `Identifier: ${identifier}`);

    const preferences = await getUserPreferences(user.id);

    return res.json({
      success: true,
      message: 'Authenticated successfully.',
      user: {
        id: user.id,
        uid: user.uid,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        provider: user.provider,
      },
      preferences,
    });
  } catch (err: any) {
    console.error('Error in /api/auth/login:', err);
    return res.status(500).json({ error: err.message || 'Authentication failed.' });
  }
});

// 4.5 FIREBASE SYNC LOGIN (Gmail / GitHub OAuth Popup Flow)
app.post('/api/auth/firebase-login', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL, provider = 'google' } = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'Firebase UID is required.' });
    }

    const user = await getOrCreateUserByFirebase(
      uid,
      email || null,
      displayName || null,
      photoURL || null,
      provider
    );

    const session = await createSession(user.id, req.ip, req.headers['user-agent']);
    res.cookie('nc_session_token', session.token, COOKIE_OPTIONS);

    await logSecurityAudit(user.id, 'USER_LOGIN_OAUTH', req.ip, `Provider: ${provider}`);

    const preferences = await getUserPreferences(user.id);

    return res.json({
      success: true,
      user: {
        id: user.id,
        uid: user.uid,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        provider: user.provider,
      },
      preferences,
    });
  } catch (err: any) {
    console.error('Error in /api/auth/firebase-login:', err);
    return res.status(500).json({ error: err.message || 'Failed to authenticate via OAuth.' });
  }
});

// 4.6 GET CURRENT SESSION USER
app.get('/api/auth/me', optionalAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.json({ user: null, authenticated: false });
    }

    const preferences = await getUserPreferences(req.user.id);
    return res.json({
      user: req.user,
      authenticated: true,
      preferences,
    });
  } catch (err: any) {
    console.error('Error in /api/auth/me:', err);
    return res.status(500).json({ error: err.message || 'Error checking session.' });
  }
});

// 4.7 LOGOUT
app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = req.cookies?.nc_session_token;
    if (token) {
      await revokeSession(token);
    }
    res.clearCookie('nc_session_token', { path: '/' });
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err: any) {
    console.error('Error in /api/auth/logout:', err);
    return res.status(500).json({ error: 'Logout failed.' });
  }
});

// 4.8 COOKIE & PRIVACY PREFERENCES
app.get('/api/auth/preferences', optionalAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.json({
        preferences: {
          cookieConsent: 'all',
          cookieAnalytics: true,
          cookieMarketing: false,
          hipaaConsentAccepted: true,
          theme: 'dark',
        },
      });
    }
    const preferences = await getUserPreferences(req.user.id);
    return res.json({ preferences });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve preferences.' });
  }
});

app.put('/api/auth/preferences', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { cookieConsent, cookieAnalytics, cookieMarketing, hipaaConsentAccepted, theme } = req.body;
    if (req.user) {
      const updated = await updateUserPreferences(req.user.id, {
        cookieConsent,
        cookieAnalytics: Boolean(cookieAnalytics),
        cookieMarketing: Boolean(cookieMarketing),
        hipaaConsentAccepted: Boolean(hipaaConsentAccepted),
        theme,
      });
      await logSecurityAudit(req.user.id, 'POLICY_UPDATED', req.ip, `Consent: ${cookieConsent}`);
      return res.json({ success: true, preferences: updated });
    }
    return res.json({ success: true, preferences: req.body });
  } catch (err: any) {
    console.error('Error in /api/auth/preferences:', err);
    return res.status(500).json({ error: 'Failed to update preferences.' });
  }
});

// 4.9 PERSISTENT SCAN HISTORY (Cloud SQL)
app.get('/api/scans', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const history = await getUserScanHistory(userId);
    return res.json({ history });
  } catch (err: any) {
    console.error('Error in /api/scans:', err);
    return res.status(500).json({ error: err.message || 'Failed to load diagnostic scan history.' });
  }
});

app.post('/api/scans', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { patientRef, scanName, scanUrl, predictedClass, confidence, allScores, slicePlane, heatmapType, clinicalNotes } = req.body;

    if (!patientRef || !predictedClass || !confidence) {
      return res.status(400).json({ error: 'Patient reference ID, prediction class, and confidence are required.' });
    }

    const saved = await addScanHistory(userId, {
      patientRef,
      scanName: scanName || 'Axial T1w-CE DICOM',
      scanUrl,
      predictedClass,
      confidence,
      allScores,
      slicePlane,
      heatmapType,
      clinicalNotes,
    });

    await logSecurityAudit(userId, 'SCAN_SAVED', req.ip, `Patient: ${patientRef}, Class: ${predictedClass}`);

    return res.status(201).json({ success: true, scan: saved });
  } catch (err: any) {
    console.error('Error in /api/scans save:', err);
    return res.status(500).json({ error: err.message || 'Failed to persist scan history in Cloud SQL.' });
  }
});

app.delete('/api/scans/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const scanId = parseInt(req.params.id, 10);
    if (isNaN(scanId)) {
      return res.status(400).json({ error: 'Invalid scan ID.' });
    }

    await deleteScanHistory(userId, scanId);
    await logSecurityAudit(userId, 'SCAN_DELETED', req.ip, `ScanId: ${scanId}`);
    return res.json({ success: true, message: 'Scan history record removed.' });
  } catch (err: any) {
    console.error('Error in /api/scans delete:', err);
    return res.status(500).json({ error: err.message || 'Failed to remove scan record.' });
  }
});

// ============================================================================
// 5. FRONTEND MIDDLEWARE & STATIC SERVING
// ============================================================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏥 NeuroClass PACS CADx Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting NeuroClass server:', err);
  process.exit(1);
});
