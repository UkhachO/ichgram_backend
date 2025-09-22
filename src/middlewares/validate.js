import { fail } from '../utils/respond.js';

export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const details = error.details.map((d) => ({
      path: d.path.join('.'),
      message: d.message,
      type: d.type,
    }));
    return fail(res, 400, 'Validation error', details);
  }

  req.body = value;
  next();
};
