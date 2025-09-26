import { verifyAccessToken } from '../utils/tokens.js';
import HttpError from '../utils/HttpError.js';
import User from '../db/models/User.js';

const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw HttpError(401, 'Unauthorized');

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user) throw HttpError(401, 'Unauthorized');

    if (
      user.passwordChangedAt &&
      payload.iat * 1000 < new Date(user.passwordChangedAt).getTime()
    ) {
      throw HttpError(401, 'Token invalidated');
    }

    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch (e) {
    next(HttpError(401, 'Unauthorized'));
  }
};

export default authenticate;
