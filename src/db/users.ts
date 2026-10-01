import { db } from './index.ts';
import {
  users,
  userSessions,
  otpCodes,
  scanHistory,
  securityAuditLogs,
  userPreferences,
} from './schema.ts';
import { eq, or, and, desc, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// ============================================================================
// 1. USER AUTHENTICATION & PROFILE REPOSITORY
// ============================================================================

export async function getOrCreateUserByFirebase(
  uid: string,
  email: string | null,
  displayName: string | null,
  avatarUrl: string | null,
  provider: string = 'google'
) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(users)
        .set({
          displayName: displayName || existing[0].displayName,
          avatarUrl: avatarUrl || existing[0].avatarUrl,
          email: email || existing[0].email,
          updatedAt: new Date(),
        })
        .where(eq(users.uid, uid))
        .returning();
      return updated[0];
    }

    // Generate a fallback clean username if not present
    const baseUsername = email ? email.split('@')[0] : `user_${uid.slice(0, 8)}`;
    let username = baseUsername;
    const existingUsername = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUsername.length > 0) {
      username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const [newUser] = await db
      .insert(users)
      .values({
        uid,
        email: email || null,
        username,
        displayName: displayName || username,
        avatarUrl: avatarUrl || null,
        provider,
        isVerified: true,
        role: 'clinician',
      })
      .returning();

    // Default user preferences
    await db
      .insert(userPreferences)
      .values({
        userId: newUser.id,
        cookieConsent: 'all',
        cookieAnalytics: true,
        cookieMarketing: false,
        hipaaConsentAccepted: true,
        theme: 'dark',
      })
      .onConflictDoNothing();

    return newUser;
  } catch (error) {
    console.error('Error in getOrCreateUserByFirebase:', error);
    throw new Error('Failed to synchronize user account.');
  }
}

export async function findUserByIdentifier(identifier: string) {
  try {
    const cleanId = identifier.trim().toLowerCase();
    const rows = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, cleanId),
          eq(users.username, cleanId),
          eq(users.phoneNumber, cleanId)
        )
      )
      .limit(1);

    return rows[0] || null;
  } catch (error) {
    console.error('Error finding user by identifier:', error);
    throw new Error('Database lookup failed.');
  }
}

export async function createUserWithCredentials({
  username,
  email,
  phoneNumber,
  password,
  displayName,
  role = 'clinician',
}: {
  username: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  displayName?: string;
  role?: string;
}) {
  try {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanPhone = phoneNumber ? phoneNumber.trim() : null;

    // Check existing duplicates
    const conditions = [eq(users.username, cleanUsername)];
    if (cleanEmail) conditions.push(eq(users.email, cleanEmail));
    if (cleanPhone) conditions.push(eq(users.phoneNumber, cleanPhone));

    const existing = await db
      .select()
      .from(users)
      .where(or(...conditions))
      .limit(1);

    if (existing.length > 0) {
      if (existing[0].username === cleanUsername) throw new Error('Account name (username) is already taken.');
      if (cleanEmail && existing[0].email === cleanEmail) throw new Error('Email address is already registered.');
      if (cleanPhone && existing[0].phoneNumber === cleanPhone) throw new Error('Phone number is already registered.');
    }

    let passwordHash: string | null = null;
    if (password) {
      const salt = await bcrypt.genSalt(12);
      passwordHash = await bcrypt.hash(password, salt);
    }

    const uid = `nc_${crypto.randomUUID()}`;
    const [newUser] = await db
      .insert(users)
      .values({
        uid,
        username: cleanUsername,
        email: cleanEmail,
        phoneNumber: cleanPhone,
        passwordHash,
        displayName: displayName || cleanUsername,
        provider: cleanPhone && !passwordHash ? 'phone' : 'credentials',
        isVerified: true,
        role,
      })
      .returning();

    // Initialize security & cookies preferences
    await db
      .insert(userPreferences)
      .values({
        userId: newUser.id,
        cookieConsent: 'all',
        cookieAnalytics: true,
        cookieMarketing: false,
        hipaaConsentAccepted: true,
        theme: 'dark',
      })
      .onConflictDoNothing();

    return newUser;
  } catch (error: any) {
    console.error('Error creating user with credentials:', error);
    throw new Error(error.message || 'Failed to create user account.');
  }
}

export async function verifyUserPassword(identifier: string, plainPassword: string) {
  try {
    const user = await findUserByIdentifier(identifier);
    if (!user || !user.passwordHash) {
      return null;
    }

    const isValid = await bcrypt.compare(plainPassword, user.passwordHash);
    if (!isValid) return null;

    return user;
  } catch (error) {
    console.error('Error verifying user password:', error);
    throw new Error('Authentication validation failed.');
  }
}

// ============================================================================
// 2. SESSION TOKENS (HTTP-Only Secure Cookie Session Layer)
// ============================================================================

export async function createSession(userId: number, ipAddress?: string, userAgent?: string) {
  try {
    const token = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30-day session

    const [session] = await db
      .insert(userSessions)
      .values({
        userId,
        token,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        expiresAt,
      })
      .returning();

    return { token: session.token, expiresAt: session.expiresAt };
  } catch (error) {
    console.error('Error creating user session:', error);
    throw new Error('Failed to create session.');
  }
}

