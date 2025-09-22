import { signToken } from '../utils/jwt.js';
import { findByEmailOrUsername, createUser } from '../services/auth.service.js';
import { ok, created, fail } from '../utils/respond.js';
import User from '../models/User.js';

export const register = async (req, res, next) => {
  try {
    const { fullName, username, email, password, role } = req.body;

    const exists = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });
    if (exists) return fail(res, 409, 'User already exists');

    const user = await createUser({
      fullName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role: role ?? 'user',
    });

    const token = signToken({ id: user._id.toString() });
    return created(res, {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await findByEmailOrUsername(
      (emailOrUsername || '').toLowerCase()
    );
    if (!user) return fail(res, 401, 'Invalid credentials');

    const match = await user.comparePassword(password);
    if (!match) return fail(res, 401, 'Invalid credentials');

    const token = signToken({ id: user._id.toString() });
    return ok(res, {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const me = async (req, res) => ok(res, { user: req.user });
