import Joi from 'joi';

export const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).trim().required(),
  username: Joi.string().alphanum().min(3).max(30).trim().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('user', 'admin').optional(),
});

export const loginSchema = Joi.object({
  emailOrUsername: Joi.string().min(3).max(100).required(),
  password: Joi.string().min(8).required(),
});

export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    const details = error.details.map((d) => ({
      message: d.message,
      path: d.path,
    }));
    return res
      .status(400)
      .json({ ok: false, message: 'Validation error', details });
  }
  req.body = value;
  next();
};
