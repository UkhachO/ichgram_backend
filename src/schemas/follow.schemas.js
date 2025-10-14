import Joi from 'joi';
import { objectIdSchema } from './shared.js';

export const targetUserParamSchema = Joi.object({
  userId: objectIdSchema.required(),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
