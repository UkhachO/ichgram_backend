import Joi from 'joi';
import { objectIdSchema } from './shared.js';

export const listNotificationsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  unreadOnly: Joi.boolean().default(false),
});

export const markOneSchema = Joi.object({
  id: objectIdSchema.required(),
});
