import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schemas.js';
import validateBody from '../decorators/validateBody.js';
import * as authService from '../services/auth.service.js';
import User from '../db/models/User.js';
import { isVerifyTokenMatch } from '../utils/verification.js';
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
    const { token, user } = await authService.login({
      ...payload,
      meta: { ip: req.ip, userAgent: req.headers['user-agent'] },
    });
    res.json({ ok: true, token, user });
  } catch (e) {
    next(e);
  }
};

export const logout = async (req, res, next) => {
  try {
    const tid = req.tokenPayload?.tid;
    await authService.logout({ userId: req.user.id, tid });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await authService.me(req.user.id);
    res.json({ ok: true, user });
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

    const candidates = await User.find({
      isVerified: false,
      verifyTokenHash: { $ne: null },
      verifyTokenExpiresAt: { $gt: new Date() },
    }).limit(100);

    let user = null;
    for (const c of candidates) {
      const ok = await isVerifyTokenMatch(token, c.verifyTokenHash);
      if (ok) {
        user = c;
        break;
      }
    }

    if (!user) throw HttpError(400, 'Invalid or expired token');

    user.isVerified = true;
    user.verifyTokenHash = null;
    user.verifyTokenExpiresAt = null;
    await user.save();

    res.json({ ok: true, message: 'Email verified successfully' });
    
  } catch (e) {
    next(e);
  }
};