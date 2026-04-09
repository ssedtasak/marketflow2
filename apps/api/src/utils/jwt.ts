import { sign, verify } from 'hono/jwt';
import type { Env } from '../index';

/**
 * Sign a JWT payload with the JWT_SECRET from bindings.
 * Returns a signed JWT string.
 */
export async function signJwt(payload: Record<string, unknown>, env: Env): Promise<string> {
  return sign(payload, env.JWT_SECRET);
}

/**
 * Verify and decode a JWT string using JWT_SECRET from bindings.
 * Throws if invalid or expired.
 */
export async function verifyJwt(token: string, env: Env): Promise<Record<string, unknown>> {
  return (await verify(token, env.JWT_SECRET, 'HS256')) as Record<string, unknown>;
}
