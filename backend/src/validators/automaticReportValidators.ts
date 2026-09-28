import Joi from 'joi';

export const generateReportSchema = Joi.object({
  reportType: Joi.string()
    .valid('daily', 'weekly', 'monthly')
    .required()
    .messages({
      'any.only': 'Tipo de reporte no válido',
      'any.required': 'reportType es obligatorio'
    }),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  includeAnomalies: Joi.boolean(),
  autoExport: Joi.boolean(),
  exportFormat: Joi.string().valid('pdf', 'csv', 'json')
});

export const exportReportSchema = Joi.object({
  format: Joi.string()
    .valid('pdf', 'csv', 'json')
    .messages({
      'any.only': 'Formato de exportación no válido'
    })
});
