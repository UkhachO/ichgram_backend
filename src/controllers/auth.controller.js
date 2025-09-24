import * as authService from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../schemas/auth.schemas.js';

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
    const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
    const data = await authService.login({ ...payload, meta });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

export const logout = async (req, res, next) => {
  try {
    const tid = req.user?.tid;
    await authService.logout({ userId: req.user?.sub, tid });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

export const me = async (req, res, next) => {
  try {
    const data = await authService.me(req.user?.sub);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};
