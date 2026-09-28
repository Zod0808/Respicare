import { Router } from 'express';
import { query, param, body } from 'express-validator';
import {
  getLabResults,
  getPatientHistory,
  getAbnormalResults,
  getCriticalResults,
  getLatestResult,
  getPatientSummary,
  markAsReviewed,
  flagForReview,
  importAndSaveResults,
  bulkImportResults,
  listAbnormalResults,
  listCriticalResults,
} from '../controllers/labController';
import { authorize } from '../middleware/auth';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate, checkExactBody } from '../middleware/validation';

const router = Router();

const LAB_STATUSES = ['ordered', 'collected', 'processing', 'completed', 'cancelled'] as const;
const LAB_CATEGORIES = ['hematology', 'biochemistry', 'microbiology', 'imaging', 'pulmonary', 'other'] as const;
const INTERPRETATIONS = ['normal', 'low', 'high', 'critical'] as const;

const resultsQueryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('limit debe ser entre 1 y 200'),
  query('status').optional().isIn(LAB_STATUSES).withMessage('status inválido'),
  query('category').optional().isIn(LAB_CATEGORIES).withMessage('category inválida'),
  query('patientId').optional().isMongoId().withMessage('patientId debe ser un ObjectId válido'),
];

const patientIdValidation = [
  param('patientId').isMongoId().withMessage('patientId debe ser un ObjectId válido'),
];

const resultIdValidation = [
  param('resultId').isMongoId().withMessage('resultId debe ser un ObjectId válido'),
];

const flagForReviewValidation = [
  ...resultIdValidation,
  body('reason').optional().isString(),
];

const importExternalValidation = [
  body('patientId').isString().notEmpty().withMessage('patientId es requerido'),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
];

const importValidation = [
  body('results').isArray({ min: 1 }).withMessage('results debe ser un array con al menos un elemento'),
  body('results.*.patientId').isMongoId().withMessage('Cada resultado debe tener un patientId válido'),
  body('results.*.testName').isString().notEmpty().withMessage('testName es requerido'),
  body('results.*.category').isIn(LAB_CATEGORIES).withMessage('category inválida'),
  body('results.*.status').optional().isIn(LAB_STATUSES).withMessage('status inválido'),
  body('results.*.results').optional().isArray(),
  body('results.*.results.*.value').optional().notEmpty(),
  body('results.*.results.*.interpretation').optional().isIn(INTERPRETATIONS).withMessage('interpretation inválida'),
];

/**
 * Rutas de gestión de resultados de laboratorio
 * Requiere autenticación y permisos específicos
 */

// Obtener resultados con filtros
router.get(
  '/results',
  authenticate,
  requirePermission('fhir:read'),
  resultsQueryValidation,
  validate,
  getLabResults,
);

// List all abnormal results across all patients (solo doctor/admin: un
// paciente con permiso fhir:read no debe poder ver resultados de otros)
router.get(
  '/results/abnormal',
  authenticate,
  authorize('doctor', 'admin'),
  listAbnormalResults,
);

// List all critical results (admin only)
router.get(
  '/results/critical',
  authenticate,
  authorize('admin'),
  listCriticalResults,
);

// Historial de exámenes de un paciente
router.get(
  '/results/:patientId/history',
  authenticate,
  requirePermission('fhir:read'),
  patientIdValidation,
  validate,
  getPatientHistory,
);

// Historial de laboratorio (alias con /patients/:patientId/history)
router.get(
  '/patients/:patientId/history',
  authenticate,
  requirePermission('fhir:read'),
  patientIdValidation,
  validate,
  getPatientHistory,
);

// Resultados anormales de un paciente
router.get(
  '/results/:patientId/abnormal',
  authenticate,
  requirePermission('fhir:read'),
  patientIdValidation,
  validate,
  getAbnormalResults,
);

// Resultados críticos de un paciente
router.get(
  '/results/:patientId/critical',
  authenticate,
  requirePermission('fhir:read'),
  patientIdValidation,
  validate,
  getCriticalResults,
);

// Último resultado de un examen específico
router.get(
  '/results/:patientId/latest/:testCode',
  authenticate,
  requirePermission('fhir:read'),
  [
    ...patientIdValidation,
    param('testCode').isString().notEmpty().withMessage('testCode es requerido'),
  ],
  validate,
  getLatestResult,
);

// Resumen de resultados de un paciente
router.get(
  '/results/:patientId/summary',
  authenticate,
  requirePermission('fhir:read'),
  patientIdValidation,
  validate,
  getPatientSummary,
);

// Marcar resultado como revisado
router.post(
  '/results/:resultId/review',
  authenticate,
  requirePermission('fhir:update'),
  resultIdValidation,
  checkExactBody,
  validate,
  markAsReviewed,
);

// Marcar resultado para revisión
router.post(
  '/results/:resultId/flag',
  authenticate,
  requirePermission('fhir:update'),
  flagForReviewValidation,
  checkExactBody,
  validate,
  flagForReview,
);

// Importar (bulk insert) resultados formateados
router.post(
  '/results/import',
  authenticate,
  requirePermission('fhir:create'),
  importValidation,
  checkExactBody,
  validate,
  bulkImportResults,
);

// Importar desde sistema externo (variante que dispara labService.importAndSaveResults)
router.post(
  '/results/import/external',
  authenticate,
  requirePermission('integrations:manage'),
  importExternalValidation,
  checkExactBody,
  validate,
  importAndSaveResults,
);

export default router;

