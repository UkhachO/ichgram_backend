import User from '../db/models/User.js';
import {
  generateVerifyToken,
  hashVerifyToken,
  isVerifyTokenMatch,
} from '../utils/verification.js';
import { sendVerificationEmail } from '../services/email.service.js';

const TTL_MS = 24 * 60 * 60 * 1000;

// POST /api/auth/verify/send  { email }
export const resend = async (req, res, next) => {
  try {
    const email = req.body?.email?.toLowerCase().trim();
    if (!email)
      return res.status(400).json({ ok: false, message: 'email is required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ ok: false, message: 'User not found' });
    if (user.isVerified)
      return res.json({ ok: true, message: 'Email already verified' });

    const raw = generateVerifyToken(32);
    const hash = await hashVerifyToken(raw);
    user.verifyTokenHash = hash;
    user.verifyTokenExpiresAt = new Date(Date.now() + TTL_MS);
    await user.save();

    const link = `${process.env.APP_URL}/api/auth/verify/${raw}`;
    await sendVerificationEmail({ to: user.email, link });

    res.json({ ok: true, message: 'Verification email sent' });
  } catch (e) {
    next(e);
  }
};

// GET /api/auth/verify/:token
export const verify = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token)
      return res.status(400).json({ ok: false, message: 'Token is required' });

    const user = await User.findOne({
      verifyTokenHash: { $ne: null },
      verifyTokenExpiresAt: { $gt: new Date() },
    });
    if (!user)
      return res
        .status(400)
        .json({ ok: false, message: 'Invalid or expired token' });

    const match = await isVerifyTokenMatch(token, user.verifyTokenHash);
    if (!match)
      return res.status(400).json({ ok: false, message: 'Invalid token' });

    user.isVerified = true;
    user.verifyTokenHash = null;
    user.verifyTokenExpiresAt = null;
    await user.save();

    res.json({ ok: true, message: 'Email verified successfully' });
    // або редірект:
    // return res.redirect((process.env.FRONTEND_URL || '/') + '/verify/success');
  } catch (e) {
    next(e);
  }
};
