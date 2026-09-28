import Joi from 'joi';

export const createConversationSchema = Joi.object({
  userId: Joi.string(),
  userInfo: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string(),
    age: Joi.number().integer().min(0).max(120),
    gender: Joi.string()
  }),
  location: Joi.object({
    district: Joi.string(),
    city: Joi.string(),
    country: Joi.string()
  }),
  metadata: Joi.object({
    language: Joi.string(),
    source: Joi.string().valid('web', 'mobile')
  })
});

export const addMessageSchema = Joi.object({
  role: Joi.string()
    .valid('user', 'bot')
    .required()
    .messages({
      'any.only': 'role debe ser user o bot',
      'any.required': 'role es obligatorio'
    }),
  content: Joi.string()
    .required()
    .messages({
      'any.required': 'content es obligatorio'
    }),
  metadata: Joi.object({
    urgencyLevel: Joi.string(),
    confidence: Joi.number(),
    detectedDiseases: Joi.array().items(Joi.string()),
    detectedSymptoms: Joi.array().items(Joi.string()),
    questionType: Joi.string()
  })
});
