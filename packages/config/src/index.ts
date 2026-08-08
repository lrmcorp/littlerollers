export type RuntimeEnvironment = 'development' | 'test' | 'production';

export interface RuntimeConfig {
  environment: RuntimeEnvironment;
  port: number;
  databaseUrl: string;
  redisUrl: string | null;
  healthProbeTimeoutMs: number;
  workerHeartbeatIntervalMs: number;
  workerHeartbeatTtlSeconds: number;
  quotaEvaluation: {
    syntheticEnabled: boolean;
    pollIntervalMs: number;
    leaseMs: number;
    maxAttempts: number;
    backoffMs: number;
  };
  booking: {
    enabled: boolean;
    cutoffHours: number | null;
  };
  reschedule: {
    enabled: boolean;
    cutoffHours: number | null;
  };
  bookingCancellation: {
    enabled: boolean;
    cutoffHours: number | null;
  };
  mobileFeatures: {
    accountRecovery: boolean;
    revokeAllSessions: boolean;
    customerCheckIn: boolean;
    instructorCheckIn: boolean;
  };
  sessionAdjustment: {
    enabled: boolean;
  };
  rbac: {
    policySource: 'static' | 'shadow' | 'database';
    managementEnabled: boolean;
  };
  identityReview: {
    enabled: boolean;
  };
  privateUploads: {
    driver: 'local';
    root: string;
    maxBytes: number;
    viewAuthorizationTtlSeconds: number;
    retentionDays: number;
  };
  paymentProof: {
    maxBytes: number;
    scanDriver: 'synthetic' | 'clamav';
    syntheticResult: 'CLEAN' | 'REJECTED';
    clamAvHost: string | null;
    clamAvPort: number;
    scanTimeoutMs: number;
    abandonedUploadTtlMinutes: number;
  };
  publicSupportWhatsappE164: string | null;
  email: {
    driver: 'smtp' | 'resend';
    deliveryEnabled: boolean;
    smtpHost: string | null;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser: string | null;
    smtpPassword: string | null;
    fromName: string;
    fromEmail: string | null;
    connectionTimeoutMs: number;
    maxAttempts: number;
    rateLimitPerMinute: number;
    rateLimitPerHour: number;
    encryptionKey: string | null;
    resendApiKey: string | null;
    recipientOverride: string | null;
  };
}

const required = (env: NodeJS.ProcessEnv, key: string): string => {
  const value = env[key]?.trim();
  if (!value) throw new Error(`CONFIGURATION_MISSING:${key}`);
  return value;
};

