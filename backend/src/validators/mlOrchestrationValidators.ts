/**
 * Nombre de Objeto: mlOrchestrationValidators
 * Fecha de Creación: 2026-09-28
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-002/RF-006 - Diagnóstico inteligente y explicabilidad
 * del modelo (mejora continua vía orquestación de sesiones de Reinforcement
 * Learning y Federated Learning); no tiene un RF numerado propio en el SRS.
 * Descripción: Valida el inicio/entrenamiento de sesiones RL, la solicitud
 * de acciones RL y el inicio/ejecución de rondas de Federated Learning
 * (clientes, método de agregación).
 */
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
