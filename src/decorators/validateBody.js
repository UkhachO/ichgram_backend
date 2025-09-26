import HttpError from '../utils/HttpError.js';

const validateBody = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    return next(HttpError(400, 'Validation error'));
  }
  req.body = value;
  next();
};

export default validateBody;
