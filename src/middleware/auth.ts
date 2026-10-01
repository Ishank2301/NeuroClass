import { Request, Response, NextFunction } from 'express';
import { getSessionUser } from '../db/users.ts';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthenticatedUser {
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

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  sessionToken?: string;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Check HTTP-only cookie first (High Security Cookie standard)
    let token = (req as any).cookies?.nc_session_token;

    // 2. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1].trim();
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    // Try verifying as SQL user session token first
    const sessionUser = await getSessionUser(token);
    if (sessionUser) {
      req.user = {
        id: sessionUser.id,
        uid: sessionUser.uid,
        username: sessionUser.username,
        email: sessionUser.email,
        phoneNumber: sessionUser.phoneNumber,
        displayName: sessionUser.displayName,
        avatarUrl: sessionUser.avatarUrl,
        role: sessionUser.role,
        provider: sessionUser.provider,
      };
      req.sessionToken = token;
      return next();
    }

    // Try verifying as Firebase ID token
    try {
      const decodedFirebase = await adminAuth.verifyIdToken(token);
      if (decodedFirebase) {
        // Find matching SQL user record
        const matchingUsers = await db.select().from(users).where(eq(users.uid, decodedFirebase.uid)).limit(1);
        if (matchingUsers.length > 0) {
          const u = matchingUsers[0];
          req.user = {
            id: u.id,
            uid: u.uid,
            username: u.username,
            email: u.email,
            phoneNumber: u.phoneNumber,
            displayName: u.displayName,
            avatarUrl: u.avatarUrl,
            role: u.role,
            provider: u.provider,
          };
          return next();
        }
      }
    } catch {
      // Fallthrough if not a valid Firebase ID token
    }

    return res.status(401).json({ error: 'Unauthorized: Session has expired or is invalid.' });
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(401).json({ error: 'Unauthorized: Failed to authenticate session.' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token = (req as any).cookies?.nc_session_token;
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1].trim();
    }

    if (token) {
      const sessionUser = await getSessionUser(token);
      if (sessionUser) {
        req.user = {
          id: sessionUser.id,
          uid: sessionUser.uid,
          username: sessionUser.username,
          email: sessionUser.email,
          phoneNumber: sessionUser.phoneNumber,
          displayName: sessionUser.displayName,
          avatarUrl: sessionUser.avatarUrl,
          role: sessionUser.role,
          provider: sessionUser.provider,
        };
        req.sessionToken = token;
      }
    }
  } catch {
    // Non-blocking for optional authentication
  }
  next();
};
