/**
 * Nombre de Objeto: consentLogValidators
 * Fecha de Creación: 2026-09-28
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RNF — Cumplimiento legal de datos de salud (consentimiento
 * informado digital, Ley N.º 29733 de Protección de Datos Personales); no
 * tiene un RF numerado propio en el SRS.
 * Descripción: Valida el registro (lista de consentimientos aceptados con
 * versión) y la revocación (motivo opcional) de consentimientos informados
 * del paciente.
 */
import Joi from 'joi';

export const registerConsentSchema = Joi.object({
  consents: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required().messages({ 'any.required': 'id es obligatorio' }),
        accepted: Joi.boolean().required().messages({ 'any.required': 'accepted es obligatorio' }),
        timestamp: Joi.date().iso(),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Se requiere al menos un consentimiento',
      'any.required': 'consents es obligatorio',
    }),
  version: Joi.string(),
});

export const revokeConsentSchema = Joi.object({
  reason: Joi.string().allow('').optional(),
});
