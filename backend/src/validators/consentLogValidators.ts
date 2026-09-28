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
