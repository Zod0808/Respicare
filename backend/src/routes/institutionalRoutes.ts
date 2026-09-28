import { Router } from 'express';
import {
  getEpidemiologicalExport,
  syncHealthCenters,
  ingestAlert,
} from '../controllers/institutionalController';
import {
  authenticateInstitutional,
  requireInstitutionalScope,
  institutionalRateLimiter,
} from '../middleware/institutionalAuth';
import { validateRequest } from '../middleware/validation';
import { syncHealthCentersSchema, ingestAlertSchema } from '../validators/institutionalValidators';

const router = Router();

// Todas las rutas institucionales usan API key (no JWT) y rate limiting dedicado.
router.use(institutionalRateLimiter);
router.use(authenticateInstitutional);

router.get(
  '/epidemiological-export',
  requireInstitutionalScope('epidemiological:read'),
  getEpidemiologicalExport
);

router.post(
  '/health-centers/sync',
  requireInstitutionalScope('health-centers:write'),
  validateRequest(syncHealthCentersSchema),
  syncHealthCenters
);

router.post(
  '/alerts',
  requireInstitutionalScope('alerts:write'),
  validateRequest(ingestAlertSchema),
  ingestAlert
);

export default router;
