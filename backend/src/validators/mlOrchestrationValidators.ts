import Joi from 'joi';

export const startRLSessionSchema = Joi.object({
  envName: Joi.string().max(100),
  config: Joi.object().unknown(true),
  patientId: Joi.string()
});

export const trainRLSessionSchema = Joi.object({
  episodes: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .messages({
      'number.base': 'episodes debe ser un número entero',
      'number.min': 'episodes debe ser al menos 1',
      'number.max': 'episodes no puede exceder 10000'
    })
});

export const getRLActionSchema = Joi.object({
  state: Joi.object()
    .unknown(true)
    .required()
    .messages({
      'any.required': 'state es obligatorio',
      'object.base': 'state debe ser un objeto'
    })
});

export const startFLRoundSchema = Joi.object({
  clientIds: Joi.array()
    .items(Joi.string())
    .min(1)
    .required()
    .messages({
      'array.min': 'clientIds debe ser un array no vacío',
      'any.required': 'clientIds es obligatorio'
    }),
  roundNumber: Joi.number().integer().min(0),
  aggregationMethod: Joi.string()
    .valid('fedavg', 'fedprox', 'scaffold')
    .messages({
      'any.only': 'aggregationMethod debe ser fedavg, fedprox o scaffold'
    })
});

export const runFLRoundSchema = Joi.object({
  clientUpdates: Joi.array()
    .items(Joi.object().unknown(true))
    .min(1)
    .required()
    .messages({
      'array.min': 'clientUpdates debe ser un array no vacío',
      'any.required': 'clientUpdates es obligatorio'
    })
});
