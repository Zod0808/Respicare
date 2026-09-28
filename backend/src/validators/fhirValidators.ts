import Joi from 'joi';

const RESOURCE_TYPES_WITH_VALIDATOR = [
  'Patient',
  'Observation',
  'Condition',
  'Medication',
  'MedicationStatement',
  'Procedure',
  'DiagnosticReport',
  'Encounter',
  'AllergyIntolerance',
  'Immunization',
];

export const syncFromHospitalSchema = Joi.object({
  patientId: Joi.string()
    .required()
    .messages({
      'any.required': 'El ID del paciente es obligatorio'
    }),
  resourceTypes: Joi.array()
    .items(Joi.string().valid(...RESOURCE_TYPES_WITH_VALIDATOR))
    .messages({
      'any.only': 'resourceTypes debe contener tipos de recurso FHIR válidos'
    })
});

export const syncToHospitalSchema = Joi.object({
  patientId: Joi.string()
    .required()
    .messages({
      'any.required': 'El ID del paciente es obligatorio'
    }),
  resources: Joi.array()
    .items(Joi.object({ resourceType: Joi.string().required() }).unknown(true))
    .min(1)
    .required()
    .messages({
      'array.min': 'resources debe ser un array no vacío',
      'any.required': 'resources es obligatorio'
    })
});

export const syncBidirectionalSchema = syncFromHospitalSchema;

export const parseHl7Schema = Joi.object({
  message: Joi.string()
    .required()
    .messages({
      'any.required': 'El mensaje HL7 es obligatorio'
    }),
  format: Joi.string()
    .valid('v2', 'v3', 'xml')
    .messages({
      'any.only': 'format debe ser v2, v3 o xml'
    })
});
