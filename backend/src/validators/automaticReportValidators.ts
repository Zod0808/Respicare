/**
 * Nombre de Objeto: automaticReportValidators
 * Fecha de Creación: 2026-09-28
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-010 - Reportes y estadísticas
 * Descripción: Valida los payloads de generación (tipo daily/weekly/monthly,
 * rango de fechas, exportación automática) y exportación (pdf/csv/json) de
 * reportes automáticos antes de llegar al controlador.
 */
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
