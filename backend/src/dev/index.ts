/**
 * Dev-mode route + endpoint orchestrator.
 *
 * Call `applyDevRoutes(app)` from index.ts INSIDE a
 * `if (process.env.NODE_ENV !== 'production')` gate. It mounts every
 * dev-only handler in the correct order:
 *
 *   1. Dev auth + FHIR shims (loose auth, seed users) mounted BEFORE the
 *      production auth/fhir routes so they win.
 *   2. Dev-only inline modules (src/dev/{dashboard,medicalHistories,
 *      appointments,reports,mlMonitoring}Dev) — mounted BEFORE the
 *      production TS routes at the same prefix.
 *   3. Extra route mounts that only exist in dev (symptomReports,
 *      publicAnalytics, simpleAnalytics, mlAnalytics under /api/analytics).
 *   4. Loose system endpoints (`/api/health`, `/api`, `/api/patients`
 *      placeholder) used by the dev/demo frontend.
 *
 * IMPORTANT: applyDevRoutes must be called BEFORE the production
 * initializeRoutes() so that dev routes take precedence at overlapping
 * mount points (Express matches routers in registration order).
 */

import type { Application, Request, Response } from 'express';

// Dev-only route modules
import dashboardDev from './dashboardDev';
import medicalHistoriesDev from './medicalHistoriesDev';
import appointmentsDev from './appointmentsDev';
import reportsDev from './reportsDev';
import { applyMlMonitoringDev } from './mlMonitoringDev';

// Route modules that only get MOUNTED in dev (the modules themselves live
// under src/routes and are TS). In prod these mount paths are either absent
// or served under /api/v1 by the auth-guarded equivalents.
import symptomReportsRoutes from '../routes/symptomReportsRoutes';
import publicAnalyticsRoutes from '../routes/publicAnalyticsRoutes';
import simpleAnalyticsRoutes from '../routes/simpleAnalyticsRoutes';
import mlAnalyticsRoutes from '../routes/mlAnalyticsRoutes';
import chatConversationsRoutes from '../routes/chatConversationsRoutes';

// Dev-only auth + fhir routes are plain CommonJS shims (JWT bypass + seeds).
// Kept as .js by design — they should never load in production.
const authRoutesDev = require('../routes/authRoutesDev');
const fhirRoutesDev = require('../routes/fhirRoutesDev');

export function applyDevRoutes(app: Application): void {
  // -------------------------------------------------------------------------
  // 1. Dev auth + FHIR shims (override production /api/v1/auth + /api/v1/fhir)
  // -------------------------------------------------------------------------
  app.use('/api/v1/auth', authRoutesDev);
  app.use('/api/auth', authRoutesDev); // legacy alias
  app.use('/api/v1/fhir', fhirRoutesDev);

  // -------------------------------------------------------------------------
  // 2. Dev-only inline module handlers (override production TS routes)
  // -------------------------------------------------------------------------
  app.use('/api/v1/dashboard', dashboardDev);
  app.use('/api/v1/medical-histories', medicalHistoriesDev);
  app.use('/api/v1/appointments', appointmentsDev);
  app.use('/api/v1/reports/automatic', reportsDev);
  applyMlMonitoringDev(app);

  // -------------------------------------------------------------------------
  // 3. Extra dev mount paths (prod does not expose these publicly)
  // -------------------------------------------------------------------------
  app.use('/api/symptom-reports', symptomReportsRoutes);
  app.use('/api/analytics', publicAnalyticsRoutes);
  app.use('/api/analytics', simpleAnalyticsRoutes);
  app.use('/api/analytics', mlAnalyticsRoutes);
  app.use('/api/v1/analytics', mlAnalyticsRoutes);
  // chat-conversations is also mounted in prod under the same prefix, but the
  // dev frontend calls it and it's a no-op to re-register.
  app.use('/api/chat-conversations', chatConversationsRoutes);

  // -------------------------------------------------------------------------
  // 4. Loose system endpoints used by dev/demo frontend
  // -------------------------------------------------------------------------
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  });

  app.get('/api', (_req: Request, res: Response) => {
    res.json({
      message: 'RespiCare API',
      version: '1.0.0',
      status: 'operational',
      endpoints: {
        root: '/',
        health: '/api/health',
        info: '/api',
        docs: '/api-docs',
        auth: '/api/v1/auth/*',
        symptomReports: '/api/symptom-reports/*',
        chatConversations: '/api/chat-conversations/*',
        analytics: '/api/analytics/*',
        mlMonitoring: '/api/analytics/ml/monitoring',
      },
    });
  });

  // Placeholder stub — dev frontend calls this occasionally
  app.get('/api/patients', (_req: Request, res: Response) => {
    res.json({ message: 'Patients endpoint', status: 'placeholder', data: [] });
  });

  // GET /api/v1/patients/search?q=<term> — doctor patient lookup
  // El campo `name` está encriptado at-rest, así que el filtro por nombre se hace
  // en memoria sobre los valores desencriptados por el modelo Mongoose. Email/ID
  // sí se filtran en la query. Limit 20 resultados.
  app.get('/api/v1/patients/search', async (req: Request, res: Response) => {
    try {
      const mongoose = require('mongoose') as typeof import('mongoose');
      const UserModel = mongoose.models['User'];
      if (!UserModel) {
        return res.json({ success: true, data: [] });
      }

      const q = String(req.query['q'] ?? '').trim();
      const baseFilter: Record<string, any> = { role: 'patient', isActive: true };

      // ObjectId directo → match único
      if (q && mongoose.Types.ObjectId.isValid(q) && q.length === 24) {
        const one = await UserModel.findOne({ ...baseFilter, _id: new mongoose.Types.ObjectId(q) })
          .select('_id name email createdAt');
        return res.json({ success: true, data: one ? [one.toObject()] : [] });
      }

      // Traer conjunto candidato (email match en DB, resto se filtra en memoria)
      const rx = q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;
      const dbFilter: Record<string, any> = { ...baseFilter };
      if (rx) {
        // Optimización: si q parece email/parcial, filtramos por email en DB;
        // si es cortísimo o alfabético, traemos todos los pacientes activos (~20).
        if (/[@.]/.test(q) || /[a-z]+\.demo/i.test(q)) {
          dbFilter.email = rx;
        }
      }

      const candidates = await UserModel.find(dbFilter)
        .select('_id name email createdAt')
        .limit(100);

      const filtered = rx
        ? candidates.filter((u: any) => rx.test(u.name ?? '') || rx.test(u.email ?? ''))
        : candidates;

      const results = filtered
        .slice(0, 20)
        .map((u: any) => (typeof u.toObject === 'function' ? u.toObject() : u));

      res.json({ success: true, data: results });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Error al buscar pacientes', error: err.message });
    }
  });
}

export default applyDevRoutes;
