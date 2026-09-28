import Joi from 'joi';

// Los proveedores externos pueden agregar campos a sus payloads sin previo
// aviso, por lo que estos esquemas solo exigen los campos que el controlador
// realmente usa y no rechazan campos desconocidos (allowUnknown: true).

export const twilioWebhookSchema = Joi.object({
  MessageSid: Joi.string()
    .required()
    .messages({
      'any.required': 'MessageSid es requerido'
    }),
  MessageStatus: Joi.string(),
  To: Joi.string(),
  From: Joi.string(),
  ErrorCode: Joi.string(),
  ErrorMessage: Joi.string(),
  Price: Joi.string(),
  PriceUnit: Joi.string()
}).unknown(true);

export const awsSnsWebhookSchema = Joi.object({
  Type: Joi.string(),
  SubscribeURL: Joi.string(),
  Message: Joi.string()
}).unknown(true);

export const messageBirdWebhookSchema = Joi.object({
  id: Joi.string()
    .required()
    .messages({
      'any.required': 'id es requerido'
    }),
  status: Joi.string(),
  recipient: Joi.alternatives().try(Joi.string(), Joi.number()),
  originator: Joi.alternatives().try(Joi.string(), Joi.number()),
  error: Joi.any(),
  price: Joi.object().unknown(true)
}).unknown(true);
