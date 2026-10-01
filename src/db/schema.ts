import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table supporting Gmail, GitHub, Phone, and Username+Password credentials
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase UID or generated secure UUID
  username: text('username').unique(), // Account name
  email: text('email').unique(), // Primary email (Gmail or user email)
  phoneNumber: text('phone_number').unique(), // International formatted phone
  passwordHash: text('password_hash'), // Salted bcrypt hash
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  provider: text('provider').notNull().default('credentials'), // 'google' | 'github' | 'phone' | 'credentials'
  isVerified: boolean('is_verified').notNull().default(false),
  role: text('role').notNull().default('clinician'), // 'clinician' | 'radiologist' | 'researcher' | 'admin'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User session tokens for secure HTTP-only cookies
export const userSessions = pgTable('user_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// One-Time Passwords (OTP) table for phone & email verification
export const otpCodes = pgTable('otp_codes', {
  id: serial('id').primaryKey(),
  target: text('target').notNull(), // Phone number or email
  code: text('code').notNull(), // 6-digit verification code
  purpose: text('purpose').notNull().default('signup'), // 'signup' | 'login' | 'reset'
  attempts: integer('attempts').notNull().default(0),
  expiresAt: timestamp('expires_at').notNull(),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Patient MRI analysis scan history to persist diagnostics permanently in SQL
export const scanHistory = pgTable('scan_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  patientRef: text('patient_ref').notNull(), // e.g. NC-2026-9041
  scanName: text('scan_name').notNull(),
  scanUrl: text('scan_url'),
  predictedClass: text('predicted_class').notNull(), // Glioma, Meningioma, Pituitary, No Tumor
  confidence: text('confidence').notNull(), // e.g. 98.4%
  allScores: text('all_scores'), // JSON stringified class probabilities
  slicePlane: text('slice_plane'), // Axial, Coronal, Sagittal
  heatmapType: text('heatmap_type'), // Grad-CAM++, Score-CAM, etc.
  clinicalNotes: text('clinical_notes'),
  status: text('status').notNull().default('verified'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Security audit logging for immutable access tracing
export const securityAuditLogs = pgTable('security_audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(), // USER_SIGNUP, USER_LOGIN, OTP_VERIFIED, SCAN_ANALYZED, POLICY_ACCEPTED, etc.
  ipAddress: text('ip_address'),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
});

// User privacy, cookies consent, and security settings
export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  cookieConsent: text('cookie_consent').notNull().default('essential'), // 'all' | 'essential' | 'custom'
  cookieAnalytics: boolean('cookie_analytics').notNull().default(false),
  cookieMarketing: boolean('cookie_marketing').notNull().default(false),
  hipaaConsentAccepted: boolean('hipaa_consent_accepted').notNull().default(true),
  dataRetentionMonths: integer('data_retention_months').notNull().default(24),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  theme: text('theme').notNull().default('dark'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Drizzle ORM Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(userSessions),
  scanHistory: many(scanHistory),
  auditLogs: many(securityAuditLogs),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const scanHistoryRelations = relations(scanHistory, ({ one }) => ({
  user: one(users, {
    fields: [scanHistory.userId],
    references: [users.id],
  }),
}));

export const securityAuditLogsRelations = relations(securityAuditLogs, ({ one }) => ({
  user: one(users, {
    fields: [securityAuditLogs.userId],
    references: [users.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));
