import Joi from 'joi';

const usernameRe = /^[a-z0-9_]+$/;

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  fullName: Joi.string().min(2).max(100).required(), // camelCase!
  username: Joi.string().min(3).max(50).regex(usernameRe).required(),
  password: Joi.string().min(8).max(128).required(),
})
.rename('fullname', 'fullName', {
  ignoreUndefined: true,
  override: true,
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim(),
  username: Joi.string().min(3).max(50).trim(),
  password: Joi.string().min(6).required(),
})
  .xor('email', 'username') 
  .messages({
    'object.missing': 'Either email or username is required',
    'any.required': 'Email/username and password are required',
  });

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).max(128).required(),
});
