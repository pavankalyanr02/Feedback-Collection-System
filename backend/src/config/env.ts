import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  DATABASE_URL: z
    .string()
    .default('postgresql://postgres:postgres@localhost:5432/feedback_db?schema=public'),
  JWT_SECRET: z.string().default('default_jwt_secret_key_feedback_2026'),
  JWT_REFRESH_SECRET: z.string().default('default_jwt_refresh_secret_key_feedback_2026'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.string().default('10').transform((val) => parseInt(val, 10)),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.string().default('info'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment configuration');
}

if (_env.data.NODE_ENV === 'production') {
  if (
    _env.data.JWT_SECRET === 'default_jwt_secret_key_feedback_2026' ||
    _env.data.JWT_REFRESH_SECRET === 'default_jwt_refresh_secret_key_feedback_2026'
  ) {
    console.warn(
      '⚠️ WARNING: Running in production mode with default JWT secrets! Please set JWT_SECRET and JWT_REFRESH_SECRET environment variables.'
    );
  }
}

export const env = _env.data;

