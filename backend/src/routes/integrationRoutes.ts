import { Router } from 'express';
import {
  importLaboratoryResults,
  importLaboratoryFromHl7,
  syncLaboratoryResults,
  searchDrug,
  checkDrugInteractions,
  getDrugDosage,
  searchGenericDrugs,
  checkContraindications,
} from '../controllers/integrationController';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validateRequest } from '../middleware/validation';
import {
  importLaboratoryResultsSchema,
  importLaboratoryFromHl7Schema,
  syncLaboratoryResultsSchema,
  checkDrugInteractionsSchema,
  checkContraindicationsSchema,
} from '../validators/integrationValidators';

const router = Router();

/**
 * Rutas de integraciones externas
 * Requiere autenticación y permisos específicos
 */

// Rutas de laboratorio
router.post(
  '/laboratory/import',
  authenticate,
  requirePermission('integrations:manage'),
  validateRequest(importLaboratoryResultsSchema),
  importLaboratoryResults,
);

router.post(
  '/laboratory/hl7',
  authenticate,
  requirePermission('integrations:manage'),
  validateRequest(importLaboratoryFromHl7Schema),
  importLaboratoryFromHl7,
);

router.post(
  '/laboratory/sync',
  authenticate,
  requirePermission('integrations:manage'),
  validateRequest(syncLaboratoryResultsSchema),
  syncLaboratoryResults,
);

// Rutas de medicamentos
router.get(
  '/drugs/search',
  authenticate,
  requirePermission('drugs:read'),
  searchDrug,
);

router.post(
  '/drugs/interactions',
  authenticate,
  requirePermission('drugs:read'),
  validateRequest(checkDrugInteractionsSchema),
  checkDrugInteractions,
);

router.get(
  '/drugs/dosage',
  authenticate,
  requirePermission('drugs:read'),
  getDrugDosage,
);

router.get(
  '/drugs/generics',
  authenticate,
  requirePermission('drugs:read'),
  searchGenericDrugs,
);

router.post(
  '/drugs/contraindications',
  authenticate,
  requirePermission('drugs:read'),
  validateRequest(checkContraindicationsSchema),
  checkContraindications,
);

export default router;

