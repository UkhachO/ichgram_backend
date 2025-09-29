import * as userService from '../services/user.service.js';
import { searchUsersSchema } from '../schemas/user.schemas.js';

export const searchUsers = async (req, res, next) => {
  try {
    const payload = await searchUsersSchema.validateAsync(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    const data = await userService.searchUsers(payload);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};
