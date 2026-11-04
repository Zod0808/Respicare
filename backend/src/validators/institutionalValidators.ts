/**
 * Nombre de Objeto: institutionalValidators
 * Fecha de Creación: 2026-09-28
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-013 - Interoperabilidad institucional (MINSA/DIRESA/SINADEF)
 * Descripción: Valida la sincronización por lote de centros de salud y la
 * ingesta de alertas externas (título, mensaje, prioridad, distrito)
 * provenientes de autoridades sanitarias.
 */
import Joi from 'joi';

// Los campos individuales no se marcan required: institutionalIntegrationService
// valida cada registro por separado y acumula errores por item sin bloquear el
// lote completo, así que aquí solo se valida el tipo/forma cuando el campo está presente.
const healthCenterSchema = Joi.object({
  name: Joi.string(),
  type: Joi.string().valid('hospital', 'centro_salud', 'posta_medica', 'clinica'),
  address: Joi.string(),
  district: Joi.string(),
  phone: Joi.string(),
  hasEmergencyServices: Joi.boolean(),
  hasRespiratoryCare: Joi.boolean(),
  latitude: Joi.number(),
  longitude: Joi.number(),
}).messages({
  'any.only': 'type debe ser uno de: hospital, centro_salud, posta_medica, clinica',
});

export const syncHealthCentersSchema = Joi.object({
  centers: Joi.array()
    .items(healthCenterSchema)
    .min(1)
    .required()
    .messages({
      'array.min': 'Se requiere un arreglo "centers" no vacío',
      'any.required': 'centers es obligatorio',
    }),
});

export const ingestAlertSchema = Joi.object({
  title: Joi.string()
    .required()
    .messages({ 'any.required': 'title es obligatorio' }),
  message: Joi.string()
    .required()
    .messages({ 'any.required': 'message es obligatorio' }),
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'critical')
    .messages({ 'any.only': 'priority debe ser low, medium, high o critical' }),
  district: Joi.string(),
  referenceId: Joi.string(),
});
