/**
 * Institutional Controller (Sprint 13)
 *
 * Endpoints del API de interoperabilidad institucional para MINSA/DIRESA
 * Tacna y SINADEF, autenticados mediante API key (ver middleware/institutionalAuth.ts).
 */

import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import institutionalIntegrationService from '../services/institutionalIntegrationService';
import { InstitutionalRequest } from '../middleware/institutionalAuth';

/**
 * @swagger
 * tags:
 *   name: Institutional (MINSA/SINADEF)
 *   description: API de interoperabilidad para autoridades sanitarias externas
 */

/**
 * @swagger
 * /institutional/epidemiological-export:
 *   get:
 *     summary: Exportación epidemiológica agregada por distrito (Tacna)
 *     tags: [Institutional (MINSA/SINADEF)]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: Ventana de días a analizar (por defecto 30)
 *     responses:
 *       200:
 *         description: Tendencias por distrito y alertas de brotes detectados
 */
export const getEpidemiologicalExport = asyncHandler(async (req: InstitutionalRequest, res: Response) => {
  const days = req.query.days ? Number(req.query.days) : undefined;
  const data = await institutionalIntegrationService.getEpidemiologicalExport({ days });

  logger.info('Exportación epidemiológica institucional solicitada', {
    clientId: req.institutionalClient?.id,
    clientName: req.institutionalClient?.name,
  });

  res.status(200).json({ success: true, data });
});

/**
 * @swagger
 * /institutional/health-centers/sync:
 *   post:
 *     summary: Sincroniza el catálogo de centros de salud (upsert por nombre+distrito)
 *     tags: [Institutional (MINSA/SINADEF)]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Resultado de la sincronización (creados/actualizados/errores)
 */
export const syncHealthCenters = asyncHandler(async (req: InstitutionalRequest, res: Response) => {
  const result = await institutionalIntegrationService.syncHealthCenters(req.body?.centers);

  logger.info('Sincronización institucional de centros de salud solicitada', {
    clientId: req.institutionalClient?.id,
    ...result,
  });

  res.status(200).json({ success: true, data: result });
});

/**
 * @swagger
 * /institutional/alerts:
 *   post:
 *     summary: Recibe una alerta sanitaria regional y la distribuye al personal médico/administrativo activo
 *     tags: [Institutional (MINSA/SINADEF)]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       201:
 *         description: Alerta distribuida
 */
export const ingestAlert = asyncHandler(async (req: InstitutionalRequest, res: Response) => {
  const result = await institutionalIntegrationService.ingestExternalAlert(req.body, {
    id: req.institutionalClient!.id,
    name: req.institutionalClient!.name,
  });

  res.status(201).json({ success: true, data: result });
});
