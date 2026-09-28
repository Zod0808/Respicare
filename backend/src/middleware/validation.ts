import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validationResult, checkExact } from 'express-validator';
import { AppError } from '../utils/AppError';

// Middleware para validar requests con Joi
// `options` permite relajar allowUnknown/stripUnknown para payloads de terceros
// (p.ej. webhooks de proveedores SMS) cuya forma no controlamos.
export const validateRequest = (schema: Joi.ObjectSchema, options?: Joi.ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false, // Mostrar todos los errores
      stripUnknown: true, // Eliminar campos no definidos en el schema
      allowUnknown: false, // No permitir campos desconocidos
      ...options
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new AppError(`Datos de entrada inválidos: ${errorMessages.map(e => e.message).join(', ')}`, 400);
    }

    next();
  };
};

// Middleware para validar parámetros de query
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new AppError(`Parámetros de consulta inválidos: ${errorMessages.map(e => e.message).join(', ')}`, 400);
    }

    next();
  };
};

// Middleware para validar parámetros de ruta
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      throw new AppError(`Parámetros de ruta inválidos: ${errorMessages.map(e => e.message).join(', ')}`, 400);
    }

    next();
  };
};

// Rechaza cualquier campo del body no cubierto por los body() de express-validator
// que se hayan ejecutado antes en la misma cadena de middlewares. Debe colocarse
// después de los body()/param() de la ruta y antes de `validate`.
export const checkExactBody = checkExact(undefined, {
  locations: ['body'],
  message: 'Se encontraron campos no reconocidos en el cuerpo de la solicitud'
});

// Middleware para validar con express-validator
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.type === 'field' ? err.path : 'unknown',
      message: err.msg,
      value: err.type === 'field' ? err.value : undefined
    }));
    throw new AppError(`Datos de entrada inválidos: ${errorMessages.map(e => e.message).join(', ')}`, 400);
  }
  next();
};
