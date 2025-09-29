import Joi from 'joi';

export const searchUsersSchema = Joi.object({
  q: Joi.string().trim().min(1).max(64).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
});
