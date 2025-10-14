import jwt from 'jsonwebtoken';
import HttpError from '../utils/HttpError.js';
import User from '../db/models/User.js';

const authenticate = async (req, _res, next) => {
  try {
    const cookieToken = req.cookies?.token || null;
    const auth = req.headers.authorization || '';
    const headerToken = auth.startsWith('Bearer ')
      ? auth.slice(7).trim()
      : null;

    const token = cookieToken || headerToken;
    if (!token) throw HttpError(401, 'Unauthorized');

    const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;
    if (!secret) throw HttpError(500, 'JWT secret is not set');

    const payload = jwt.verify(token, secret);

    const user = await User.findById(payload.sub).select(
      '_id username fullName role avatarUrl isVerified passwordChangedAt'
    );

    if (!user) throw HttpError(401, 'Unauthorized');

    if (user.passwordChangedAt) {
      const iatMs = (payload.iat ?? 0) * 1000;
      if (iatMs < new Date(user.passwordChangedAt).getTime()) {
        throw HttpError(401, 'Token invalidated');
      }
    }

    req.user = {
      id: String(user._id),
      sub: String(user._id),
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
    };

    next();
  } catch (e) {
    next(HttpError(401, 'Unauthorized'));
  }
};

export default authenticate;
