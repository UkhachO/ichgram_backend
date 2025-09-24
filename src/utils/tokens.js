import jwt from 'jsonwebtoken';

const { JWT_SECRET = 'dev_secret', JWT_EXPIRES = '7d' } = process.env;

export const signAccessToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

export const verifyAnyToken = (token) => jwt.verify(token, JWT_SECRET);
