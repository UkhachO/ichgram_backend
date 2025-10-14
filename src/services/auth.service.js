import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import User from '../db/models/User.js';
import HttpError from '../utils/HttpError.js';
import { signAccessToken } from '../utils/tokens.js';
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from './email.service.js';
import { generateVerifyToken, hashVerifyToken } from '../utils/verification.js';
import {
  generateResetTokenRaw,
  hashResetToken,
} from '../utils/resetPassword.js';

const CLIENT_URL =
  process.env.CLIENT_URL?.replace(/\/+$/, '') || 'http://localhost:5173';
const VERIFY_EXPIRES_HOURS = 24;

export async function registerUser({ email, fullName, username, password }) {
  const user = await User.create({ email, fullName, username, password });

  const rawToken = generateVerifyToken(32);
  const tokenHash = await hashVerifyToken(rawToken);

  user.verifyTokenHash = tokenHash;
  user.verifyTokenExpiresAt = new Date(
    Date.now() + VERIFY_EXPIRES_HOURS * 3600 * 1000
  );
  await user.save();

  const link = `${CLIENT_URL}/verify?id=${user._id}&token=${rawToken}`;

  await sendVerificationEmail({ to: user.email, link });

  return { id: user._id };
}

export async function verifyUserEmail({ id, token }) {
  const user = await User.findById(id);
  if (!user) throw new Error('User not found');

  if (user.isVerified) return { ok: true };

  if (!user.verifyTokenHash || !user.verifyTokenExpiresAt) {
    throw new Error('Verification token missing');
  }
  if (user.verifyTokenExpiresAt.getTime() < Date.now()) {
    throw new Error('Verification token expired');
  }

  const ok = await isVerifyTokenMatch(token, user.verifyTokenHash);
  if (!ok) throw new Error('Invalid verification token');

  user.isVerified = true;
  user.verifyTokenHash = null;
  user.verifyTokenExpiresAt = null;
  await user.save();

  return { ok: true };
}

export const login = async ({ emailOrUsername, password }) => {
  const key = String(emailOrUsername || '')
    .trim()
    .toLowerCase();
  const pass = String(password || '');

  const user = await User.findOne({
    $or: [{ email: key }, { username: key }],
  }).select('+password');

  console.log('DBG/login step1', { key, hasUser: !!user });

  if (!user) throw HttpError(401, 'Invalid credentials');

  const cmp = await bcrypt.compare(pass, user.password);
  console.log('DBG/login step2', { hashLen: user.password?.length, cmp });

  if (!cmp) throw HttpError(401, 'Invalid credentials');

  const accessToken = signAccessToken({ sub: user.id });

  return {
    accessToken,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
    },
  };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId)
    .select('_id fullName username email isVerified avatarUrl')
    .lean();
  if (!user) throw HttpError(404, 'User not found');
  return user;
};

export const forgotPassword = async (email) => {
  const APP_URL = (process.env.CLIENT_URL || 'http://localhost:5173').replace(
    /\/+$/,
    ''
  );

  const user = await User.findOne({
    email: String(email || '')
      .toLowerCase()
      .trim(),
  });
  if (!user) return;

  const raw = generateResetTokenRaw();
  const hash = hashResetToken(raw);

  user.resetPasswordTokenHash = hash;
  user.resetPasswordTokenExp = new Date(Date.now() + 60 * 60 * 1000);
  user.resetPasswordUsed = false;
  await user.save();

  const link = `${APP_URL}/auth/reset?token=${raw}`;

  await sendResetPasswordEmail({
    to: user.email,
    link,
    fullName: user.fullName || user.username,
  });
};

export const resetPassword = async ({ token, password }) => {
  if (!token) throw HttpError(400, 'Token required');

  const hash = hashResetToken(token);

  const user = await User.findOne({
    resetPasswordTokenHash: hash,
    resetPasswordTokenExp: { $gt: new Date() },
    resetPasswordUsed: false,
  });
  if (!user) throw HttpError(400, 'Invalid or expired token');

  user.password = String(password);

  user.resetPasswordTokenHash = null;
  user.resetPasswordTokenExp = null;
  user.resetPasswordUsed = true;
  user.passwordChangedAt = new Date();

  await user.save();
};
