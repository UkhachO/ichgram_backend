import Joi from 'joi';

export const sendMessageSchema = Joi.object({
  text: Joi.string().min(1).max(2000).required(),
});

export const listDialogSchema = Joi.object({
  limit: Joi.number().min(1).max(100).default(30),
  before: Joi.date().iso(),
});