export function loadRuntimeConfig(env: NodeJS.ProcessEnv): RuntimeConfig {
  const environment = (env.NODE_ENV ?? 'development') as RuntimeEnvironment;
  if (!['development', 'test', 'production'].includes(environment))
    throw new Error('CONFIGURATION_INVALID:NODE_ENV');
  const port = Number(env.PORT ?? '3001');
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('CONFIGURATION_INVALID:PORT');
  const positiveInteger = (key: string): number => {
    const value = Number(required(env, key));
    if (!Number.isInteger(value) || value < 1) throw new Error(`CONFIGURATION_INVALID:${key}`);
    return value;
  };
  const bookingEnabled =
    env.BOOKING_ENABLED?.trim() === 'true' ||
    (environment !== 'production' && env.BOOKING_SYNTHETIC_ENABLED === 'true');
  const bookingCutoffValue =
    env.BOOKING_CUTOFF_HOURS?.trim() ||
    (environment !== 'production' ? env.BOOKING_SYNTHETIC_CUTOFF_HOURS?.trim() : undefined);
  const bookingCutoffHours = bookingCutoffValue ? Number(bookingCutoffValue) : null;
  if (
    bookingCutoffHours !== null &&
    (!Number.isInteger(bookingCutoffHours) || bookingCutoffHours < 1)
  )
    throw new Error('CONFIGURATION_INVALID:BOOKING_CUTOFF_HOURS');
  const rescheduleEnabled =
    env.RESCHEDULE_ENABLED?.trim() === 'true' ||
    (environment !== 'production' && env.RESCHEDULE_SYNTHETIC_ENABLED === 'true');
  const rescheduleCutoffValue =
    env.RESCHEDULE_CUTOFF_HOURS?.trim() ||
    (environment !== 'production' ? env.RESCHEDULE_SYNTHETIC_CUTOFF_HOURS?.trim() : undefined);
  const rescheduleCutoffHours = rescheduleCutoffValue ? Number(rescheduleCutoffValue) : null;
  if (
    rescheduleCutoffHours !== null &&
    (!Number.isInteger(rescheduleCutoffHours) || rescheduleCutoffHours < 1)
  )
    throw new Error('CONFIGURATION_INVALID:RESCHEDULE_CUTOFF_HOURS');
  if (bookingEnabled && bookingCutoffHours === null)
    throw new Error('CONFIGURATION_MISSING:BOOKING_CUTOFF_HOURS');
  if (rescheduleEnabled && rescheduleCutoffHours === null)
    throw new Error('CONFIGURATION_MISSING:RESCHEDULE_CUTOFF_HOURS');
  const bookingCancellationEnabled = env.BOOKING_CANCELLATION_ENABLED?.trim() === 'true';
  const bookingCancellationCutoffValue = env.BOOKING_CANCELLATION_CUTOFF_HOURS?.trim();
  const bookingCancellationCutoffHours = bookingCancellationCutoffValue
    ? Number(bookingCancellationCutoffValue)
    : null;
  if (
    bookingCancellationCutoffHours !== null &&
    (!Number.isInteger(bookingCancellationCutoffHours) || bookingCancellationCutoffHours < 1)
  )
    throw new Error('CONFIGURATION_INVALID:BOOKING_CANCELLATION_CUTOFF_HOURS');
  if (bookingCancellationEnabled && bookingCancellationCutoffHours === null)
    throw new Error('CONFIGURATION_MISSING:BOOKING_CANCELLATION_CUTOFF_HOURS');
  const rbacPolicySource = env.RBAC_POLICY_SOURCE?.trim() || 'static';
  if (!['static', 'shadow', 'database'].includes(rbacPolicySource))
    throw new Error('CONFIGURATION_INVALID:RBAC_POLICY_SOURCE');
  const rbacManagementEnabled = env.RBAC_MANAGEMENT_ENABLED === 'true';
  if (rbacManagementEnabled && rbacPolicySource !== 'database')
    throw new Error('CONFIGURATION_INVALID:RBAC_MANAGEMENT_ENABLED');
  const privateUploadDriver = env.PRIVATE_UPLOAD_DRIVER?.trim() || 'local';
  if (privateUploadDriver !== 'local')
    throw new Error('CONFIGURATION_INVALID:PRIVATE_UPLOAD_DRIVER');
  const privateUploadRoot =
    env.PRIVATE_UPLOAD_ROOT?.trim() ||
    (environment === 'production'
      ? required(env, 'PRIVATE_UPLOAD_ROOT')
      : 'apps/api/.local-data/private');
  const configuredPositiveInteger = (key: string, fallback: number): number => {
    const raw = env[key]?.trim();
    if (!raw) return fallback;
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 1) throw new Error(`CONFIGURATION_INVALID:${key}`);
    return value;
  };
  const privateUploadMaxBytes = configuredPositiveInteger('PRIVATE_UPLOAD_MAX_BYTES', 8_000_000);
  if (privateUploadMaxBytes > 8_000_000)
    throw new Error('CONFIGURATION_INVALID:PRIVATE_UPLOAD_MAX_BYTES');
  const publicSupportWhatsappE164 = env.PUBLIC_SUPPORT_WHATSAPP_E164?.trim() || null;
  if (publicSupportWhatsappE164 && !/^\+[1-9]\d{7,14}$/.test(publicSupportWhatsappE164))
    throw new Error('CONFIGURATION_INVALID:PUBLIC_SUPPORT_WHATSAPP_E164');
  const paymentProofScanDriver =
    env.PAYMENT_PROOF_SCAN_DRIVER?.trim() ||
    (environment === 'production' ? 'clamav' : 'synthetic');
  if (!['synthetic', 'clamav'].includes(paymentProofScanDriver))
    throw new Error('CONFIGURATION_INVALID:PAYMENT_PROOF_SCAN_DRIVER');
  if (environment === 'production' && paymentProofScanDriver === 'synthetic')
    throw new Error('CONFIGURATION_INVALID:PAYMENT_PROOF_SCAN_DRIVER');
  const paymentProofSyntheticResult = env.PAYMENT_PROOF_SYNTHETIC_SCAN_RESULT?.trim() || 'CLEAN';
  if (!['CLEAN', 'REJECTED'].includes(paymentProofSyntheticResult))
    throw new Error('CONFIGURATION_INVALID:PAYMENT_PROOF_SYNTHETIC_SCAN_RESULT');
  const paymentProofClamAvHost = env.PAYMENT_PROOF_CLAMAV_HOST?.trim() || null;
  if (paymentProofScanDriver === 'clamav' && !paymentProofClamAvHost)
    throw new Error('CONFIGURATION_MISSING:PAYMENT_PROOF_CLAMAV_HOST');
  const emailDriver = env.EMAIL_DRIVER?.trim() || 'smtp';
  if (!['smtp', 'resend'].includes(emailDriver))
    throw new Error('CONFIGURATION_INVALID:EMAIL_DRIVER');
  const emailDeliveryEnabled = env.EMAIL_DELIVERY_ENABLED === 'true';
  const emailRecipientOverride = env.EMAIL_RECIPIENT_OVERRIDE?.trim() || null;
  if (environment === 'production' && emailRecipientOverride)
    throw new Error('CONFIGURATION_INVALID:EMAIL_RECIPIENT_OVERRIDE');
  const notificationEncryptionKey = env.NOTIFICATION_ENCRYPTION_KEY?.trim() || null;
  if (notificationEncryptionKey) {
    let bytes: Buffer;
    try {
      bytes = Buffer.from(notificationEncryptionKey, 'base64');
    } catch {
      throw new Error('CONFIGURATION_INVALID:NOTIFICATION_ENCRYPTION_KEY');
    }
    if (bytes.length !== 32) throw new Error('CONFIGURATION_INVALID:NOTIFICATION_ENCRYPTION_KEY');
  }
  const smtpHost = env.SMTP_HOST?.trim() || null;
  const smtpUser = env.SMTP_USER?.trim() || null;
  const smtpPassword = env.SMTP_PASSWORD?.trim() || null;
  const smtpFromEmail = env.SMTP_FROM_EMAIL?.trim() || null;
  const smtpFromName = env.SMTP_FROM_NAME?.trim() || 'Daily Dose Pilates';
  const resendApiKey = env.RESEND_API_KEY?.trim() || null;
  const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
  if (
    [smtpFromEmail, emailRecipientOverride].some(
      (value) => value && (!emailPattern.test(value) || /[\r\n]/.test(value)),
    ) ||
    (smtpHost && /[\r\n]/.test(smtpHost)) ||
    /[\r\n]/.test(smtpFromName)
  )
    throw new Error('CONFIGURATION_INVALID:EMAIL_HEADER');
  if (emailDeliveryEnabled) {
    if (!notificationEncryptionKey)
      throw new Error('CONFIGURATION_MISSING:NOTIFICATION_ENCRYPTION_KEY');
    if (!smtpFromEmail) throw new Error('CONFIGURATION_MISSING:SMTP_FROM_EMAIL');
    if (emailDriver === 'smtp' && (!smtpHost || !smtpUser || !smtpPassword))
      throw new Error('CONFIGURATION_MISSING:SMTP');
    if (emailDriver === 'resend' && !resendApiKey)
      throw new Error('CONFIGURATION_MISSING:RESEND_API_KEY');
  }
  return {
    environment,
    port,
    databaseUrl: required(env, 'DATABASE_URL'),
    redisUrl:
      env.REDIS_URL?.trim() || (environment === 'production' ? required(env, 'REDIS_URL') : null),
    healthProbeTimeoutMs: positiveInteger('HEALTH_PROBE_TIMEOUT_MS'),
    workerHeartbeatIntervalMs: positiveInteger('WORKER_HEARTBEAT_INTERVAL_MS'),
    workerHeartbeatTtlSeconds: positiveInteger('WORKER_HEARTBEAT_TTL_SECONDS'),
    quotaEvaluation: {
      syntheticEnabled:
        environment !== 'production' && env.QUOTA_EVALUATION_SYNTHETIC_ENABLED === 'true',
      pollIntervalMs: positiveInteger('QUOTA_EVALUATION_POLL_INTERVAL_MS'),
      leaseMs: positiveInteger('QUOTA_EVALUATION_LEASE_MS'),
      maxAttempts: positiveInteger('QUOTA_EVALUATION_MAX_ATTEMPTS'),
      backoffMs: positiveInteger('QUOTA_EVALUATION_BACKOFF_MS'),
    },
    booking: {
      enabled: bookingEnabled,
      cutoffHours: bookingCutoffHours,
    },
    reschedule: {
      enabled: rescheduleEnabled,
      cutoffHours: rescheduleCutoffHours,
    },
    bookingCancellation: {
      enabled: bookingCancellationEnabled,
      cutoffHours: bookingCancellationCutoffHours,
    },
    mobileFeatures: {
      accountRecovery: env.MOBILE_ACCOUNT_RECOVERY_ENABLED?.trim() === 'true',
      revokeAllSessions: env.MOBILE_REVOKE_ALL_SESSIONS_ENABLED?.trim() === 'true',
      customerCheckIn: env.MOBILE_CUSTOMER_CHECK_IN_ENABLED?.trim() === 'true',
      instructorCheckIn: env.MOBILE_INSTRUCTOR_CHECK_IN_ENABLED?.trim() === 'true',
    },
    sessionAdjustment: {
      enabled:
        env.SESSION_ADJUSTMENT_ENABLED?.trim() !== 'false' &&
        (environment !== 'production' || env.SESSION_ADJUSTMENT_ENABLED?.trim() === 'true'),
    },
    rbac: {
      policySource: rbacPolicySource as 'static' | 'shadow' | 'database',
      managementEnabled: rbacManagementEnabled,
    },
    identityReview: {
      enabled:
        env.IDENTITY_REVIEW_ENABLED?.trim() !== 'false' &&
        (environment !== 'production' || env.IDENTITY_REVIEW_ENABLED?.trim() === 'true'),
    },
    privateUploads: {
      driver: 'local',
      root: privateUploadRoot,
      maxBytes: privateUploadMaxBytes,
      viewAuthorizationTtlSeconds: configuredPositiveInteger('PRIVATE_VIEW_AUTH_TTL_SECONDS', 300),
      retentionDays: configuredPositiveInteger('IDENTITY_DOCUMENT_RETENTION_DAYS', 30),
    },
    paymentProof: {
      maxBytes: configuredPositiveInteger('PAYMENT_PROOF_MAX_BYTES', 10_000_000),
      scanDriver: paymentProofScanDriver as 'synthetic' | 'clamav',
      syntheticResult: paymentProofSyntheticResult as 'CLEAN' | 'REJECTED',
      clamAvHost: paymentProofClamAvHost,
      clamAvPort: configuredPositiveInteger('PAYMENT_PROOF_CLAMAV_PORT', 3310),
      scanTimeoutMs: configuredPositiveInteger('PAYMENT_PROOF_SCAN_TIMEOUT_MS', 15_000),
      abandonedUploadTtlMinutes: configuredPositiveInteger(
        'PAYMENT_PROOF_ABANDONED_TTL_MINUTES',
        60,
      ),
    },
    publicSupportWhatsappE164,
    email: {
      driver: emailDriver as 'smtp' | 'resend',
      deliveryEnabled: emailDeliveryEnabled,
      smtpHost,
      smtpPort: configuredPositiveInteger('SMTP_PORT', 465),
      smtpSecure: env.SMTP_SECURE?.trim() !== 'false',
      smtpUser,
      smtpPassword,
      fromName: smtpFromName,
      fromEmail: smtpFromEmail,
      connectionTimeoutMs: configuredPositiveInteger('SMTP_CONNECTION_TIMEOUT_MS', 15_000),
      maxAttempts: configuredPositiveInteger('SMTP_MAX_ATTEMPTS', 5),
      rateLimitPerMinute: configuredPositiveInteger('SMTP_RATE_LIMIT_PER_MINUTE', 3),
      rateLimitPerHour: configuredPositiveInteger('SMTP_RATE_LIMIT_PER_HOUR', 150),
      encryptionKey: notificationEncryptionKey,
      resendApiKey,
      recipientOverride: emailRecipientOverride,
    },
  };
}
