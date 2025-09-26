import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import User from '../db/models/User.js';
import Session from '../db/models/Session.js';
import HttpError from '../utils/HttpError.js';
import { signAccessToken } from '../utils/tokens.js';
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from './email.service.js';
import {
  generateVerifyToken,
  hashVerifyToken,
  isVerifyTokenMatch,
} from '../utils/verification.js';
import {
  generateResetTokenRaw,
  hashResetToken,
} from '../utils/resetPassword.js';

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TTL_MS = 60 * 60 * 1000; // 1h

export const register = async ({ fullName, username, email, password }) => {
  fullName = String(fullName).trim();
  username = String(username).toLowerCase().trim();
  email = String(email).toLowerCase().trim();

  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) throw HttpError(409, 'User already exists');

  const pwdHash = await bcrypt.hash(password, 10);

  const rawVerify = generateVerifyToken(32);
  const verifyTokenHash = await hashVerifyToken(rawVerify);
  const verifyTokenExpiresAt = new Date(Date.now() + VERIFY_TTL_MS);

  const user = await User.create({
    fullName,
    username,
    email,
    password: pwdHash,
    isVerified: false,
    verifyTokenHash,
    verifyTokenExpiresAt,
  });

  const appUrl =
    (process.env.APP_URL || '').replace(/\/+$/, '') || 'http://localhost:3000';
  const link = `${appUrl}/api/auth/verify/${rawVerify}`;
  await sendVerificationEmail({ to: email, link });

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
    },
    message: 'Registered. Verification email sent.',
  };
};

export const login = async ({ emailOrUsername, password, meta }) => {
  const user = await User.findOne({
    $or: [
      { email: emailOrUsername.toLowerCase() },
      { username: emailOrUsername.toLowerCase() },
    ],
  });
  if (!user) throw HttpError(401, 'Invalid credentials');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw HttpError(401, 'Invalid credentials');

  const tokenId = crypto.randomUUID();
  const token = signAccessToken({
    sub: user.id,
    tid: tokenId,
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await Session.create({
    userId: user.id,
    tokenId,
    expiresAt,
    ip: meta?.ip,
    userAgent: meta?.userAgent,
  });

  return {
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      avatarUrl: user.avatarUrl ?? null,
    },
  };
};

export const logout = async ({ userId, tokenId }) => {
  if (!userId || !tokenId) return { ok: true };
  await Session.deleteOne({ userId, tokenId });
  return { ok: true };
};

export const startPasswordReset = async (email) => {
  email = String(email).toLowerCase().trim();
  const user = await User.findOne({ email });
  if (!user) return { ok: true };

  const raw = generateResetTokenRaw();
  const hash = hashResetToken(raw);

  user.resetPasswordTokenHash = hash;
  user.resetPasswordTokenExp = new Date(Date.now() + RESET_TTL_MS);
  user.resetPasswordUsed = false;
  await user.save();

  const appUrl =
    (process.env.APP_URL || '').replace(/\/+$/, '') || 'http://localhost:3000';

  const link = `${appUrl}/reset-password?token=${raw}`;
  await sendResetPasswordEmail({ to: email, link });

  return { ok: true };
};

export const finishPasswordReset = async (rawToken, newPassword) => {
  const hash = hashResetToken(rawToken);

  const user = await User.findOne({
    resetPasswordTokenHash: hash,
    resetPasswordUsed: false,
    resetPasswordTokenExp: { $gt: new Date() },
  });

  if (!user) throw HttpError(400, 'Invalid or expired token');

  const pwdHash = await bcrypt.hash(newPassword, 10);
  user.password = pwdHash;

  user.passwordChangedAt = new Date();
  user.resetPasswordUsed = true;
  user.resetPasswordTokenHash = null;
  user.resetPasswordTokenExp = null;

  await user.save();

  return { ok: true };
};

export const finishEmailVerification = async (rawToken) => {

  const candidates = await User.find({
    isVerified: false,
    verifyTokenHash: { $ne: null },
    verifyTokenExpiresAt: { $gt: new Date() },
  });

  let user = null;
  for (const c of candidates) {
    const ok = await isVerifyTokenMatch(rawToken, c.verifyTokenHash);
    if (ok) {
      user = c;
      break;
    }
  }
  if (!user) return false;

  user.isVerified = true;
  user.verifyTokenHash = null;
  user.verifyTokenExpiresAt = null;
  await user.save();

  return true;
};
