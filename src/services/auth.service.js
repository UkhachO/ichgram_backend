import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import User from '../db/models/User.js';
import Session from '../db/models/Session.js';
import HttpError from '../utils/HttpError.js';
import { signAccessToken } from '../utils/tokens.js';

export const register = async ({ fullName, username, email, password }) => {
  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) throw HttpError(400, 'User already exists');

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName, username, email, password: hash });

  return { id: user.id, email: user.email, username: user.username };
};

export const login = async ({ emailOrUsername, password, meta }) => {
  const user = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  });
  if (!user) throw HttpError(401, 'Invalid credentials');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw HttpError(401, 'Invalid credentials');

  const tokenId = crypto.randomUUID();
  const token = signAccessToken({
    sub: user.id,
    tid: tokenId,
    role: user.role,
  });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await Session.create({ userId: user.id, tokenId, expiresAt, ...meta });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  };
};

export const logout = async ({ userId, tid }) => {
  if (!tid) return { ok: true };
  await Session.deleteOne({ userId, tokenId: tid });
  return { ok: true };
};

export const me = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw HttpError(404, 'User not found');
  return user;
};
