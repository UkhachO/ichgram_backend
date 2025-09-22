import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export const signToken = (payload, options = {}) =>
  jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpires,
    ...options,
  });

export const verifyToken = (token) => jwt.verify(token, config.jwtSecret);
