import { AppError } from '../errors/AppError.js';

export function validate(schema) {
  return (req, _res, next) => {
    const { value, error } = schema.validate(req.body ?? {}, {
      abortEarly: false,
      convert: true,
      stripUnknown: false,
    });

    if (error) {
      const messages = [
        ...new Set(error.details.map((detail) => detail.message)),
      ];

      return next(new AppError(400, messages.join('. ')));
    }

    req.body = value;
    return next();
  };
}
