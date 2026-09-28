import Joi from 'joi';

export const analyzeImageSchema = Joi.object({
  image: Joi.string()
    .required()
    .messages({
      'any.required': 'No se proporcionó imagen'
    }),
  image_type: Joi.string()
    .valid('chest_xray', 'chest_ct', 'spirometry', 'oximetry', 'sputum', 'skin_rash', 'cyanosis', 'other')
    .required()
    .messages({
      'any.required': 'Tipo de imagen es requerido',
      'any.only': 'Tipo de imagen no válido'
    }),
  sessionId: Joi.string()
});
