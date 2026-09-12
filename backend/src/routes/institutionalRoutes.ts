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
  syncHealthCenters
);

router.post(
  '/alerts',
  requireInstitutionalScope('alerts:write'),
  ingestAlert
);

export default router;
