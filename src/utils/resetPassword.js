import crypto from 'node:crypto';

export const generateResetTokenRaw = () =>
  crypto.randomBytes(32).toString('hex');
export const hashResetToken = (raw) =>
  crypto.createHash('sha256').update(raw).digest('hex');

export default { generateResetTokenRaw, hashResetToken };
