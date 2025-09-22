import User from '../models/User.js';

export const findByEmailOrUsername = (emailOrUsername) => {
  const value = (emailOrUsername || '').toLowerCase();
  return User.findOne({ $or: [{ email: value }, { username: value }] });
};

export const createUser = (payload) => {
  const user = new User(payload);
  return user.save();
};
