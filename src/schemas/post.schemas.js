import Joi from 'joi';

export const createPostSchema = Joi.object({
  description: Joi.string().allow('').max(2200),
});

export const updatePostSchema = Joi.object({
  description: Joi.string().allow('').max(2200),
}).or('description');

export const listPostsSchema = Joi.object({
  author: Joi.string().hex().length(24),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
});
