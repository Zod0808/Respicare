/**
 * Nombre de Objeto: chatImageValidators
 * Fecha de Creación: 2026-09-28
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-002 - Diagnóstico inteligente de síntomas (análisis de
 * imágenes clínicas: radiografía/TC de tórax, espirometría, oximetría,
 * esputo, erupción cutánea, cianosis); no aparece como objeto propio en la
 * Matriz de Trazabilidad.
 * Descripción: Valida el payload de análisis de imagen clínica (imagen
 * codificada, tipo de imagen, sessionId opcional) enviado al motor de IA.
 */
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