export async function getSessionUser(token: string) {
  try {
    const rows = await db
      .select({
        user: users,
        session: userSessions,
      })
      .from(userSessions)
      .innerJoin(users, eq(userSessions.userId, users.id))
      .where(
        and(
          eq(userSessions.token, token),
          gt(userSessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (rows.length === 0) return null;
    return rows[0].user;
  } catch (error) {
    console.error('Error getting session user:', error);
    return null;
  }
}

export async function revokeSession(token: string) {
  try {
    await db.delete(userSessions).where(eq(userSessions.token, token));
  } catch (error) {
    console.error('Error revoking session:', error);
  }
}

// ============================================================================
// 3. OTP VERIFICATION (Phone and Email Signups)
// ============================================================================

export async function createOtp(target: string, purpose: string = 'signup') {
  try {
    const cleanTarget = target.trim();
    // Generate secure 6-digit numeric OTP code
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    // Invalidate old unverified OTPs for this target
    await db.delete(otpCodes).where(eq(otpCodes.target, cleanTarget));

    const [otpRecord] = await db
      .insert(otpCodes)
      .values({
        target: cleanTarget,
        code,
        purpose,
        expiresAt,
        attempts: 0,
      })
      .returning();

    return otpRecord;
  } catch (error) {
    console.error('Error creating OTP:', error);
    throw new Error('Failed to generate verification OTP code.');
  }
}

export async function verifyOtp(target: string, code: string, purpose: string = 'signup') {
  try {
    const cleanTarget = target.trim();
    const cleanCode = code.trim();

    const records = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.target, cleanTarget),
          eq(otpCodes.purpose, purpose)
        )
      )
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    if (records.length === 0) {
      return { success: false, message: 'No active OTP verification code found. Please request a new code.' };
    }

    const record = records[0];

    if (new Date() > record.expiresAt) {
      return { success: false, message: 'OTP verification code has expired. Please request a fresh code.' };
    }

    if (record.attempts >= 5) {
      return { success: false, message: 'Too many incorrect attempts. Please request a new code.' };
    }

    if (record.code !== cleanCode) {
      await db
        .update(otpCodes)
        .set({ attempts: record.attempts + 1 })
        .where(eq(otpCodes.id, record.id));
      return { success: false, message: 'Invalid OTP code. Please check and try again.' };
    }

    // Mark as verified
    await db
      .update(otpCodes)
      .set({ verifiedAt: new Date() })
      .where(eq(otpCodes.id, record.id));

    return { success: true, message: 'OTP code verified successfully.' };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('OTP verification system error.');
  }
}

// ============================================================================
// 4. SCAN HISTORY & CLINICAL PERSISTENCE
// ============================================================================

export async function getUserScanHistory(userId: number) {
  try {
    return await db
      .select()
      .from(scanHistory)
      .where(eq(scanHistory.userId, userId))
      .orderBy(desc(scanHistory.createdAt))
      .limit(50);
  } catch (error) {
    console.error('Error fetching scan history:', error);
    throw new Error('Failed to retrieve patient scan diagnostic history.');
  }
}

export async function addScanHistory(
  userId: number,
  data: {
    patientRef: string;
    scanName: string;
    scanUrl?: string;
    predictedClass: string;
    confidence: string;
    allScores?: Record<string, number>;
    slicePlane?: string;
    heatmapType?: string;
    clinicalNotes?: string;
  }
) {
  try {
    const [record] = await db
      .insert(scanHistory)
      .values({
        userId,
        patientRef: data.patientRef,
        scanName: data.scanName,
        scanUrl: data.scanUrl || null,
        predictedClass: data.predictedClass,
        confidence: data.confidence,
        allScores: data.allScores ? JSON.stringify(data.allScores) : null,
        slicePlane: data.slicePlane || 'Axial T1-CE',
        heatmapType: data.heatmapType || 'Grad-CAM++',
        clinicalNotes: data.clinicalNotes || null,
        status: 'verified',
      })
      .returning();

    return record;
  } catch (error) {
    console.error('Error saving scan history to SQL:', error);
    throw new Error('Failed to persist scan diagnosis in Cloud SQL.');
  }
}

export async function deleteScanHistory(userId: number, scanId: number) {
  try {
    await db
      .delete(scanHistory)
      .where(and(eq(scanHistory.id, scanId), eq(scanHistory.userId, userId)));
    return true;
  } catch (error) {
    console.error('Error deleting scan history:', error);
    throw new Error('Failed to delete scan record.');
  }
}

// ============================================================================
// 5. USER PREFERENCES, COOKIES & SECURITY LOGS
// ============================================================================

export async function getUserPreferences(userId: number) {
  try {
    const records = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (records.length > 0) return records[0];

    const [created] = await db
      .insert(userPreferences)
      .values({
        userId,
        cookieConsent: 'all',
        cookieAnalytics: true,
        cookieMarketing: false,
        hipaaConsentAccepted: true,
        theme: 'dark',
      })
      .returning();
    return created;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
}

export async function updateUserPreferences(
  userId: number,
  prefs: Partial<{
    cookieConsent: string;
    cookieAnalytics: boolean;
    cookieMarketing: boolean;
    hipaaConsentAccepted: boolean;
    dataRetentionMonths: number;
    twoFactorEnabled: boolean;
    theme: string;
  }>
) {
  try {
    const [updated] = await db
      .update(userPreferences)
      .set({
        ...prefs,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, userId))
      .returning();

    return updated;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw new Error('Failed to update privacy preferences.');
  }
}

export async function logSecurityAudit(userId: number | null, action: string, ipAddress?: string, details?: string) {
  try {
    await db.insert(securityAuditLogs).values({
      userId,
      action,
      ipAddress: ipAddress || null,
      details: details || null,
    });
  } catch (error) {
    console.warn('Failed to record security audit log:', error);
  }
}
