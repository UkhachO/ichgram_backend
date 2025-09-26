import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schemas.js';
import * as authService from '../services/auth.service.js';
import User from '../db/models/User.js';
import HttpError from '../utils/HttpError.js';

export const register = async (req, res, next) => {
  try {
    const payload = await registerSchema.validateAsync(req.body, {
      abortEarly: false,
    });
    const data = await authService.register(payload);
    res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const payload = await loginSchema.validateAsync(req.body, {
      abortEarly: false,
    });
    const meta = { ip: req.ip, userAgent: req.get('user-agent') };
    const data = await authService.login({ ...payload, meta });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

export const logout = async (req, res, next) => {
  try {
    const tid = req.tokenPayload?.tid; 
    await authService.logout({ userId: req.user.id, tokenId: tid });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

export const me = async (req, res, next) => {
  try {
    const u = req.user;
    res.json({
      ok: true,
      user: {
        id: u.id,
        fullName: u.fullName,
        username: u.username,
        email: u.email,
        isVerified: u.isVerified,
        avatarUrl: u.avatarUrl ?? null,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    await forgotPasswordSchema.validateAsync(req.body, { abortEarly: false });
    await authService.startPasswordReset(req.body.email);
    res.json({ ok: true, message: 'If email exists, reset link was sent' });
  } catch (e) {
    next(e);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await resetPasswordSchema.validateAsync(req.body, { abortEarly: false });
    const { token, password } = req.body;
    await authService.finishPasswordReset(token, password);
    res.json({ ok: true, message: 'Password updated' });
  } catch (e) {
    next(e);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) throw HttpError(400, 'Token is required');

    const ok = await authService.finishEmailVerification(token);
    if (!ok) throw HttpError(400, 'Invalid or expired token');

    res.json({ ok: true, message: 'Email verified successfully' });
  } catch (e) {
    next(e);
  }
};
