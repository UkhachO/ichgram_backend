import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token)
      return res.status(401).json({ ok: false, message: 'No token provided' });

    const payload = verifyToken(token);
    const user = await User.findById(payload.id);
    if (!user)
      return res.status(401).json({ ok: false, message: 'User not found' });

    req.user = user;
    next();
  } catch (_e) {
    return res.status(401).json({ ok: false, message: 'Invalid token' });
  }
};
