/**
 * Nombre de Objeto: dsrRoutes
 * Fecha de Creación: 2026-04-25
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: Funcionalidad adicional (no documentada en RF-001 a RF-014) -
 * consentimiento informado y derechos sobre datos (DSR)
 * Descripción: Rutas REST de DSR (derechos sobre datos del paciente).
 */

import { Router } from 'express';
import { auth } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { exportUserData, deleteUserData } from '../controllers/dsrController';

const router = Router();

router.use(auth);

// Exportación de datos (admin)
router.get('/export/:userId', requirePermission('dsr:export'), exportUserData);

// Borrado de datos (admin) con doble confirmación
router.delete('/delete/:userId', requirePermission('dsr:delete'), deleteUserData);

export default router;


