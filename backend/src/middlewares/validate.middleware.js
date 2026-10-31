import { AppError } from '../errors/AppError.js';

function toValidationError(error) {
  const messages = [
    ...new Set(error.details.map((detail) => detail.message)),
  ];

  return new AppError(400, messages.join('. '));
}

function runValidation(schema, source) {
  return schema.validate(source, {
    abortEarly: false,
    convert: true,
    stripUnknown: false,
  });
}

export function validate(schema) {
  return (req, _res, next) => {
    const { value, error } = runValidation(schema, req.body ?? {});

    if (error) {
      return next(toValidationError(error));
    }

    req.body = value;
    return next();
  };
}

// Express 5 expone req.query con un getter: no se puede reasignar. El valor
// validado queda en req.validatedQuery para que lo lea el controller.
export function validateQuery(schema) {
  return (req, _res, next) => {
    const { value, error } = runValidation(schema, req.query ?? {});

    if (error) {
      return next(toValidationError(error));
    }

    req.validatedQuery = value;
    return next();
  };
}
