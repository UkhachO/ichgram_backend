import HttpError from '../utils/HttpError.js';

const validateBody = (schema) => async (req, _res, next) => {
  try {
    const value = await schema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    req.body = value;
    next();
  } catch (e) {
    next(HttpError(400, e.message || 'Validation error'));
  }
};

export default validateBody;
