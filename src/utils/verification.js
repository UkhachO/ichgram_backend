import crypto from 'node:crypto';
import bcrypt from 'bcrypt';

export function generateVerifyToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

export async function hashVerifyToken(rawToken) {
  const saltRounds = 10;
  return bcrypt.hash(rawToken, saltRounds);
}

export async function isVerifyTokenMatch(rawToken, tokenHash) {
  return bcrypt.compare(rawToken, tokenHash);
}
