import 'dotenv/config';
import path from 'path';
import fs from 'fs';

const resolvedUploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '..', 'uploads');

try {
  fs.mkdirSync(resolvedUploadDir, { recursive: true });
} catch {
  // ignore
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'development-only-secret-change-me',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  uploadDir: resolvedUploadDir,
  aiProvider: process.env.AI_PROVIDER ?? 'unconfigured',
  aiApiUrl: process.env.AI_API_URL ?? '',
  aiApiKey: process.env.AI_API_KEY ?? '',
  aiModel: process.env.AI_MODEL ?? '',
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS ?? 15000),
  aiRetries: Number(process.env.AI_RETRIES ?? 2),
  aiConfidenceThreshold: Number(process.env.AI_CONFIDENCE_THRESHOLD ?? 0.75),
};
if (process.env.NODE_ENV === 'production' && config.jwtSecret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters in production');
