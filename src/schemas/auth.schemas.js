import Joi from 'joi';

export const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  username: Joi.string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9_]+$/)
    .required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

export const loginSchema = Joi.object({
  emailOrUsername: Joi.string().required(),
  password: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).max(128).required(),
});
