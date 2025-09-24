import HttpError from '../utils/HttpError.js';

const checkRole =
  (roles = []) =>
  (req, _res, next) => {
    const role = req.user?.role;
    if (!role || (roles.length && !roles.includes(role))) {
      return next(HttpError(403, 'Forbidden'));
    }
    next();
  };

export default checkRole;
