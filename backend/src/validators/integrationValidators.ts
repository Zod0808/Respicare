/**
 * Nombre de Objeto: integrationValidators
 * Fecha de Creación: 2026-09-28
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-013 - Interoperabilidad institucional (importación de
 * resultados de laboratorio externos) y RF-007 - Panel del doctor
 * (verificación de interacciones/contraindicaciones de fármacos); no
 * aparece como objeto propio en la Matriz de Trazabilidad.
 * Descripción: Valida la importación/sincronización de resultados de
 * laboratorio (directa o vía HL7) y las consultas de interacciones y
 * contraindicaciones de medicamentos contra el contexto clínico del paciente.
 */
import Joi from 'joi';

export const importLaboratoryResultsSchema = Joi.object({
  patientId: Joi.string()
    .required()
    .messages({
      'any.required': 'patientId es obligatorio'
    }),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso()
});

export const importLaboratoryFromHl7Schema = Joi.object({
  hl7Message: Joi.string()
    .required()
    .messages({
      'any.required': 'hl7Message es obligatorio'
    })
});

export const syncLaboratoryResultsSchema = Joi.object({
  patientId: Joi.string()
    .required()
    .messages({
      'any.required': 'patientId es obligatorio'
    })
});

export const checkDrugInteractionsSchema = Joi.object({
  drugs: Joi.array()
    .items(Joi.string())
    .min(2)
    .required()
    .messages({
      'array.min': 'Se requieren al menos 2 medicamentos',
      'any.required': 'drugs es obligatorio'
    })
});

export const checkContraindicationsSchema = Joi.object({
  drugName: Joi.string()
    .required()
    .messages({
      'any.required': 'drugName es obligatorio'
    }),
  patientContext: Joi.object({
    age: Joi.number().integer().min(0).max(120),
    weight: Joi.number().min(0).max(400),
    conditions: Joi.array().items(Joi.string()),
    allergies: Joi.array().items(Joi.string()),
    currentMedications: Joi.array().items(Joi.string())
  })
    .required()
    .messages({
      'any.required': 'patientContext es obligatorio'
    })
});
