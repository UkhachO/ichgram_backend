import jwt from 'jsonwebtoken';
import HttpError from '../utils/HttpError.js';

const { JWT_SECRET = 'dev_secret' } = process.env;

const authGuard = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return next(HttpError(401, 'Unauthorized'));

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    next(HttpError(401, 'Unauthorized'));
  }
};

export default authGuard;
