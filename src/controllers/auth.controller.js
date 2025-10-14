import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schemas.js';
import User from '../db/models/User.js';
import {
  generateVerifyToken,
  hashVerifyToken,
  isVerifyTokenMatch,
} from '../utils/verification.js';
import * as authService from '../services/auth.service.js';
import HttpError from '../utils/HttpError.js';
import { sendVerificationEmail } from '../services/email.service.js';

const isProd = process.env.NODE_ENV === 'production';
const cookieOpts = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
};

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const VERIFY_TTL_MS = 60 * 60 * 1000;

export async function register(req, res, next) {
  try {
    const { email, fullName, username, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      fullName,
      username,
      password: passwordHash,
      isVerified: false,
    });

    const rawToken = generateVerifyToken();
    const tokenHash = await hashVerifyToken(rawToken);

    user.verifyTokenHash = tokenHash;
    user.verifyTokenExpiresAt = new Date(Date.now() + VERIFY_TTL_MS);
    await user.save({ validateBeforeSave: false });

    const link = `${CLIENT_URL.replace(/\/+$/, '')}/verify?id=${
      user.id
    }&token=${rawToken}`;
    await sendVerificationEmail({ to: email, link });

    return res.status(201).json({ ok: true, userId: user.id });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const id = req.query.id || req.params.id;
    const token = req.query.token || req.params.token;

    const respond = (ok, msg) => {
      const text = ok
        ? 'Verification successful.'
        : 'Verification failed or link expired.';
      res.status(ok ? 200 : 400).send(`
        <h1>${text}</h1>
        <p style="font-family:monospace">${msg}</p>
        <p><a href="/auth/login">Go to login</a></p>
      `);
    };

    if (!id || !token) {
      console.debug('[verifyEmail] missing params', {
        id,
        tokenPresent: !!token,
      });
      return respond(false, 'Missing id or token');
    }

    const user = await User.findById(id).lean(false);
    if (!user) {
      console.debug('[verifyEmail] no user by id', id);
      return respond(false, 'User not found');
    }

    if (!user.verifyTokenHash || !user.verifyTokenExpiresAt) {
      console.debug('[verifyEmail] token data absent', {
        hasHash: !!user.verifyTokenHash,
        hasExp: !!user.verifyTokenExpiresAt,
      });
      return respond(false, 'No active verification token');
    }

    const now = Date.now();
    const exp = user.verifyTokenExpiresAt.getTime();
    if (exp < now) {
      console.debug('[verifyEmail] token expired', {
        exp,
        now,
        diff: exp - now,
      });
      return respond(false, 'Token expired');
    }

    const isMatch = await isVerifyTokenMatch(token, user.verifyTokenHash);
    console.debug('[verifyEmail] compare', { isMatch });

    if (!isMatch) {
      return respond(false, 'Token mismatch');
    }

    user.isVerified = true;
    user.verifyTokenHash = null;
    user.verifyTokenExpiresAt = null;
    await user.save({ validateBeforeSave: false });

    return respond(true, 'OK');
  } catch (err) {
    next(err);
  }
}

export const login = async (req, res, next) => {
  try {
    console.log('LOGIN_BODY:', req.body);

    const { email: rawEmail, username: rawUsername, password } = req.body;
    if (!password || (!rawEmail && !rawUsername)) {
      throw HttpError(400, 'Email/username and password are required');
    }

    const email = rawEmail ? String(rawEmail).toLowerCase().trim() : null;
    const username = rawUsername ? String(rawUsername).trim() : null;

    const query = email ? { email } : { username };

    const user = await User.findOne(query).select(
      '+password +isVerified +passwordChangedAt +username +fullName +avatarUrl +role'
    );

    if (!user) {
      console.log('LOGIN_USER_NOT_FOUND for:', email || username);
      throw HttpError(401, 'Invalid credentials');
    }

    const ok = await user.isPasswordValid(password);
    if (!ok) throw HttpError(401, 'Invalid credentials');

    const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;
    if (!secret) throw HttpError(500, 'JWT secret is not set');

    const token = jwt.sign({ sub: String(user._id) }, secret, {
      expiresIn: '7d',
    });

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      ok: true,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const me = async (req, res, next) => {
  try {
    const profile = await authService.getMe(req.user.id);
    res.json({ ok: true, data: profile });
  } catch (e) {
    next(e);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken', cookieOpts);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = await forgotPasswordSchema.validateAsync(req.body, {
      abortEarly: false,
    });
    await authService.forgotPassword(email);
    res.json({ ok: true, message: 'Reset email sent' });
  } catch (e) {
    next(e);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const payload = await resetPasswordSchema.validateAsync(req.body, {
      abortEarly: false,
    });
    await authService.resetPassword(payload);
    res.json({ ok: true, message: 'Password updated' });
  } catch (e) {
    next(e);
  }
};
