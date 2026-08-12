import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtUserPayload {
  userId: string;
  email: string;
  organizationId?: string;
  role?: string;
}

export function generateAccessToken(payload: JwtUserPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.Secret | number | any,
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function generateRefreshToken(payload: JwtUserPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.Secret | number | any,
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): JwtUserPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;
}

export function verifyRefreshToken(token: string): JwtUserPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtUserPayload;
}
