import Joi from 'joi';

export const createCommentSchema = Joi.object({
  text: Joi.string().trim().min(1).max(1000).required(),
});

export const listCommentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});
